import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, CreditCard, Loader2, Lock } from 'lucide-react';

interface EmailCaptureModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (email: string) => Promise<void>;
    planName: string;
    price: number;
}

export function EmailCaptureModal({ open, onClose, onSubmit, planName, price }: EmailCaptureModalProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) { setError('Por favor, digite seu email'); return; }
        if (!validateEmail(email)) { setError('Por favor, digite um email válido'); return; }

        setLoading(true);
        try {
            await onSubmit(email);
        } catch {
            setError('Erro ao processar. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border border-[#ede7e4] rounded-3xl p-0 overflow-hidden">
                {/* Header */}
                <div className="px-7 pt-7 pb-5 border-b border-[#ede7e4]">
                    <DialogHeader>
                        <DialogTitle className="font-display text-2xl font-extrabold text-[#1c1c1e]">
                            Quase lá! 🎉
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Você escolheu o plano{' '}
                            <span className="font-bold text-[#E85A70]">{planName}</span>
                        </DialogDescription>
                    </DialogHeader>

                    {/* Price badge */}
                    <div className="mt-4 inline-flex items-center gap-2 bg-[#FDF2F4] border border-[#fbdde2] rounded-2xl px-4 py-2.5">
                        <span className="font-display text-2xl font-extrabold text-[#E85A70]">
                            R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-gray-400 font-medium">/evento</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="px-7 py-5 space-y-4">
                    <div>
                        <label htmlFor="modal-email" className="block text-sm font-semibold text-[#1c1c1e] mb-1.5">
                            Seu email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                id="modal-email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                        {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
                    </div>

                    <div className="flex items-start gap-2.5 bg-[#F8F9FA] border border-[#ede7e4] rounded-2xl p-3.5 text-xs text-gray-500">
                        <CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span>
                            Você será redirecionado para o pagamento seguro via Stripe.
                            Após confirmar, poderá criar sua conta.
                        </span>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-[#ede7e4] text-gray-600 hover:bg-[#F8F9FA] rounded-xl font-semibold"
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 btn-rose rounded-xl font-bold"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3.5 h-3.5 mr-2" />
                                    Ir para Pagamento
                                </>
                            )}
                        </Button>
                    </div>

                    <p className="text-[10px] text-gray-400 text-center pb-1">
                        Ao continuar, você concorda com nossos Termos de Uso
                    </p>
                </form>
            </DialogContent>
        </Dialog>
    );
}
