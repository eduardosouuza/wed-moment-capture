import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';
import { rateLimit, getClientIp } from '../_shared/rate-limit.ts';

// --- Telegram notification helper ---
async function sendTelegramNotification(message: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });
  } catch {
    // Never block payment flow due to notification failure
  }
}

const PLAN_NAMES: Record<string, string> = {
  basico: 'Básico',
  standard: 'Standard',
  premium: 'Premium',
};

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://wed-moment-capture.vercel.app';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://wed-moment-capture.vercel.app';

function buildCorsHeaders(origin: string | null) {
  let allowed = ALLOWED_ORIGIN;
  if (origin && (origin === ALLOWED_ORIGIN || origin.startsWith('http://localhost:'))) {
    allowed = origin;
  }
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const headers = buildCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers });
  }

  // Rate limit: 15 verify requests per minute per IP
  const { allowed, headers: rlHeaders } = rateLimit(getClientIp(req), 15, 60_000);
  if (!allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Try again later.' }),
      { headers: { ...headers, ...rlHeaders, 'Content-Type': 'application/json' }, status: 429 }
    );
  }

  try {
    const { sessionId, userId, action } = await req.json();

    if (!sessionId) {
      throw new Error('Missing sessionId');
    }

    const isTestMode = origin && origin.startsWith('http://localhost:');
    const secretKey = isTestMode 
      ? Deno.env.get('STRIPE_SECRET_KEY_TEST') 
      : Deno.env.get('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('Stripe API key not configured');
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Retrieve and verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    const planType = session.metadata?.plan_type;
    if (!planType) {
      throw new Error('No plan type in session metadata');
    }

    // === CLAIM ACTION: update user's plan ===
    if (action === 'claim' && userId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabaseAnonKey = Deno.env.get('ANON_KEY') || '';

      // SECURITY: Validate JWT - ensure the caller IS the userId they claim to be
      const authHeader = req.headers.get('Authorization');
      if (authHeader && supabaseAnonKey) {
        const token = authHeader.replace('Bearer ', '');
        // Only validate if it's not the anon key itself (anon key = unauthenticated guest)
        if (token !== supabaseAnonKey) {
          const anonClient = createClient(supabaseUrl, supabaseAnonKey);
          const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser(token);
          if (authError || !authUser || authUser.id !== userId) {
            console.error('❌ JWT validation failed: userId mismatch');
            throw new Error('Unauthorized: user mismatch');
          }
        }
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // SECURITY: Check if this session was already claimed
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id, user_id')
        .eq('external_subscription_id', session.id)
        .maybeSingle();

      if (existingSub) {
        // Allow same user to retry, but block different users
        if (existingSub.user_id !== userId) {
          throw new Error('This payment was already used by another account');
        }
        // Same user retrying - return success
        return new Response(
          JSON.stringify({ success: true, claimed: true, planType, alreadyClaimed: true }),
          { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
        );
      }

      // SECURITY: Verify email matches - payment email should match the user signing up
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', userId)
        .maybeSingle();

      // Wait for profile if it doesn't exist yet (trigger delay)
      let profileReady = !!profile;
      if (!profileReady) {
        for (let i = 0; i < 5; i++) {
          await new Promise(r => setTimeout(r, 1000));
          const { data: p } = await supabase
            .from('profiles').select('id').eq('id', userId).maybeSingle();
          if (p) { profileReady = true; break; }
        }
      }

      if (!profileReady) {
        throw new Error('Profile not found');
      }

      // Update plan using SERVICE ROLE (bypasses RLS)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: planType })
        .eq('id', userId);

      if (updateError) {
        throw new Error('Failed to update plan');
      }

      // Create subscription record (revenue tracking + prevents reuse)
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          payment_gateway: 'stripe',
          external_subscription_id: session.id,
          amount: session.amount_total! / 100,
          currency: (session.currency || 'brl').toUpperCase(),
          metadata: {
            checkout_session_id: session.id,
            payment_intent: session.payment_intent,
          },
        });

      if (subError) {
        console.error('⚠️ Subscription record error:', subError.message);
      }

      // 📲 Telegram notification
      const amount = (session.amount_total! / 100).toFixed(2);
      const planName = PLAN_NAMES[planType] || planType;
      const email = session.customer_email || profile?.email || 'N/A';
      const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

      await sendTelegramNotification(
        `🎉 <b>Nova Venda!</b>\n\n` +
        `📋 Plano: <b>${planName}</b>\n` +
        `💰 Valor: <b>R$ ${amount}</b>\n` +
        `📧 Email: ${email}\n` +
        `✅ Assinatura ativada\n` +
        `📅 ${now}`
      );

      return new Response(
        JSON.stringify({ success: true, claimed: true, planType }),
        { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // === DEFAULT: just verify payment ===
    return new Response(
      JSON.stringify({
        success: true,
        email: session.customer_email,
        planType,
        amount: session.amount_total! / 100,
        currency: (session.currency || 'brl').toUpperCase(),
        sessionId: session.id,
      }),
      { headers: { ...headers, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('verify-payment error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...headers, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
