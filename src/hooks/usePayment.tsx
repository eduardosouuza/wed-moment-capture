import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CreateSubscriptionParams {
    eventId: string;
    planType: 'basico' | 'standard' | 'premium';
}

interface CreateSubscriptionResponse {
    subscriptionId: string;
    checkoutUrl: string;
    sessionId: string;
}

export function usePayment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createSubscription = async ({ eventId, planType }: CreateSubscriptionParams) => {
        setLoading(true);
        setError(null);

        try {
            // Call Stripe Edge Function to create checkout session
            const { data, error: functionError } = await supabase.functions.invoke('create-stripe-checkout', {
                body: { eventId, planType }
            });

            if (functionError) throw functionError;

            const response = data as CreateSubscriptionResponse;

            // Redirect to Stripe Checkout
            if (response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            }

            return { data: response, error: null };
        } catch (err: any) {
            const errorMessage = err.message || 'Erro ao criar assinatura';
            setError(errorMessage);
            console.error('Payment error:', err);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const checkSubscriptionStatus = async (eventId: string) => {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('event_id', eventId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (err: any) {
            return { data: null, error: err.message };
        }
    };

    return {
        createSubscription,
        checkSubscriptionStatus,
        loading,
        error,
    };
}
