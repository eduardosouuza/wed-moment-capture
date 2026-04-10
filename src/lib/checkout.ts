import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;



export async function createGuestCheckout(planType: string, email: string) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/create-guest-checkout`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ planType, email }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to create checkout');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating guest checkout:', error);
        throw error;
    }
}

// Verifica pagamento diretamente com Stripe via Edge Function
// Não depende de webhook!
export async function verifyPayment(sessionId: string) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/verify-payment`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify({ sessionId }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Payment verification failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error verifying payment:', error);
        return null;
    }
}

// Atualiza o plano do usuário via Edge Function (server-side, bypasses RLS)
export async function claimPlan(userId: string, planType: string, sessionId: string) {
    try {
        // Get the user's actual JWT token for authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            throw new Error('Usuário não autenticado. Faça login para continuar.');
        }
        const userToken = session.access_token;

        const response = await fetch(
            `${SUPABASE_URL}/functions/v1/verify-payment`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${userToken}`,
                },
                body: JSON.stringify({
                    sessionId,
                    userId,
                    action: 'claim',
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Failed to claim plan');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error claiming plan:', error);
        throw error;
    }
}
