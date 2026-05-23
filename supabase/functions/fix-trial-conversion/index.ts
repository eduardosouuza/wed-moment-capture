import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // === SECURITY: Require valid JWT ===
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized: missing token' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }
        const token = authHeader.replace('Bearer ', '');

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAnonKey = Deno.env.get('ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

        // Reject anon key
        if (token === supabaseAnonKey) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized: anon key not accepted' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        // Validate JWT and get caller
        const anonClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user: caller }, error: authError } = await anonClient.auth.getUser(token);
        if (authError || !caller) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized: invalid token' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        const { eventId } = await req.json();

        if (!eventId) {
            throw new Error('eventId is required');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Get event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            throw new Error(`Event not found: ${eventError?.message}`);
        }

        // 2. Check if already converted
        if (!event.is_trial) {
            return new Response(
                JSON.stringify({
                    success: true,
                    alreadyConverted: true,
                    event: {
                        id: event.id,
                        name: event.name,
                        isTrial: event.is_trial,
                        subscriptionId: event.subscription_id,
                    },
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            );
        }

        // 3. Find active subscription for event
        const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('event_id', eventId)
            .eq('status', 'active')
            .maybeSingle();

        if (subError) {
            throw new Error(`Error finding subscription: ${subError.message}`);
        }

        if (!subscription) {
            throw new Error(
                'No active subscription found for this event. Cannot convert trial without payment.'
            );
        }

        // 4. Force convert trial
        const { data: convertResult, error: convertError } = await supabase.rpc('convert_trial_to_paid', {
            event_id_param: eventId,
            subscription_id_param: subscription.id,
        });

        if (convertError) {
            console.error('Error converting trial:', convertError);
            throw new Error(`Failed to convert trial: ${convertError.message}`);
        }

        // 5. Verify the conversion
        const { data: updatedEvent, error: verifyError } = await supabase
            .from('events')
            .select('id, name, is_trial, subscription_id')
            .eq('id', eventId)
            .single();

        if (verifyError) {
            throw new Error(`Failed to verify conversion: ${verifyError.message}`);
        }

        // 6. Check if conversion was successful
        if (updatedEvent.is_trial === true) {
            throw new Error('Conversion failed - event is still in trial mode');
        }

        if (updatedEvent.subscription_id !== subscription.id) {
            throw new Error(
                `Subscription ID mismatch. Expected: ${subscription.id}, Got: ${updatedEvent.subscription_id}`
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                alreadyConverted: false,
                event: {
                    id: updatedEvent.id,
                    name: updatedEvent.name,
                    isTrial: updatedEvent.is_trial,
                    subscriptionId: updatedEvent.subscription_id,
                },
                subscription: {
                    id: subscription.id,
                    status: subscription.status,
                    planType: subscription.plan_type,
                },
                convertResult,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        );
    } catch (error: any) {
        console.error('Error in fix-trial-conversion:', error.message);
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message,
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        );
    }
});
