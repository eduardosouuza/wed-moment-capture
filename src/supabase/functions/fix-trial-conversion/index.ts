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
        const { eventId } = await req.json();

        if (!eventId) {
            throw new Error('eventId is required');
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log(`🔧 Attempting to fix trial conversion for event: ${eventId}`);

        // 1. Get event details
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        if (eventError || !event) {
            throw new Error(`Event not found: ${eventError?.message}`);
        }

        console.log('Event status:', {
            id: event.id,
            name: event.name,
            isTrial: event.is_trial,
            subscriptionId: event.subscription_id,
        });

        // 2. Check if already converted
        if (!event.is_trial) {
            console.log('✅ Event already converted to paid');
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

        console.log('Found active subscription:', {
            id: subscription.id,
            status: subscription.status,
            planType: subscription.plan_type,
        });

        // 4. Force convert trial
        console.log('🔄 Converting trial to paid...');
        const { data: convertResult, error: convertError } = await supabase.rpc('convert_trial_to_paid', {
            event_id_param: eventId,
            subscription_id_param: subscription.id,
        });

        if (convertError) {
            console.error('❌ Error converting trial:', convertError);
            throw new Error(`Failed to convert trial: ${convertError.message}`);
        }

        console.log('✅ Conversion result:', convertResult);

        // 5. Verify the conversion
        const { data: updatedEvent, error: verifyError } = await supabase
            .from('events')
            .select('id, name, is_trial, subscription_id')
            .eq('id', eventId)
            .single();

        if (verifyError) {
            throw new Error(`Failed to verify conversion: ${verifyError.message}`);
        }

        console.log('🔍 Verification:', {
            id: updatedEvent.id,
            name: updatedEvent.name,
            isTrial: updatedEvent.is_trial,
            subscriptionId: updatedEvent.subscription_id,
        });

        // 6. Check if conversion was successful
        if (updatedEvent.is_trial === true) {
            throw new Error('Conversion failed - event is still in trial mode');
        }

        if (updatedEvent.subscription_id !== subscription.id) {
            throw new Error(
                `Subscription ID mismatch. Expected: ${subscription.id}, Got: ${updatedEvent.subscription_id}`
            );
        }

        console.log('🎉 Successfully converted event from trial to paid');

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
        console.error('❌ Error in fix-trial-conversion:', error);
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
