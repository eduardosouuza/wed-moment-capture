import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function CTASection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.3 });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-5xl mx-auto">
        <div className={`bento-card overflow-hidden transition-all duration-1000 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          
          {/* Fundo rosa suave característico de sections de destaque do Memoly */}
          <div className="relative p-12 sm:p-20 flex flex-col items-center text-center bg-[#FDF2F4]">
            
            {/* Decorações sutis */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30"
              style={{
                backgroundImage: 'radial-gradient(circle at 20% 150%, rgba(232,90,112,0.4) 0%, transparent 50%), radial-gradient(circle at 80% -50%, rgba(225,29,72,0.4) 0%, transparent 50%)'
              }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="font-display text-4xl sm:text-5xl lg:text-5xl font-extrabold text-[#1c1c1e] mb-6 leading-tight">
                Faça do seu evento<br/>uma memória inesquecível
              </h2>

              <p className="text-lg mb-10 text-[#E85A70] font-medium opacity-90">
                Lume. A cabine fotográfica digital definitiva.
              </p>

              <button
                onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-rose px-10 py-5 text-lg shadow-[0_8px_30px_-8px_rgba(232,90,112,0.6)]"
              >
                Crie seu Evento Gratuitamente
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
