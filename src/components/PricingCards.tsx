import { Check, Sparkles, Crown, Zap, ArrowRight } from 'lucide-react';

interface Plan {
    name: string;
    price: number;
    originalPrice?: number;
    planType: 'basico' | 'standard' | 'premium';
    idealGuests: string;
    features: string[];
    highlighted?: boolean;
    popular?: boolean;
    icon: typeof Zap;
    iconColor: string;
    iconBg: string;
}

const plans: Plan[] = [
    {
        name: 'Básico',
        price: 29.90,
        planType: 'basico',
        idealGuests: 'Ideal para até 30 convidados',
        icon: Zap,
        iconColor: 'text-gray-400',
        iconBg: 'bg-gray-50',
        features: [
            '100 Fotos por evento',
            '1 evento ativo',
            'QR Code personalizado',
            'Temas básicos',
        ],
    },
    {
        name: 'Standard',
        price: 49.90,
        planType: 'standard',
        idealGuests: 'Ideal para até 100 convidados',
        icon: Sparkles,
        iconColor: 'text-[#E85A70]',
        iconBg: 'bg-[#FDF2F4]',
        features: [
            'Fotos e vídeos por evento',
            '1 evento ativo',
            'Temas premium',
            'Galeria personalizada',
            'Qualidade original',
            'Suporte por email',
            'Sem marca d\'água',
        ],
        popular: true,
        highlighted: true,
    },
    {
        name: 'Premium',
        price: 99.90,
        planType: 'premium',
        idealGuests: 'Eventos ilimitados',
        icon: Crown,
        iconColor: 'text-amber-500',
        iconBg: 'bg-amber-50',
        features: [
            'Fotos e vídeos ilimitados',
            'Eventos ilimitados',
            'Todos os temas premium',
            'Galeria personalizada',
            'Download de fotos e vídeos',
            'Armazenamento ilimitado',
            'Qualidade original',
            'Logo personalizado',
            'Domínio customizado',
            'Suporte prioritário',
            'Analytics avançado',
        ],
    },
];

interface PricingCardsProps {
    onSelectPlan: (planType: string, planName: string, price: number) => void;
}

export function PricingCards({ onSelectPlan }: PricingCardsProps) {
    return (
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto px-4 items-start">
            {plans.map((plan) => (
                <div
                    key={plan.planType}
                    className={`
                        relative p-8 transition-all duration-500 group border
                        ${plan.highlighted
                            ? 'bg-white border-[#E85A70]/30 shadow-2xl shadow-[#E85A70]/10 scale-[1.03] z-10'
                            : 'bg-white border-[#ede7e4] hover:shadow-xl hover:shadow-[#E85A70]/5'
                        }
                    `}
                    style={{ borderRadius: '32px' }}
                >
                    {/* Popular badge */}
                    {plan.popular && (
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <span className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider"
                                style={{
                                    background: '#E85A70',
                                    color: 'white',
                                    boxShadow: '0 8px 20px -8px rgba(232,90,112,0.6)'
                                }}>
                                <Sparkles className="w-3.5 h-3.5" />
                                <span>Mais Popular</span>
                            </span>
                        </div>
                    )}

                    {/* Plan icon + name */}
                    <div className="flex items-center space-x-3 mb-1 mt-1">
                        <div className={`w-10 h-10 ${plan.iconBg} rounded-xl flex items-center justify-center`}>
                            <plan.icon className={`w-5 h-5 ${plan.iconColor}`} />
                        </div>
                        <h3 className="font-display text-2xl font-bold text-[#1c1c1e]">{plan.name}</h3>
                    </div>

                    {/* Ideal guests */}
                    <p className="text-sm text-gray-500 mb-6 ml-[52px]">{plan.idealGuests}</p>

                    {/* Price */}
                    <div className="mb-8">
                        <div className="flex items-baseline">
                            <span className="text-base text-gray-500 mr-1 font-bold">R$</span>
                            <span className="font-display text-6xl font-extrabold text-[#1c1c1e] tracking-tight">
                                {plan.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="ml-2 text-sm text-gray-400 font-medium">/evento</span>
                        </div>
                        {plan.originalPrice && (
                            <div className="text-sm line-through mt-1 text-gray-400">
                                R$ {plan.originalPrice.toFixed(2).replace('.', ',')}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className={`h-px mb-8 ${plan.highlighted ? 'bg-[#FDF2F4]' : 'bg-[#ede7e4]'}`} />

                    {/* Features list */}
                    <ul className="space-y-4 mb-10 min-h-[180px]">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'bg-[#FDF2F4]' : 'bg-[#f9fafb]'
                                    }`}>
                                    <Check className={`w-3 h-3 ${plan.highlighted ? 'text-[#E85A70]' : 'text-gray-400'}`} />
                                </div>
                                <span className="text-sm text-gray-600 leading-relaxed font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                        onClick={() => onSelectPlan(plan.planType, plan.name, plan.price)}
                        className={`w-full py-4 text-sm flex justify-center items-center font-bold rounded-2xl transition-all duration-300 group-hover:scale-[1.02] ${
                            plan.highlighted 
                            ? 'btn-rose shadow-[0_8px_20px_-6px_rgba(232,90,112,0.4)]' 
                            : 'btn-secondary'
                        }`}
                    >
                        {plan.highlighted ? 'Começar Agora' : 'Escolher Plano'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="text-center text-xs mt-4 text-gray-400 font-medium">
                        Pagamento único por evento
                    </p>
                </div>
            ))}
        </div>
    );
}
