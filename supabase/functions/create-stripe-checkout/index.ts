import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';
import { rateLimit, getClientIp } from '../_shared/rate-limit.ts';

const ALLOWED_ORIGIN = Deno.env.get('ALLOWED_ORIGIN') || 'https://wed-moment-capture.vercel.app';

// Product IDs from Stripe Dashboard (set via Supabase secrets for prod)
const PRODUCT_IDS: Record<string, string> = {
    basico:   Deno.env.get('STRIPE_PRODUCT_BASICO')   || '',
    standard: Deno.env.get('STRIPE_PRODUCT_STANDARD') || '',
    premium:  Deno.env.get('STRIPE_PRODUCT_PREMIUM')  || '',
};

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

const SAFE_ERRORS = [
    'Missing planType or email', 'Invalid plan type', 'Event not found',
    'Unauthorized: missing token', 'Unauthorized: anon key not accepted',
    'Unauthorized: invalid token', 'Unauthorized: you do not own this event',
    'Too many requests. Try again later.',
];
function safeError(msg: string) {
    return SAFE_ERRORS.includes(msg) ? msg : 'Erro interno. Tente novamente.';
}

serve(async (req) => {
    const origin = req.headers.get('origin');
    const headers = buildCorsHeaders(origin);

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers });
    }

    // Rate limit: 10 checkout requests per minute per IP
    const { allowed, headers: rlHeaders } = rateLimit(getClientIp(req), 10, 60_000);
    if (!allowed) {
        return new Response(
            JSON.stringify({ error: 'Too many requests. Try again later.' }),
            { headers: { ...headers, ...rlHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
    }

    try {
        const { eventId, planType } = await req.json();

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

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // SECURITY: Require valid JWT — unauthenticated calls are rejected
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            throw new Error('Unauthorized: missing token');
        }
        const token = authHeader.replace('Bearer ', '');
        const supabaseAnonKey = Deno.env.get('ANON_KEY') || '';
        if (token === supabaseAnonKey) {
            throw new Error('Unauthorized: anon key not accepted');
        }
        const anonClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user: authUser }, error: authError } = await anonClient.auth.getUser(token);
        if (authError || !authUser) {
            throw new Error('Unauthorized: invalid token');
        }
        const authenticatedUserId = authUser.id;

        // Get event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, name, user_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            throw new Error('Event not found');
        }

        // SECURITY: Validate that the authenticated user owns this event
        if (event.user_id !== authenticatedUserId) {
            throw new Error('Unauthorized: you do not own this event');
        }

        // Check if subscription already exists for this event
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('event_id', eventId)
            .single();

        // If subscription already exists and has a checkout session, return existing URL
        if (existingSubscription && existingSubscription.metadata?.checkout_session_id) {
            const existingSessionId = existingSubscription.metadata.checkout_session_id;

            try {
                // Try to retrieve the existing session
                const existingSession = await stripe.checkout.sessions.retrieve(existingSessionId);

                // If session is still valid and not expired, return it
                if (existingSession.url && existingSession.status !== 'expired') {
                    return new Response(
                        JSON.stringify({
                            subscriptionId: existingSubscription.id,
                            checkoutUrl: existingSession.url,
                            sessionId: existingSessionId,
                        }),
                        {
                            headers: { ...headers, 'Content-Type': 'application/json' },
                            status: 200,
                        }
                    );
                }
            } catch (sessionError) {
                // If can't retrieve session, continue to create new one
            }
        }

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
        if (productId) {
            priceData.product = productId;
            delete (priceData as any).product_data;
        }

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: priceData as any,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${isTestMode ? 'http://localhost:8080' : (Deno.env.get('FRONTEND_URL') || 'https://wed-moment-capture.vercel.app')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${isTestMode ? 'http://localhost:8080' : (Deno.env.get('FRONTEND_URL') || 'https://wed-moment-capture.vercel.app')}/plans`,
            metadata: {
                event_id: eventId,
                plan_type: planType,
                user_id: authenticatedUserId,
            },
        });

        // Create or update subscription record
        const subscriptionData = {
            event_id: eventId,
            user_id: event.user_id,
            plan_type: planType,
            status: 'pending',
            payment_gateway: 'stripe',
            external_subscription_id: session.id,
            amount: plan.amount / 100,
            currency: 'BRL',
            metadata: {
                checkout_session_id: session.id,
            },
        };

        let subscription;
        if (existingSubscription) {
            // Update existing subscription
            const { data: updatedSub, error: updateError } = await supabase
                .from('subscriptions')
                .update(subscriptionData)
                .eq('id', existingSubscription.id)
                .select()
                .single();

            if (updateError) {
                console.error('Subscription update error:', updateError);
                throw new Error('Failed to update subscription');
            }
            subscription = updatedSub;
        } else {
            // Create new subscription
            const { data: newSub, error: subError } = await supabase
                .from('subscriptions')
                .insert(subscriptionData)
                .select()
                .single();

            if (subError) {
                console.error('Subscription creation error:', subError);
                throw new Error('Failed to create subscription');
            }
            subscription = newSub;
        }

        return new Response(
            JSON.stringify({
                subscriptionId: subscription.id,
                checkoutUrl: session.url,
                sessionId: session.id,
            }),
            {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error: any) {
        console.error('Error in create-stripe-checkout:', error);
        return new Response(
            JSON.stringify({ error: safeError(error.message) }),
            {
                headers: { ...headers, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
