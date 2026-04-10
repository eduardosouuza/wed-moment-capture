import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14.11.0';

serve(async (req) => {
    try {
        const signature = req.headers.get('stripe-signature');
        if (!signature) {
            throw new Error('No signature provided');
        }

        const body = await req.text();

        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Verify webhook signature
        const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

        console.log('Webhook received:', event.type);

        // Initialize Supabase
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Handle checkout.session.completed
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;

            console.log('📦 Checkout session completed:', session.payment_status);

            const userId = session.metadata?.user_id;
            const planType = session.metadata?.plan_type;
            const checkoutType = session.metadata?.checkout_type;

            const VALID_PLANS = ['free', 'basico', 'standard', 'premium'];

            if (!planType) {
                console.error('❌ Missing plan_type in metadata');
                return new Response('OK', { status: 200 });
            }

            if (!VALID_PLANS.includes(planType)) {
                console.error('❌ Invalid plan_type received');
                return new Response('OK', { status: 200 });
            }

            // GUEST CHECKOUT - Create pending subscription
            if (checkoutType === 'guest' || !userId) {
                console.log('💳 Guest checkout detected - creating pending subscription');

                const { data: pendingSub, error: pendingError } = await supabase
                    .from('pending_subscriptions')
                    .insert({
                        session_id: session.id,
                        email: session.customer_email!,
                        plan_type: planType,
                        status: 'pending_registration',
                        payment_gateway: 'stripe',
                        amount: session.amount_total! / 100,
                        currency: (session.currency || 'BRL').toUpperCase(),
                        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
                        metadata: {
                            session_id: session.id,
                            payment_intent: session.payment_intent,
                        },
                    })
                    .select()
                    .single();

                if (pendingError) {
                    console.error('❌ Error creating pending subscription:', pendingError);
                    throw new Error('Failed to create pending subscription');
                }

                console.log('✅ Pending subscription created');

                return new Response(JSON.stringify({ received: true, pending: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // AUTHENTICATED CHECKOUT - Update user plan directly
            console.log('✅ Payment successful, updating plan');

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ plan: planType })
                .eq('id', userId);

            if (updateError) {
                console.error('❌ Error updating profile plan:', updateError);
                throw new Error('Failed to update plan');
            }

            // Try to record in pending_subscriptions (non-fatal)
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
                    metadata: {
                        user_id: userId,
                        session_id: session.id,
                        payment_intent: session.payment_intent,
                    },
                })
                .then(({ error }) => {
                    if (error) console.error('⚠️ Could not record subscription (non-fatal):', error.message);
                });

            console.log('🎉 SUCCESS: Plan activated');
        }

        return new Response(JSON.stringify({ received: true }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Webhook error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
});
