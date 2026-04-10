import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'npm:stripe@14.11.0';
import { rateLimit, getClientIp } from '../_shared/rate-limit.ts';

const FRONTEND_URL = Deno.env.get('FRONTEND_URL') || 'https://wed-moment-capture.vercel.app';
const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://wed-moment-capture.vercel.app';

// Product IDs from Stripe Dashboard (set via Supabase secrets for prod,
// leave unset locally to fall back to inline price_data without product link)
const PRODUCT_IDS: Record<string, string> = {
    basico:   Deno.env.get('STRIPE_PRODUCT_BASICO')   || '',
    standard: Deno.env.get('STRIPE_PRODUCT_STANDARD') || '',
    premium:  Deno.env.get('STRIPE_PRODUCT_PREMIUM')  || '',
};

function corsHeaders(origin: string | null) {
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

// Only forward safe, user-facing error messages to the client
const SAFE_ERRORS = ['Missing planType or email', 'Invalid plan type', 'Too many requests. Try again later.'];
function safeError(msg: string) {
    return SAFE_ERRORS.includes(msg) ? msg : 'Erro interno. Tente novamente.';
}

serve(async (req) => {
    const origin = req.headers.get('origin');
    const headers = corsHeaders(origin);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers });
    }

    // Rate limit: 10 guest checkout requests per minute per IP
    const { allowed, headers: rlHeaders } = rateLimit(getClientIp(req), 10, 60_000);
    if (!allowed) {
        return new Response(
            JSON.stringify({ error: 'Too many requests. Try again later.' }),
            { headers: { ...headers, ...rlHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
    }

    try {
        const { planType, email } = await req.json();

        if (!planType || !email) {
            throw new Error('Missing planType or email');
        }

        const isTestMode = origin && origin.startsWith('http://localhost:');
        const secretKey = isTestMode 
            ? Deno.env.get('STRIPE_SECRET_KEY_TEST') 
            : Deno.env.get('STRIPE_SECRET_KEY');

        if (!secretKey) {
            throw new Error('Stripe API key not configured');
        }

        // Initialize Stripe
        const stripe = new Stripe(secretKey, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Plan prices — linked to Stripe Dashboard products when STRIPE_PRODUCT_* env vars are set
        const PLAN_PRICES: Record<string, { amount: number; name: string }> = {
            basico:   { amount: 2990,  name: 'Lume — Plano Básico' },
            standard: { amount: 4990,  name: 'Lume — Plano Standard' },
            premium:  { amount: 9990,  name: 'Lume — Plano Premium' },
        };

        const plan = PLAN_PRICES[planType as keyof typeof PLAN_PRICES];
        if (!plan) {
            throw new Error('Invalid plan type');
        }

        const testProductId = Deno.env.get(`STRIPE_PRODUCT_${planType.toUpperCase()}_TEST`);
        const prodProductId = PRODUCT_IDS[planType];
        const productId = isTestMode ? testProductId : prodProductId;

        const priceData: Record<string, unknown> = {
            currency: 'brl',
            unit_amount: plan.amount,
            product_data: { name: plan.name },
        };
        // In production, link to the existing Stripe product
        if (productId) {
            priceData.product = productId;
            delete (priceData as any).product_data;
        }

        // Create Checkout Session for GUEST (no user_id yet)
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: priceData as any,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: email,
            success_url: `${isTestMode ? 'http://localhost:8080' : FRONTEND_URL}/register?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${isTestMode ? 'http://localhost:8080' : FRONTEND_URL}/#pricing`,
            metadata: {
                plan_type: planType,
                checkout_type: 'guest',
            },
        });

        return new Response(
            JSON.stringify({
                checkoutUrl: session.url,
                sessionId: session.id,
            }),
            {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error: any) {
        console.error('Error in create-guest-checkout:', error);
        return new Response(
            JSON.stringify({ error: safeError(error.message) }),
            {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
