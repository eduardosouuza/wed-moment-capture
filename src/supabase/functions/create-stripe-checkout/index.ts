import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Validate authenticated user from JWT
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const { eventId, planType } = await req.json();

        const VALID_PLANS = ['basico', 'standard', 'premium'];
        if (!planType || !VALID_PLANS.includes(planType)) {
            return new Response(JSON.stringify({ error: 'Invalid plan type' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Initialize Supabase with service role (for DB ops) and user client (for auth)
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Validate user JWT and get user ID from token (not from request body)
        const userSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
            global: { headers: { Authorization: authHeader } },
        });
        const { data: { user }, error: authError } = await userSupabase.auth.getUser();
        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }
        const authenticatedUserId = user.id;

        // Get event
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('id, name, user_id')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            throw new Error('Event not found');
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
                    console.log('Returning existing checkout session:', existingSessionId);
                    return new Response(
                        JSON.stringify({
                            subscriptionId: existingSubscription.id,
                            checkoutUrl: existingSession.url,
                            sessionId: existingSessionId,
                        }),
                        {
                            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                            status: 200,
                        }
                    );
                }
            } catch (sessionError) {
                console.log('Existing session not valid, creating new one');
                // If can't retrieve session, continue to create new one
            }
        }

        // Map plan to Stripe product
        const STRIPE_PRODUCTS = {
            basico: 'prod_TjTCDpUrRkavAM',
            standard: 'prod_TjTDVc7Wc34cRv',
            premium: 'prod_TjTFDry4kNKPbO',
        };

        const productId = STRIPE_PRODUCTS[planType as keyof typeof STRIPE_PRODUCTS];

        // Get price for product
        const prices = await stripe.prices.list({
            product: productId,
            active: true,
            limit: 1,
        });

        if (prices.data.length === 0) {
            throw new Error('No price found for product');
        }

        const price = prices.data[0];

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${Deno.env.get('FRONTEND_URL')}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${Deno.env.get('FRONTEND_URL')}/plans`,
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
            amount: price.unit_amount! / 100,
            currency: price.currency.toUpperCase(),
            metadata: {
                checkout_session_id: session.id,
                product_id: productId,
                price_id: price.id,
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
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error: any) {
        console.error('Error in create-stripe-checkout:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
