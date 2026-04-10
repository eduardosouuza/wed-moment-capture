import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { PricingCards } from '@/components/PricingCards';
import { Shield } from 'lucide-react';

interface PricingSectionProps {
  handleSelectPlan: (planType: string, planName: string, price: number) => void;
}

export function PricingSection({ handleSelectPlan }: PricingSectionProps) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-white" id="pricing">
      <div className="max-w-7xl mx-auto">
        
        <div className={`text-center mb-16 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
           <span className="badge-rose inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full">
            Planos
          </span>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Preço simples e <span className="gradient-text">transparente</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Escolha o plano ideal para o tamanho da sua celebração. Sem mensalidades.
          </p>
        </div>

        <div className={`transition-all duration-1000 delay-200 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}>
          <PricingCards onSelectPlan={handleSelectPlan} />
        </div>

        <div className={`text-center mt-12 transition-all duration-1000 delay-400 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-[#F8F9FA] border border-[#ede7e4] rounded-full px-5 py-2.5 shadow-sm text-sm">
            <Shield className="w-4 h-4" style={{ color: '#E85A70' }} />
            <span className="text-gray-600 font-medium">
              <strong style={{ color: '#1c1c1e' }}>Garantia de 7 dias</strong> — Risco zero
            </span>
          </div>
        </div>
        
      </div>
    </section>
  );
}
