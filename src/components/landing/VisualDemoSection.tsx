import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { QrCode, Smartphone, Images, ArrowRight, CheckCircle2, Wifi, Camera, Tv } from 'lucide-react';

const WEDDING_PHOTOS = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=400&h=400&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop&q=80',
];

export function VisualDemoSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.08 });

  return (
    <section id="demo" ref={ref} className="py-28 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="badge-rose inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full">
            Como funciona
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Do evento à memória em{' '}
            <span style={{ color: '#E85A70' }}>3 passos</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Configure em minutos. Seus convidados usam sem instalar nada.
          </p>
        </div>

        {/* Steps — desktop: horizontal com seta, mobile: vertical */}
        <div className="relative max-w-5xl mx-auto mb-20">

          {/* Linha conectora desktop */}
          <div className="hidden md:block absolute top-[52px] left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-px bg-[#ede7e4] z-0" />

          <div className="grid md:grid-cols-3 gap-6 relative z-10">

            {/* Step 1 */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: '0ms' }}>
              <div className="bento-card bento-card-hover p-7 flex flex-col h-full">
                {/* Número + ícone */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#E85A70]">1</span>
                  </div>
                  <div className="h-px flex-1 bg-[#ede7e4] md:hidden" />
                </div>

                {/* Mini mockup: dashboard de evento */}
                <div className="rounded-2xl bg-[#F8F9FA] border border-[#ede7e4] p-4 mb-6 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 rounded-md bg-[#E85A70] flex items-center justify-center">
                      <Camera className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-bold text-[#1c1c1e]">Criar evento</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 rounded bg-[#ede7e4] w-3/4" />
                    <div className="h-2.5 rounded bg-[#ede7e4] w-1/2" />
                    <div className="h-2.5 rounded bg-[#ede7e4] w-5/6" />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {['#E85A70', '#f9a8b4', '#fbd5db'].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border-2 border-white" style={{ background: c }} />
                      ))}
                    </div>
                    <div className="h-6 w-16 rounded-lg bg-[#E85A70] opacity-80" />
                  </div>
                </div>

                <QrCode className="w-6 h-6 text-[#E85A70] mb-3" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-bold text-[#1c1c1e] mb-2">Configure seu evento</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
                  Dê um nome, escolha o tema e pronto. Em menos de 2 minutos seu evento está no ar com QR Code gerado automaticamente.
                </p>
              </div>
            </div>

            {/* Seta desktop entre 1→2 */}
            <div className="hidden md:flex absolute top-[36px] left-[33%] -translate-x-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white border border-[#ede7e4] shadow-sm">
              <ArrowRight className="w-3.5 h-3.5 text-[#E85A70]" />
            </div>

            {/* Step 2 */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: '150ms' }}>
              <div className="bento-card bento-card-hover p-7 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#E85A70]">2</span>
                  </div>
                  <div className="h-px flex-1 bg-[#ede7e4] md:hidden" />
                </div>

                {/* Mini mockup: celular escaneando */}
                <div className="rounded-2xl bg-[#F8F9FA] border border-[#ede7e4] p-4 mb-6">
                  <div className="flex items-start gap-3">
                    {/* QR code simulado */}
                    <div className="w-16 h-16 rounded-xl bg-white border border-[#ede7e4] p-1.5 flex-shrink-0">
                      <div className="w-full h-full grid grid-cols-4 gap-px">
                        {[...Array(16)].map((_, i) => (
                          <div key={i} className="rounded-[1px]"
                            style={{ background: [0, 1, 4, 5, 2, 7, 8, 10, 11, 13, 14, 15].includes(i) ? '#1c1c1e' : 'transparent' }} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-[#1c1c1e] mb-1.5">lume.app/e/casamento</div>
                      <div className="h-2 rounded bg-[#ede7e4] w-full mb-1" />
                      <div className="h-2 rounded bg-[#ede7e4] w-2/3" />
                      <div className="mt-2.5 flex items-center gap-1.5">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">Online</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#ede7e4] flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      {['#fbd5db', '#f9a8b4', '#E85A70'].map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white" style={{ background: c }} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">34 convidados ativos</span>
                  </div>
                </div>

                <Smartphone className="w-6 h-6 text-[#E85A70] mb-3" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-bold text-[#1c1c1e] mb-2">Convidados escaneiam e fotografam</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
                  Sem baixar app. Basta escanear o QR Code e a câmera abre direto no navegador, pronta para capturar o momento.
                </p>
              </div>
            </div>

            {/* Seta desktop entre 2→3 */}
            <div className="hidden md:flex absolute top-[36px] left-[67%] -translate-x-1/2 z-20 items-center justify-center w-8 h-8 rounded-full bg-white border border-[#ede7e4] shadow-sm">
              <ArrowRight className="w-3.5 h-3.5 text-[#E85A70]" />
            </div>

            {/* Step 3 */}
            <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: '300ms' }}>
              <div className="bento-card bento-card-hover p-7 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-extrabold text-[#E85A70]">3</span>
                  </div>
                  <div className="h-px flex-1 bg-[#ede7e4] md:hidden" />
                </div>

                {/* Mini mockup: tiras da cabine */}
                <div className="relative rounded-2xl bg-[#F8F9FA] border border-[#ede7e4] p-3 mb-6 overflow-hidden flex items-end justify-center gap-2">
                  {/* Tira esquerda menor */}
                  <div className="bg-[#f7f3ee] rounded-lg border border-[#e8dfd5] overflow-hidden flex-shrink-0 opacity-60" style={{ width: 56 }}>
                    <img src="/cabine-foto.png" alt="" className="w-full block object-cover object-top" style={{ maxHeight: 120 }} loading="lazy" />
                  </div>
                  {/* Tira central */}
                  <div className="bg-[#f7f3ee] rounded-xl border border-[#e8dfd5] overflow-hidden flex-shrink-0 shadow-md z-10" style={{ width: 76 }}>
                    <img src="/cabine-foto.png" alt="Vitoria & Eduardo" className="w-full block" loading="lazy" />
                  </div>
                  {/* Tira direita menor */}
                  <div className="bg-[#f7f3ee] rounded-lg border border-[#e8dfd5] overflow-hidden flex-shrink-0 opacity-60" style={{ width: 56 }}>
                    <img src="/cabine-foto.png" alt="" className="w-full block object-cover object-top" style={{ maxHeight: 120 }} loading="lazy" />
                  </div>
                  {/* Badge +48 */}
                  <div className="absolute bottom-3 right-3 bg-white rounded-lg px-2 py-1 shadow border border-[#ede7e4]">
                    <span className="text-[10px] font-bold text-[#E85A70]">+48 fotos</span>
                  </div>
                </div>

                <Images className="w-6 h-6 text-[#E85A70] mb-3" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-bold text-[#1c1c1e] mb-2">Galeria ao vivo e download</h3>
                <p className="text-gray-500 text-sm leading-relaxed flex-1">
                  Todas as fotos aparecem em tempo real. Exiba no telão durante a festa e baixe tudo em alta resolução depois.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banner inferior: Galeria no Telão */}
        <div className={`bento-card overflow-hidden transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="grid md:grid-cols-2 gap-0">

            {/* Lado esquerdo: texto */}
            <div className="p-10 sm:p-14 flex flex-col justify-center relative">
              <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{ background: 'radial-gradient(circle at 0% 50%, #E85A70 0%, transparent 70%)' }} />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-6"
                  style={{ background: '#F8F9FA', color: '#1c1c1e', border: '1px solid #ede7e4' }}>
                  <Wifi className="w-3.5 h-3.5 text-[#E85A70]" />
                  Em Tempo Real
                </div>

                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-[#1c1c1e] mb-5 leading-tight">
                  Exiba no telão.<br />
                  <span style={{ color: '#E85A70' }}>Surpreenda a todos.</span>
                </h3>

                <p className="text-gray-500 mb-8 leading-relaxed">
                  Conecte um notebook à TV ou projetor e abra a galeria. As fotos dos convidados aparecem automaticamente — sem refresh, sem demora.
                </p>

                <div className="space-y-3.5">
                  {[
                    { icon: Tv, text: 'Compatível com qualquer TV ou projetor' },
                    { icon: Wifi, text: 'Atualização instantânea sem intervenção' },
                    { icon: Images, text: 'Download em alta resolução após o evento' },
                  ].map(({ icon: Icon, text }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-[#E85A70]" />
                      </div>
                      <span className="text-gray-600 font-medium text-sm">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lado direito: grade de fotos */}
            <div className="relative bg-[#F8F9FA] p-6 flex items-center justify-center min-h-[340px]">
              {/* TV mockup */}
              <div className="w-full max-w-sm">
                <div className="bg-[#1c1c1e] rounded-2xl p-3 shadow-2xl">
                  {/* Barra superior da "TV" */}
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                    </span>
                    <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">Ao Vivo</span>
                    <span className="ml-auto text-[10px] text-gray-500 font-medium">lume.app/e/casamento</span>
                  </div>
                  {/* Tiras da cabine no telão */}
                  <div className="flex gap-1.5 rounded-xl overflow-hidden items-stretch">
                    {[0.55, 1, 0.55].map((opacity, i) => (
                      <div key={i} className="flex-1 rounded-lg overflow-hidden" style={{ opacity }}>
                        <img
                          src="/cabine-foto.png"
                          alt=""
                          className="w-full h-full object-cover object-top"
                          style={{ minHeight: 130 }}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                {/* Pé da TV */}
                <div className="flex justify-center mt-2">
                  <div className="w-16 h-1.5 rounded-full bg-[#ede7e4]" />
                </div>
              </div>

              {/* Badge flutuante */}
              <div className="absolute top-5 right-5 bg-white rounded-2xl px-3.5 py-2.5 shadow-lg border border-[#ede7e4] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-[#1c1c1e]">54 fotos enviadas</p>
                  <p className="text-[9px] text-gray-400">agora mesmo</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
