import { useEffect, useState } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayment';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Plan {
    id: 'basico' | 'standard' | 'premium';
    name: string;
    price: number;
    idealGuests: string;
    features: string[];
    popular?: boolean;
    icon: typeof Zap;
    accent: string;
    accentBg: string;
    buttonStyle: string;
}

const plans: Plan[] = [
    {
        id: 'basico',
        name: 'Básico',
        price: 29.90,
        idealGuests: 'Ideal para até 30 convidados',
        icon: Zap,
        accent: 'text-blue-600',
        accentBg: 'bg-blue-50',
        buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
        features: [
            '100 Fotos por evento',
            '1 evento ativo',
            'QR Code personalizado',
            'Temas básicos',
        ],
    },
    {
        id: 'standard',
        name: 'Standard',
        price: 49.90,
        idealGuests: 'Ideal para até 100 convidados',
        icon: Sparkles,
        accent: 'text-purple-600',
        accentBg: 'bg-purple-50',
        buttonStyle: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25',
        popular: true,
        features: [
            'Fotos e vídeos por evento',
            '1 evento ativo',
            'Temas premium',
            'Galeria personalizada',
            'Qualidade original',
            'Suporte por email',
            'Sem marca d\'água',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 99.90,
        idealGuests: 'Eventos ilimitados',
        icon: Crown,
        accent: 'text-amber-600',
        accentBg: 'bg-amber-50',
        buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
        features: [
            'Fotos e vídeos ilimitados',
            'Eventos ilimitados',
            'Todos os temas premium',
            'Galeria personalizada',
            'Download de fotos e vídeos',
            'Armazenamento ilimitado',
            'Logo personalizado',
            'Domínio customizado',
            'Suporte prioritário',
            'Analytics avançado',
        ],
    },
];

export default function Plans() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { createSubscription, loading } = usePayment();
    const { toast } = useToast();
    const [eventId, setEventId] = useState<string | null>(null);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [noEventFound, setNoEventFound] = useState(false);

    useEffect(() => {
        const urlEventId = searchParams.get('eventId');

        if (urlEventId) {
            setEventId(urlEventId);
            setLoadingEvent(false);
        } else {
            const getUserEvent = async () => {
                try {
                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) {
                        setLoadingEvent(false);
                        setNoEventFound(true);
                        return;
                    }

                    // Buscar último evento do usuário
                    const { data: events } = await supabase
                        .from('events')
                        .select('id')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                        .limit(1) as { data: { id: string }[] | null };

                    if (events && events.length > 0) {
                        setEventId(events[0].id);
                        setNoEventFound(false);
                    } else {
                        setNoEventFound(true);
                    }
                } catch (err) {
                    console.error('Error fetching event:', err);
                    setNoEventFound(true);
                } finally {
                    setLoadingEvent(false);
                }
            };

            getUserEvent();
        }
    }, [searchParams]);

    const handleSelectPlan = async (planId: string) => {
        if (!eventId) {
            toast({
                title: 'Nenhum evento encontrado',
                description: 'Crie um evento primeiro para ativar um plano.',
                variant: 'destructive',
            });
            navigate('/events/new');
            return;
        }

        const result = await createSubscription({
            eventId,
            planType: planId as 'basico' | 'standard' | 'premium',
        });

        if (result.error) {
            toast({
                title: 'Erro no pagamento',
                description: result.error,
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            {/* Header */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1.5" />
                        Voltar
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                {/* Title */}
                <div className="text-center mb-14">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                        Escolha Seu <span className="bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Plano</span>
                    </h1>
                    <p className="text-gray-500 text-lg max-w-xl mx-auto">
                        Pague apenas pelo que usar. Sem mensalidades ou taxas escondidas.
                    </p>
                </div>

                {/* Banner */}
                {loadingEvent ? (
                    <div className="max-w-2xl mx-auto mb-12 bg-gray-100 rounded-2xl p-5 text-center animate-pulse">
                        <p className="text-gray-400">Buscando seus eventos...</p>
                    </div>
                ) : noEventFound ? (
                    <div className="max-w-2xl mx-auto mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-amber-800">Nenhum evento encontrado</h3>
                            <p className="text-sm text-amber-600">Crie um evento primeiro para ativar um plano</p>
                        </div>
                        <Button
                            onClick={() => navigate('/events/new')}
                            className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
                        >
                            Criar Evento
                        </Button>
                    </div>
                ) : null}

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-start">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`
                                relative bg-white rounded-3xl p-8 transition-all duration-300
                                ${plan.popular
                                    ? 'border-2 border-purple-200 shadow-2xl shadow-purple-500/10 scale-[1.03] z-10'
                                    : 'border border-gray-100 hover:shadow-xl hover:border-gray-200'
                                }
                            `}
                        >
                            {/* Popular badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-5 py-2 rounded-full text-xs font-bold shadow-lg shadow-purple-500/30 uppercase tracking-wider">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Mais Popular
                                    </span>
                                </div>
                            )}

                            {/* Plan icon + name */}
                            <div className="flex items-center gap-3 mb-1 mt-1">
                                <div className={`w-10 h-10 ${plan.accentBg} rounded-xl flex items-center justify-center`}>
                                    <plan.icon className={`w-5 h-5 ${plan.accent}`} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            </div>

                            <p className="text-sm text-gray-500 mb-6 ml-[52px]">{plan.idealGuests}</p>

                            {/* Price */}
                            <div className="mb-8">
                                <div className="flex items-baseline">
                                    <span className="text-sm text-gray-500 mr-1">R$</span>
                                    <span className="text-5xl font-extrabold text-gray-900 tracking-tight">
                                        {plan.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    <span className="ml-2 text-sm text-gray-400">/evento</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={`h-px mb-8 ${plan.popular ? 'bg-gradient-to-r from-transparent via-purple-200 to-transparent' : 'bg-gray-100'}`} />

                            {/* Features */}
                            <ul className="space-y-3.5 mb-10">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${plan.popular ? 'bg-purple-100' : 'bg-gray-100'}`}>
                                            <Check className={`w-3 h-3 ${plan.popular ? 'text-purple-600' : 'text-gray-600'}`} />
                                        </div>
                                        <span className="text-sm text-gray-600">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={loadingEvent || noEventFound || loading}
                                className={`w-full py-6 text-sm font-semibold rounded-xl transition-all ${plan.buttonStyle} disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {loading ? 'Processando...' : plan.popular ? 'Começar Agora' : 'Escolher Plano'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>

                            <p className="text-center text-xs mt-4 text-gray-400">
                                Pagamento único por evento
                            </p>
                        </div>
                    ))}
                </div>

                {/* Guarantees */}
                <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500" />
                        <span>Pagamento seguro via Stripe</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Ativação imediata</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-purple-500" />
                        <span>Garantia de 7 dias</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
