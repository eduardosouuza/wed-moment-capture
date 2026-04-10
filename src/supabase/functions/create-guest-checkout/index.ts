import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'npm:stripe@14.11.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { planType, email } = await req.json();

        if (!planType || !email) {
            throw new Error('Missing planType or email');
        }

        // Initialize Stripe
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
            apiVersion: '2023-10-16',
            httpClient: Stripe.createFetchHttpClient(),
        });

        // Map plan to Stripe product
        const STRIPE_PRODUCTS = {
            basico: 'prod_U53hNwYqXLcKq5',
            standard: 'prod_U53isYHGsRGlja',
            premium: 'prod_U53iFZSOFaAJ6p',
        };

        const productId = STRIPE_PRODUCTS[planType as keyof typeof STRIPE_PRODUCTS];

        if (!productId) {
            throw new Error('Invalid plan type');
        }

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

        // Create Checkout Session for GUEST (no user_id yet)
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            mode: 'payment',
            customer_email: email, // Pre-fill email
            success_url: `${Deno.env.get('FRONTEND_URL')}/register?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${Deno.env.get('FRONTEND_URL')}/#pricing`,
            metadata: {
                plan_type: planType,
                // NO user_id - will be linked after registration
                checkout_type: 'guest',
            },
        });

        console.log('Guest checkout session created:', session.id);

        return new Response(
            JSON.stringify({
                checkoutUrl: session.url,
                sessionId: session.id,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        );
    } catch (error: any) {
        console.error('Error in create-guest-checkout:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
