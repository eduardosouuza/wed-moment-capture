import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface CreatePaymentParams {
    eventId: string;
    planType: 'basico' | 'standard' | 'premium';
}

interface CreatePaymentResponse {
    paymentId: string;
    checkoutUrl: string;
    sessionId: string;
}

export function usePayment() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPayment = async ({ eventId, planType }: CreatePaymentParams) => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: functionError } = await supabase.functions.invoke('create-stripe-checkout', {
                body: { eventId, planType }
            });

            if (functionError) throw functionError;

            const response = data as CreatePaymentResponse;

            if (response.checkoutUrl) {
                window.location.href = response.checkoutUrl;
            }

            return { data: response, error: null };
        } catch (err: any) {
            const errorMessage = err.message || 'Erro ao processar pagamento';
            setError(errorMessage);
            console.error('Payment error:', err);
            return { data: null, error: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const checkPaymentStatus = async (eventId: string) => {
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
        createPayment,
        checkPaymentStatus,
        loading,
        error,
    };
}
