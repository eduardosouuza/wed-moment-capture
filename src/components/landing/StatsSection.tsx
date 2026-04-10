import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function StatsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        
        {/* Usando o formato Bento como na aba de preços do Memoly */}
        <div className={`bento-card p-12 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Eventos Realizados', value: '247+', icon: '🎈' },
              { label: 'Fotos Salvas', value: '18.5k', icon: '📸' },
              { label: 'Nota Média', value: '4.9/5', icon: '⭐' },
              { label: 'Satisfação', value: '98%', icon: '❤️' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col gap-2">
                <span className="text-3xl mb-2">{stat.icon}</span>
                <span className="font-display text-4xl text-[#1c1c1e] font-extrabold">{stat.value}</span>
                <span className="text-gray-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
