import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function TestimonialsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.15 });

  const testimonials = [
    {
      name: 'Ana & João',
      event: 'Casamento • São Paulo',
      text: 'Foi perfeito! Nossos convidados adoraram tirar fotos e vimos tudo ao vivo. Economizamos muito em relação a cabines físicas e o formato digital fez todo o sentido.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=5',
    },
    {
      name: 'Marcos Silva',
      event: 'Aniversário 50 anos',
      text: 'Muito fácil de usar. Configurei em menos de 10 minutos. Meus amigos não pararam de tirar fotos a noite inteira.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=11',
    },
    {
      name: 'Felipe Lopes',
      event: 'Festa Corporativa',
      text: 'O telão ao vivo fez muito sucesso. Todos queriam aparecer e participar. Foi o grande diferencial da nossa convenção.',
      rating: 5,
      avatar: 'https://i.pravatar.cc/150?img=15',
    },
  ];

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">
        <div className={`text-center mb-16 transition-all duration-800 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Depoimentos Reais
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Histórias de quem já usou e aprovou a cabine digital em seus momentos especiais.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className={`bento-card p-10 flex flex-col gap-6 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              {/* Estrelas */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, j) => (
                  <span key={j} className="text-[#E85A70] text-xl">★</span>
                ))}
              </div>

              {/* Depoimento - Sem aspas flutuantes pesadas, focado na leitura leve */}
              <p className="text-gray-600 leading-relaxed flex-1 font-medium">
                "{t.text}"
              </p>

              {/* Perfil */}
              <div className="flex items-center gap-4 pt-4 border-t border-[#ede7e4]">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-[#1c1c1e]">{t.name}</h4>
                  <p className="text-sm text-gray-400">{t.event}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
