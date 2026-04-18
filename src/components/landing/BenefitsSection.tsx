import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Smartphone, QrCode, Download, Palette, Zap, Users } from 'lucide-react';

export function BenefitsSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });

  const anim = () =>
    `transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`;

  return (
    <section id="benefits" ref={ref} className="py-28 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="badge-rose inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full">
            Diferenciais
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Por que escolher a Lume?
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Tudo que você precisa para transformar qualquer evento numa experiência inesquecível.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid lg:grid-cols-12 gap-5">

          {/* Card A — Grande: Zero fricção */}
          <div
            className={`lg:col-span-7 bento-card bento-card-hover overflow-hidden bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '0ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col h-full relative bg-gradient-to-br from-transparent to-rose-50/40">
              {/* Gradient blob decorativo */}
              <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(232,90,112,0.12) 0%, transparent 60%)' }} />

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center mb-6 z-10">
                <Smartphone className="w-6 h-6 text-[#E85A70]" />
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] mb-3 leading-tight z-10 relative">
                Seus convidados não precisam instalar nada
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-md z-10 relative">
                Câmera, galeria e download funcionam direto no navegador. Abriu o QR Code, já está usando.
              </p>

              {/* Mockup de browser simples */}
              <div className="mt-auto rounded-t-2xl rounded-b-xl border border-[#ede7e4] shadow-[0_12px_24px_-8px_rgba(0,0,0,0.08)] bg-white/80 backdrop-blur-md overflow-hidden relative z-10">
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ede7e4]/60 bg-gray-50/50">
                  <div className="flex gap-1.5 pl-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d89e24]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29]" />
                  </div>
                  <div className="flex-1 h-6 rounded bg-white border border-[#ede7e4] shadow-sm flex items-center px-3 justify-center">
                    <span className="text-[10px] text-gray-500 font-semibold tracking-wide">lume.app/e/seu-evento</span>
                  </div>
                  <div className="w-8" />
                </div>
                <div className="p-5 flex items-center gap-5">
                  <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#2d2d30] shadow-md flex items-center justify-center flex-shrink-0 border border-gray-800">
                    <div className="w-8 h-8 rounded-full border-[2.5px] border-white/30 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2.5 pr-4">
                    <div className="h-2.5 rounded-full bg-gray-200 w-3/4" />
                    <div className="h-2.5 rounded-full bg-gray-100 w-1/2" />
                    <div className="mt-4 h-8 rounded-xl w-32 bg-gradient-to-r from-[#E85A70] to-[#ff7a8e] shadow-[0_2px_8px_rgba(232,90,112,0.25)] flex items-center justify-center relative overflow-hidden">
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B — QR Code */}
          <div
            className={`lg:col-span-5 bento-card bento-card-hover bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col h-full relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center mb-6 z-10">
                <QrCode className="w-6 h-6 text-[#E85A70]" />
              </div>

              <h3 className="font-display text-2xl font-extrabold text-[#1c1c1e] mb-3 z-10">
                QR Code gerado na hora
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm z-10">
                Imprima para as mesas ou envie pelo WhatsApp. Em segundos seus convidados já estão fotografando.
              </p>

              {/* QR code estilizado */}
              <div className="mt-auto flex items-center gap-5 bg-gray-50/50 p-4 rounded-2xl border border-[#ede7e4]/60 z-10">
                <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-[#1c1c1e] to-[#2d2d30] p-2.5 flex-shrink-0 shadow-[0_8px_16px_rgba(28,28,30,0.25)] border border-gray-800">
                  <div className="w-full h-full grid grid-cols-5 gap-[1.5px] relative z-0">
                    {[1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1,
                      0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0].slice(0, 25).map((v, i) => (
                        <div key={i} className="rounded-sm" style={{ background: v ? 'white' : 'transparent', opacity: v ? 0.9 : 0 }} />
                      ))}
                  </div>
                  {/* Subtle scan line effect */}
                  <div className="absolute left-0 right-0 h-0.5 bg-[#E85A70] top-1/2 shadow-[0_0_8px_#E85A70] -translate-y-1/2 opacity-80 z-10" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1c1c1e] mb-1 leading-none">lume.app/e/casamento</p>
                  <p className="text-[11px] text-gray-400 font-medium">Link exclusivo por evento</p>
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_4px_#10B981]" />
                    <span className="text-[10px] font-bold text-emerald-700 tracking-wide uppercase">Ativo agora</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card C — Layouts exclusivos */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="p-8 flex flex-col h-full bg-gradient-to-t from-transparent to-rose-50/20">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center mb-6">
                <Palette className="w-6 h-6 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Layouts com sua identidade
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                6 temas de cores impecáveis. As fotos saem prontas com a identidade da festa.
              </p>

              {/* Swatches de tema */}
              <div className="mt-auto flex items-center gap-3">
                {[
                  { bg: '#3B82F6', label: 'Azul', ring: false },
                  { bg: '#E85A70', label: 'Rosa', ring: true },
                  { bg: '#10B981', label: 'Verde', ring: false },
                  { bg: '#F59E0B', label: 'Laranja', ring: false },
                  { bg: '#8B5CF6', label: 'Roxo', ring: false },
                ].map(({ bg, label, ring }) => (
                  <div key={label} title={label}
                    className={`w-8 h-8 rounded-full shadow-sm hover:scale-125 transition-transform cursor-pointer border-2 border-white ${ring ? 'ring-2 ring-offset-2 ring-[#E85A70]' : ''}`}
                    style={{ background: bg }} />
                ))}
              </div>
            </div>
          </div>

          {/* Card D — Download */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center mb-6">
                <Download className="w-6 h-6 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Download em alta resolução
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Após o evento, baixe todas as fotos e vídeos em qualidade original. Suas memórias, para sempre.
              </p>

              {/* Barra de progresso de download */}
              <div className="mt-auto bg-gray-50/50 p-4 rounded-2xl border border-[#ede7e4]/60 space-y-3">
                {['Fotos', 'Vídeos'].map((type, i) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-[11px] text-gray-600 font-bold w-10 uppercase tracking-wide">{type}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-gray-200 overflow-hidden shadow-inner flex">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#E85A70] to-[#ff8a9b]"
                        style={{ width: i === 0 ? '78%' : '45%', boxShadow: '0 0 10px rgba(232,90,112,0.4)' }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold w-6 text-right">{i === 0 ? '78' : '12'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card E — Qualquer evento */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Para qualquer festa
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Versátil. A Lume eleva a vibração do evento, independente de qual seja.
              </p>

              {/* Chips de tipo de evento */}
              <div className="mt-auto flex flex-wrap gap-2">
                {[
                  { emoji: '💒', label: 'Casamento' },
                  { emoji: '🎂', label: 'Aniversário' },
                  { emoji: '🎓', label: 'Formatura' },
                  { emoji: '🎉', label: 'Festa' },
                ].map(({ emoji, label }) => (
                  <div key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#ede7e4] text-xs font-bold text-gray-600 shadow-sm hover:border-[#fbdde2] hover:text-[#E85A70] hover:bg-rose-50/30 transition-all cursor-default">
                    <span className="text-sm">{emoji}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card F — Configuração rápida (full width) */}
          <div
            className={`lg:col-span-12 bento-card bento-card-hover bg-white border border-[#ede7e4]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl ${anim()}`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 sm:gap-12 relative overflow-hidden">
               <div className="absolute right-0 top-0 w-96 h-96 bg-gradient-to-bl from-rose-50 to-transparent rounded-full opacity-60 pointer-events-none translate-x-1/3 -translate-y-1/3" />
               
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 shadow-[0_4px_12px_rgba(232,90,112,0.15)] flex items-center justify-center flex-shrink-0 z-10">
                <Zap className="w-7 h-7 text-[#E85A70]" />
              </div>
              <div className="flex-1 text-center sm:text-left z-10">
                <h3 className="font-display text-2xl font-extrabold text-[#1c1c1e] mb-2">
                  Pronto em 2 minutos
                </h3>
                <p className="text-gray-500 text-sm max-w-lg mx-auto sm:mx-0">
                  Defina o nome, a data e a cor do tema. Só isso. O QR Code fica pronto no mesmo instante.
                </p>
              </div>
              <div className="flex items-center gap-8 sm:gap-12 flex-shrink-0 z-10 w-full sm:w-auto justify-center">
                {[
                  { num: '0', label: 'apps instalados' },
                  { num: '100%', label: 'no navegador' },
                  { num: '∞', label: 'fotos e vídeos' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#E85A70] to-[#ff7a8e] mb-1">{num}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
