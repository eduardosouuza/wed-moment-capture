import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { verifyPayment, claimPlan } from '@/lib/checkout';
import { Logo } from '@/components/Logo';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [paymentData, setPaymentData] = useState<any>(null);
    const [verifyingPayment, setVerifyingPayment] = useState(true);
    const [searchParams] = useSearchParams();

    const { signUp } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
            navigate('/#pricing');
            return;
        }
        verifyStripePayment(sessionId);
    }, [searchParams, navigate]);

    const verifyStripePayment = async (sessionId: string) => {
        setVerifyingPayment(true);
        const data = await verifyPayment(sessionId);

        if (!data || !data.success) {
            setError('Pagamento não encontrado ou não confirmado. Por favor, tente novamente.');
            setVerifyingPayment(false);
            setTimeout(() => navigate('/#pricing'), 3000);
            return;
        }

        setPaymentData(data);
        setEmail(data.email || '');
        setVerifyingPayment(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }
        if (!fullName.trim()) {
            setError('Por favor, informe seu nome completo');
            return;
        }

        setLoading(true);
        const { error: signUpError, user } = await signUp(email, password, fullName);

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else {
            if (paymentData?.planType && user) {
                try {
                    const sessionId = searchParams.get('session_id')!;
                    await claimPlan(user.id, paymentData.planType, sessionId);
                } catch (err) {
                    console.error('❌ Erro ao atribuir plano:', err);
                }
            }
            setSuccess(true);
            setLoading(false);
            setTimeout(() => navigate('/dashboard'), 2000);
        }
    };

    // Loading state
    if (verifyingPayment) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
                <div className="bento-card p-10 w-full max-w-sm text-center">
                    <div className="w-12 h-12 border-2 border-[#ede7e4] border-t-[#E85A70] rounded-full animate-spin mx-auto mb-5" />
                    <h2 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                        Verificando pagamento...
                    </h2>
                    <p className="text-sm text-gray-500">Confirmando seu pagamento com o Stripe.</p>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
                <div className="bento-card p-10 w-full max-w-sm text-center">
                    <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="font-display text-2xl font-extrabold text-[#1c1c1e] mb-2">
                        Conta criada!
                    </h2>
                    <p className="text-gray-500 text-sm mb-1">
                        Bem-vindo à Lume{paymentData ? `, plano ${paymentData.planType}` : ''}, {fullName.split(' ')[0]}!
                    </p>
                    <p className="text-xs text-gray-400">Redirecionando para o dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-5">
                        <Logo size="xl" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                        {paymentData
                            ? `Pagamento confirmado! Crie sua conta para ativar o plano ${paymentData.planType}`
                            : 'Crie sua conta e comece agora'
                        }
                    </p>
                </div>

                {/* Card */}
                <div className="bento-card p-8">
                    <h2 className="font-display text-2xl font-extrabold text-[#1c1c1e] text-center mb-6">
                        {paymentData ? 'Criar sua conta' : 'Criar conta'}
                    </h2>

                    {paymentData && (
                        <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3">
                            <CreditCard className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-700 leading-snug">
                                Pagamento de <strong>R$ {paymentData.amount?.toFixed(2)}</strong> confirmado!
                                Plano <strong>{paymentData.planType}</strong> será ativado.
                            </p>
                        </div>
                    )}

                    {error && (
                        <Alert variant="destructive" className="mb-5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="fullName" className="text-sm font-semibold text-[#1c1c1e]">Nome completo</Label>
                            <Input
                                id="fullName"
                                type="text"
                                placeholder="Seu nome completo"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="email" className="text-sm font-semibold text-[#1c1c1e]">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                disabled={loading || !!paymentData}
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm font-semibold text-[#1c1c1e]">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1c1c1e]">Confirmar senha</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Digite a senha novamente"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full btn-rose h-11 text-sm font-bold mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2" />
                                    Criando conta...
                                </>
                            ) : (
                                paymentData ? 'Criar conta e ativar plano' : 'Criar conta'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-[#E85A70] hover:text-[#d94f65] font-semibold">
                            Entrar
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>
                        Ao criar uma conta, você concorda com os{' '}
                        <Link to="/termos" className="hover:text-[#E85A70] underline underline-offset-2">Termos de Uso</Link>
                        {' e '}
                        <Link to="/privacidade" className="hover:text-[#E85A70] underline underline-offset-2">Política de Privacidade</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
