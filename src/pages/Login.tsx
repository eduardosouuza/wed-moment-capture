import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Logo } from '@/components/Logo';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-5">
                        <Logo size="xl" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                        Transforme seus eventos em memórias inesquecíveis
                    </p>
                </div>

                {/* Card */}
                <div className="bento-card p-8">
                    <h2 className="font-display text-2xl font-extrabold text-[#1c1c1e] text-center mb-6">
                        Entrar na sua conta
                    </h2>

                    {error && (
                        <Alert variant="destructive" className="mb-5">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="password" className="text-sm font-semibold text-[#1c1c1e]">Senha</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        Ainda não tem uma conta?{' '}
                        <Link to="/#pricing" className="text-[#E85A70] hover:text-[#d94f65] font-semibold">
                            Ver planos e criar conta
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-xs text-gray-400">
                    <p>
                        Ao continuar, você concorda com os{' '}
                        <Link to="/termos" className="hover:text-[#E85A70] underline underline-offset-2">Termos de Uso</Link>
                        {' e '}
                        <Link to="/privacidade" className="hover:text-[#E85A70] underline underline-offset-2">Política de Privacidade</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
