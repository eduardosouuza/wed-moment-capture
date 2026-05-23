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
                JSON.stringify({ error: 'Unauthorized: missing token' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }
        const token = authHeader.replace('Bearer ', '');

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAnonKey = Deno.env.get('ANON_KEY') || Deno.env.get('SUPABASE_ANON_KEY') || '';

        if (token === supabaseAnonKey) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: anon key not accepted' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        const anonClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user: caller }, error: authError } = await anonClient.auth.getUser(token);
        if (authError || !caller) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: invalid token' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
            );
        }

        const { eventId } = await req.json();

        if (!eventId) {
            throw new Error('eventId is required');
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Check event status
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('*')
            .eq('id', eventId)
            .single();

        // Check subscription
        const { data: subscription, error: subscriptionError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('event_id', eventId)
            .maybeSingle();

        // Check payment transactions
        const { data: transactions } = subscription
            ? await supabase
                .from('payment_transactions')
                .select('*')
                .eq('subscription_id', subscription.id)
                .order('created_at', { ascending: false })
            : { data: [] };

        const status = {
            event: event
                ? {
                    id: event.id,
                    name: event.name,
                    isTrial: event.is_trial,
                    subscriptionId: event.subscription_id,
                    trialExpiresAt: event.trial_expires_at,
                    photoCount: event.photo_count,
                    photoLimit: event.photo_limit,
                }
                : null,
            eventError: eventError?.message || null,
            subscription: subscription
                ? {
                    id: subscription.id,
                    status: subscription.status,
                    planType: subscription.plan_type,
                    externalId: subscription.external_subscription_id,
                    createdAt: subscription.created_at,
                    amount: subscription.amount,
                }
                : null,
            subscriptionError: subscriptionError?.message || null,
            transactions: transactions?.map((t) => ({
                id: t.id,
                status: t.status,
                amount: t.amount,
                paymentMethod: t.payment_method,
                createdAt: t.created_at,
                approvedAt: t.approved_at,
            })),
            diagnosis: {
                issue: null as string | null,
                severity: 'ok' as 'ok' | 'warning' | 'critical',
                recommendation: null as string | null,
            },
        };

        // Detect issues
        if (!event) {
            status.diagnosis.issue = 'EVENT_NOT_FOUND';
            status.diagnosis.severity = 'critical';
            status.diagnosis.recommendation = 'Event does not exist in database';
        } else if (subscription?.status === 'active' && event.is_trial) {
            status.diagnosis.issue = 'PAID_BUT_STILL_TRIAL';
            status.diagnosis.severity = 'critical';
            status.diagnosis.recommendation =
                'Event has active subscription but is still in trial. Use fix-trial-conversion to repair.';
        } else if (transactions?.some((t) => t.status === 'approved') && event.is_trial) {
            status.diagnosis.issue = 'PAYMENT_APPROVED_BUT_TRIAL';
            status.diagnosis.severity = 'critical';
            status.diagnosis.recommendation =
                'Payment was approved but event is still in trial. Use fix-trial-conversion to repair.';
        } else if (subscription?.status === 'pending') {
            status.diagnosis.issue = 'SUBSCRIPTION_PENDING';
            status.diagnosis.severity = 'warning';
            status.diagnosis.recommendation = 'Subscription is pending payment. Check Stripe dashboard.';
        } else if (!subscription && !event.is_trial) {
            status.diagnosis.issue = 'NO_SUBSCRIPTION_BUT_NOT_TRIAL';
            status.diagnosis.severity = 'warning';
            status.diagnosis.recommendation = 'Event is not in trial but has no subscription. May be legacy data.';
        } else if (event.is_trial && !subscription) {
            status.diagnosis.issue = 'TRIAL_WITHOUT_SUBSCRIPTION';
            status.diagnosis.severity = 'ok';
            status.diagnosis.recommendation = 'Normal trial event without payment yet.';
        } else {
            status.diagnosis.recommendation = 'Everything looks normal.';
        }

        return new Response(JSON.stringify(status, null, 2), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (error: any) {
        console.error('Error in check-payment-status:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        );
    }
});
