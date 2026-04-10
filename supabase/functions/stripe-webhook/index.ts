import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

// --- Telegram notification helper ---
async function sendTelegramNotification(message: string) {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
    if (!botToken || !chatId) return;

    try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
        });
    } catch {
        // Never block webhook due to notification failure
    }
}

const PLAN_NAMES: Record<string, string> = {
    basico: 'Básico',
    standard: 'Standard',
    premium: 'Premium',
};

serve(async (req) => {
    // REGRA DE OURO: Sempre retornar 200 para o Stripe (exceto assinatura inválida).
    // Se retornarmos 400/500, o Stripe fica tentando novamente e pode desativar o endpoint.

    const signature = req.headers.get('stripe-signature');
    if (!signature) {
        return new Response('No signature', { status: 400 });
    }

    const body = await req.text();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
    });

    // Verificar assinatura — única razão legítima para retornar 400
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return new Response(`Webhook signature error: ${err.message}`, { status: 400 });
    }

    // A partir daqui: SEMPRE retornar 200. Erros internos são logados mas não impedem o ACK.
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            const userId = session.metadata?.user_id;
            const planType = session.metadata?.plan_type;
            const checkoutType = session.metadata?.checkout_type;

            if (!planType) {
                console.error('❌ Missing plan_type in metadata — ignoring event');
                return new Response(JSON.stringify({ received: true, skipped: 'no_plan_type' }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            const amount = (session.amount_total! / 100).toFixed(2);
            const planName = PLAN_NAMES[planType] || planType;
            const email = session.customer_email || session.metadata?.email || 'N/A';
            const now = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

            // GUEST CHECKOUT - Create pending subscription
            if (checkoutType === 'guest' || !userId) {

                // IDEMPOTÊNCIA: não processar o mesmo session_id duas vezes
                const { data: existing } = await supabase
                    .from('pending_subscriptions')
                    .select('id')
                    .eq('session_id', session.id)
                    .maybeSingle();

                if (existing) {
                    console.log(`ℹ️ Session ${session.id} already processed — skipping duplicate`);
                    return new Response(JSON.stringify({ received: true, duplicate: true }), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    });
                }

                try {
                    const { error: pendingError } = await supabase
                        .from('pending_subscriptions')
                        .insert({
                            session_id: session.id,
                            email: session.customer_email!,
                            plan_type: planType,
                            status: 'pending_registration',
                            payment_gateway: 'stripe',
                            amount: session.amount_total! / 100,
                            currency: (session.currency || 'BRL').toUpperCase(),
                            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                            metadata: { session_id: session.id, payment_intent: session.payment_intent },
                        });

                    if (pendingError) {
                        console.error('⚠️ Error creating pending subscription (non-fatal):', pendingError.message);
                    }
                } catch (dbErr: any) {
                    console.error('⚠️ DB error on pending_subscriptions insert (non-fatal):', dbErr.message);
                }

                await sendTelegramNotification(
                    `🎉 <b>Nova Venda (Visitante)!</b>\n\n` +
                    `📋 Plano: <b>${planName}</b>\n` +
                    `💰 Valor: <b>R$ ${amount}</b>\n` +
                    `📧 Email: ${email}\n` +
                    `⏳ Aguardando cadastro\n` +
                    `📅 ${now}`
                );

                return new Response(JSON.stringify({ received: true, pending: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // AUTHENTICATED CHECKOUT - Update user plan directly
            try {
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ plan: planType })
                    .eq('id', userId);

                if (updateError) {
                    console.error('⚠️ Error updating profile plan (non-fatal):', updateError.message);
                }
            } catch (dbErr: any) {
                console.error('⚠️ DB error on profile update (non-fatal):', dbErr.message);
            }

            // Record subscription (non-fatal)
            try {
                await supabase
                    .from('pending_subscriptions')
                    .insert({
                        session_id: session.id,
                        email: session.customer_email || '',
                        plan_type: planType,
                        status: 'completed',
                        payment_gateway: 'stripe',
                        amount: session.amount_total! / 100,
                        currency: (session.currency || 'BRL').toUpperCase(),
                        metadata: { user_id: userId, session_id: session.id, payment_intent: session.payment_intent },
                    });
            } catch (dbErr: any) {
                console.error('⚠️ Could not record subscription (non-fatal):', dbErr.message);
            }

            await sendTelegramNotification(
                `🎉 <b>Nova Venda!</b>\n\n` +
                `📋 Plano: <b>${planName}</b>\n` +
                `💰 Valor: <b>R$ ${amount}</b>\n` +
                `📧 Email: ${email}\n` +
                `✅ Assinatura ativada\n` +
                `📅 ${now}`
            );
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        // Erro interno inesperado — ainda retornamos 200 para o Stripe não desativar o endpoint
        console.error('❌ Webhook internal error (returning 200):', error.message);
        return new Response(JSON.stringify({ received: true, internal_error: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
});
