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
            className={`lg:col-span-7 bento-card bento-card-hover overflow-hidden ${anim()}`}
            style={{ transitionDelay: '0ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col h-full relative">
              {/* Gradient blob decorativo */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(232,90,112,0.08) 0%, transparent 70%)' }} />

              <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center mb-6">
                <Smartphone className="w-5 h-5 text-[#E85A70]" />
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] mb-3 leading-tight">
                Seus convidados não precisam instalar nada
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
                Câmera, galeria e download funcionam direto no navegador. Abriu o QR Code, já está usando.
              </p>

              {/* Mockup de browser simples */}
              <div className="mt-auto rounded-2xl border border-[#ede7e4] bg-[#F8F9FA] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-[#ede7e4] bg-white">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
                    <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 h-5 rounded-md bg-[#F8F9FA] border border-[#ede7e4] flex items-center px-3">
                    <span className="text-[10px] text-gray-400 font-medium">lume.app/e/seu-evento</span>
                  </div>
                </div>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-16 h-24 rounded-xl bg-[#1c1c1e] flex items-center justify-center flex-shrink-0">
                    <div className="w-8 h-8 rounded-full border-2 border-white/40 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2.5 rounded bg-[#ede7e4] w-3/4" />
                    <div className="h-2.5 rounded bg-[#ede7e4] w-1/2" />
                    <div className="mt-3 h-7 rounded-xl w-28" style={{ background: '#E85A70', opacity: 0.9 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card B — QR Code */}
          <div
            className={`lg:col-span-5 bento-card bento-card-hover ${anim()}`}
            style={{ transitionDelay: '100ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col h-full">
              <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center mb-6">
                <QrCode className="w-5 h-5 text-[#E85A70]" />
              </div>

              <h3 className="font-display text-2xl font-extrabold text-[#1c1c1e] mb-3">
                QR Code gerado na hora
              </h3>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Imprima para as mesas ou envie pelo WhatsApp. Em segundos seus convidados já estão fotografando.
              </p>

              {/* QR code estilizado */}
              <div className="mt-auto flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-[#1c1c1e] p-2 flex-shrink-0">
                  <div className="w-full h-full grid grid-cols-5 gap-px">
                    {[1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1,
                      0,0,0,1,0, 1,0,1,0,1, 0,1,0,1,0, 1,0,1,0,1, 0,0,0,1,0].slice(0,25).map((v, i) => (
                      <div key={i} className="rounded-[1px]" style={{ background: v ? 'white' : 'transparent' }} />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1c1c1e] mb-1">lume.app/e/casamento</p>
                  <p className="text-xs text-gray-400">Link exclusivo por evento</p>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-700">Ativo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card C — Layouts exclusivos */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover ${anim()}`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center mb-6">
                <Palette className="w-5 h-5 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Layouts com sua identidade
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                6 temas de cores. As fotos saem com o nome, data e estilo do seu evento.
              </p>

              {/* Swatches de tema */}
              <div className="mt-auto flex items-center gap-2 flex-wrap">
                {[
                  { bg: '#8B5CF6', label: 'Roxo' },
                  { bg: '#3B82F6', label: 'Azul' },
                  { bg: '#E85A70', label: 'Rosa' },
                  { bg: '#10B981', label: 'Verde' },
                  { bg: '#F59E0B', label: 'Laranja' },
                  { bg: '#EF4444', label: 'Vermelho' },
                ].map(({ bg, label }) => (
                  <div key={label} title={label}
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    style={{ background: bg }} />
                ))}
              </div>
            </div>
          </div>

          {/* Card D — Download */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover ${anim()}`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center mb-6">
                <Download className="w-5 h-5 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Download em alta resolução
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Após o evento, baixe todas as fotos e vídeos em qualidade original. Suas memórias, para sempre.
              </p>

              {/* Barra de progresso de download */}
              <div className="mt-auto space-y-2">
                {['Fotos', 'Vídeos'].map((type, i) => (
                  <div key={type} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-10 font-medium">{type}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F8F9FA] border border-[#ede7e4] overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: i === 0 ? '78%' : '45%', background: '#E85A70', opacity: 0.8 }} />
                    </div>
                    <span className="text-[10px] text-gray-400 font-medium w-8">{i === 0 ? '78' : '12'}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FDF2F4] border border-[#fbdde2]">
                    <Download className="w-3 h-3 text-[#E85A70]" />
                    <span className="text-[10px] font-bold text-[#E85A70]">Baixar tudo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card E — Qualquer evento */}
          <div
            className={`lg:col-span-4 bento-card bento-card-hover ${anim()}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="p-8 flex flex-col h-full">
              <div className="w-11 h-11 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-[#E85A70]" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-2">
                Para qualquer celebração
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Casamento, aniversário, formatura, festa corporativa. A Lume se adapta ao seu evento.
              </p>

              {/* Chips de tipo de evento */}
              <div className="mt-auto flex flex-wrap gap-2">
                {[
                  { emoji: '💒', label: 'Casamento' },
                  { emoji: '🎂', label: 'Aniversário' },
                  { emoji: '🎓', label: 'Formatura' },
                  { emoji: '🏢', label: 'Corporativo' },
                  { emoji: '🎉', label: 'Festa' },
                ].map(({ emoji, label }) => (
                  <div key={label}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#ede7e4] text-xs font-semibold text-gray-700">
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card F — Configuração rápida (full width) */}
          <div
            className={`lg:col-span-12 bento-card bento-card-hover ${anim()}`}
            style={{ transitionDelay: '500ms' }}
          >
            <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-[#E85A70]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-1">
                  Configure em menos de 2 minutos
                </h3>
                <p className="text-gray-500 text-sm">
                  Nome do evento, data, tema de cor — e o QR Code está pronto para compartilhar.
                </p>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                {[
                  { num: '2 min', label: 'para configurar' },
                  { num: '0 apps', label: 'para instalar' },
                  { num: '∞', label: 'convidados' },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-2xl font-extrabold text-[#E85A70]">{num}</p>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
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
