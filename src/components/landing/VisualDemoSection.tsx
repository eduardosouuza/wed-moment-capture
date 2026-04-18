import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Smartphone, Images, CheckCircle2, Wifi, Camera, Tv, Users } from 'lucide-react';

// Tiras de fotos da cabine — variedade de aspect ratios para grade rica
const PHOTO_GRID = [
  { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop&q=60&auto=format', span: 'row-span-2', aspect: 'aspect-[3/4]', width: 600, height: 800 },
  { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=450&fit=crop&q=60&auto=format', span: '', aspect: 'aspect-[4/3]', width: 600, height: 450 },
  { src: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=450&fit=crop&q=60&auto=format', span: '', aspect: 'aspect-[4/3]', width: 600, height: 450 },
  { src: 'https://images.unsplash.com/photo-1529634806980-85c3dd6d34ac?w=600&h=450&fit=crop&q=60&auto=format', span: '', aspect: 'aspect-[4/3]', width: 600, height: 450 },
  { src: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0?w=600&h=800&fit=crop&q=60&auto=format', span: 'row-span-2', aspect: 'aspect-[3/4]', width: 600, height: 800 },
  { src: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=450&fit=crop&q=60&auto=format', span: '', aspect: 'aspect-[4/3]', width: 600, height: 450 },
];



export function VisualDemoSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.08 });

  return (
    <section id="demo" ref={ref} className="py-28 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className={`text-center mb-20 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-5"
            style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E85A70]" />
            Como funciona
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Do evento à memória em{' '}
            <span style={{
              background: 'linear-gradient(90deg, #E85A70, #ff8fa3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>3 passos</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            Configure em minutos. Seus convidados usam sem instalar nada.
          </p>
        </div>

        {/* Grid principal */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto mb-20 relative z-10">

          {/* ── PHONE MOCKUP CARD ── */}
          <div
            className={`w-full lg:w-5/12 flex-shrink-0 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
            style={{ transitionDelay: '0ms' }}
          >
            <div className="bento-card h-full flex flex-col items-center justify-center relative overflow-hidden group"
              style={{ background: 'linear-gradient(160deg, #fff 0%, #FDF2F4 100%)' }}>
              {/* Acento rose no topo */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-[32px]"
                style={{ background: 'linear-gradient(90deg, #E85A70, #ff8fa3)' }} />
              {/* Glow */}
              <div className="absolute inset-0 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(circle at 50% 60%, #E85A70 0%, transparent 65%)' }} />

              <div className="p-8 flex flex-col items-center w-full z-10">
                {/* Chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black mb-5 uppercase tracking-[0.15em] self-start"
                  style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.25)' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85A70] opacity-70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E85A70]" />
                  </span>
                  Veja ao vivo
                </div>
                <h3 className="font-display text-2xl font-extrabold text-[#1c1c1e] mb-8 self-start leading-tight">
                  A mágica<br />acontece aqui
                </h3>

                {/* Phone frame */}
                <div className="relative w-full max-w-[230px] aspect-[9/19.5] bg-[#1c1c1e] rounded-[2.5rem] border-[6px] border-[#1c1c1e]
                  overflow-hidden z-10 transform transition-transform duration-700 group-hover:scale-[1.03]"
                  style={{ boxShadow: '0 25px 60px -12px rgba(232,90,112,0.22), 0 8px 20px -8px rgba(0,0,0,0.4)' }}>
                  {/* Dynamic island */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-1/3 h-5 bg-black rounded-full z-20" />
                  {/* Glare */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.06] to-white/0 z-20 pointer-events-none" />
                  <video src="/tutorial cabine de fotos.mp4" autoPlay loop muted playsInline poster="/cabine-foto.png"
                    className="w-full h-full object-cover bg-black" />
                </div>

                {/* Bottom detail chips */}
                <div className="flex items-center gap-2 mt-6 self-start flex-wrap">
                  {['Sem instalar app', '100% navegador', 'iOS & Android'].map((chip) => (
                    <span key={chip} className="text-[10px] font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: '#F6F3F1', color: '#71717A', border: '1px solid #ede7e4' }}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── STEPS COLUMN ── */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center relative">

            {/* Linha conectora vertical (desktop) */}
            <div className="hidden lg:block absolute left-[2.75rem] top-[4.5rem] bottom-[4.5rem] w-px pointer-events-none"
              style={{
                background: isVisible
                  ? 'linear-gradient(180deg, rgba(232,90,112,0.5) 0%, rgba(232,90,112,0.2) 50%, rgba(232,90,112,0.05) 100%)'
                  : 'transparent',
                transition: 'background 1.2s ease 0.4s',
              }} />

            {/* Step 1 */}
            <div
              className={`transition-all duration-700 mb-4 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <div className="bento-card bento-card-hover relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #fdfafb 100%)' }}>
                {/* Rose left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[32px]"
                  style={{ background: 'linear-gradient(180deg, #E85A70, #ff8fa3)' }} />

                <div className="p-6 sm:p-8 flex items-start gap-5 pl-8 sm:pl-10">
                  {/* Step badge */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, #E85A70, #ff8fa3)',
                      boxShadow: '0 8px 20px -8px rgba(232,90,112,0.6)',
                    }}>
                    <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#E85A70] flex items-center justify-center text-[9px] font-black text-[#E85A70]">1</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-1.5">
                      Configure seu evento
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      Dê um nome, escolha o tema e pronto. Em menos de 2 minutos seu evento está no ar com QR Code gerado automaticamente.
                    </p>
                    {/* Detail chip */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.2)' }}>
                      ⚡ Pronto em 2 minutos
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`transition-all duration-700 mb-4 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="bento-card bento-card-hover relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #fdfafb 100%)' }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[32px]"
                  style={{ background: 'linear-gradient(180deg, #E85A70, #ff8fa3)' }} />

                <div className="p-6 sm:p-8 flex items-start gap-5 pl-8 sm:pl-10">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, #E85A70, #ff8fa3)',
                      boxShadow: '0 8px 20px -8px rgba(232,90,112,0.6)',
                    }}>
                    <Smartphone className="w-6 h-6 text-white" strokeWidth={2.5} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#E85A70] flex items-center justify-center text-[9px] font-black text-[#E85A70]">2</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-1.5">
                      Convidados escaneiam
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      Sem baixar app. Basta escanear o QR Code e a câmera da Lume abre direto no navegador do próprio celular, pronta para fotografar.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.2)' }}>
                      📱 Zero downloads necessários
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
              style={{ transitionDelay: '450ms' }}
            >
              <div className="bento-card bento-card-hover relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #fff 0%, #fdfafb 100%)' }}>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[32px]"
                  style={{ background: 'linear-gradient(180deg, #E85A70, #ff8fa3)' }} />

                <div className="p-6 sm:p-8 flex items-start gap-5 pl-8 sm:pl-10">
                  <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center relative"
                    style={{
                      background: 'linear-gradient(135deg, #E85A70, #ff8fa3)',
                      boxShadow: '0 8px 20px -8px rgba(232,90,112,0.6)',
                    }}>
                    <Images className="w-6 h-6 text-white" strokeWidth={2.5} />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#E85A70] flex items-center justify-center text-[9px] font-black text-[#E85A70]">3</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-display text-xl font-extrabold text-[#1c1c1e] mb-1.5">
                      Galeria ao vivo & download
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">
                      Todas as fotos aparecem em tempo real. Exiba no telão durante a festa e baixe tudo em alta resolução após o término.
                    </p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold"
                      style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.2)' }}>
                      🖥️ Exibe no telão em tempo real
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA bottom */}
            <div
              className={`mt-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '600ms' }}
            >
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-rose flex items-center justify-center w-full sm:w-auto px-8 py-4 text-sm"
                style={{ boxShadow: '0 8px 20px -8px rgba(232,90,112,0.6)' }}
              >
                <Camera className="w-4 h-4 mr-2" />
                Criar Meu Evento Agora
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================
            SEÇÃO TELÃO — CINEMÁTICA, ESCURA, IMPACTANTE
        ============================================================ */}
        <div
          className={`relative overflow-hidden rounded-[2rem] transition-all duration-1000 delay-400 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
          style={{
            background: 'linear-gradient(135deg, #0f0f12 0%, #1a0e14 40%, #1c0a12 100%)',
            boxShadow: '0 30px 80px -20px rgba(232,90,112,0.25), 0 0 0 1px rgba(232,90,112,0.08)',
          }}
        >
          {/* Glows decorativos */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,90,112,0.18) 0%, transparent 65%)' }} />
          <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(232,90,112,0.10) 0%, transparent 65%)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse, rgba(232,90,112,0.06) 0%, transparent 70%)' }} />

          <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* ── COPY LEFT ── */}
            <div>
              {/* Badge AO VIVO */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-8"
                style={{ background: 'rgba(232,90,112,0.15)', border: '1px solid rgba(232,90,112,0.3)' }}>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85A70] opacity-70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E85A70]" />
                </span>
                <span className="text-[11px] font-black text-[#E85A70] tracking-[0.18em] uppercase">Ao Vivo</span>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold leading-[1.05] mb-6"
                style={{ color: '#fff', letterSpacing: '-0.04em' }}>
                Exiba no telão.<br />
                <span style={{
                  background: 'linear-gradient(90deg, #E85A70, #ff8fa3)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Surpreenda a todos.</span>
              </h3>

              <p className="text-white/55 text-base sm:text-lg leading-relaxed mb-10 max-w-md">
                Conecte um notebook à TV ou projetor e abra a galeria. As fotos dos seus convidados chegam <strong className="text-white/80 font-semibold">em tempo real</strong> — sem refresh, sem app, sem complicação.
              </p>

              {/* Feature list */}
              <div className="space-y-4 mb-10">
                {[
                  { icon: Tv, text: 'Funciona em qualquer TV ou projetor', sub: 'Basta um navegador aberto' },
                  { icon: Wifi, text: 'Atualização instantânea e automática', sub: 'WebSocket em tempo real' },
                  { icon: Images, text: 'Sem limite de fotos ou vídeos', sub: 'Qualidade original preservada' },
                ].map(({ icon: Icon, text, sub }, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(232,90,112,0.15)', border: '1px solid rgba(232,90,112,0.25)' }}>
                      <Icon className="w-5 h-5 text-[#E85A70]" />
                    </div>
                    <div>
                      <p className="text-white/90 font-semibold text-sm">{text}</p>
                      <p className="text-white/35 text-xs mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8">
                {[
                  { num: '∞', label: 'fotos ao vivo' },
                  { num: '< 1s', label: 'de latência' },
                  { num: '100%', label: 'sem refresh' },
                ].map(({ num, label }) => (
                  <div key={label}>
                    <p className="font-display text-2xl font-extrabold"
                      style={{
                        background: 'linear-gradient(90deg, #E85A70, #ff8fa3)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}>{num}</p>
                    <p className="text-[10px] text-white/35 font-bold uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── TELÃO MOCKUP RIGHT ── */}
            <div className="relative flex items-center justify-center">

              {/* TV frame */}
              <div className="relative w-full max-w-[520px]">
                {/* Glow atrás da TV */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none blur-2xl"
                  style={{ background: 'radial-gradient(ellipse, rgba(232,90,112,0.2) 0%, transparent 70%)', transform: 'scale(1.1)' }} />

                {/* Moldura da TV */}
                <div className="relative rounded-3xl p-[10px]"
                  style={{
                    background: 'linear-gradient(135deg, #2a2a2e, #1a1a1e)',
                    boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 80px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}>

                  {/* Barra de status superior da TV */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-t-2xl mb-1"
                    style={{ background: 'rgba(0,0,0,0.4)' }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85A70] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E85A70]" />
                    </span>
                    <span className="text-[10px] font-black text-[#E85A70] tracking-[0.15em] uppercase">Ao Vivo</span>
                    <div className="flex-1" />
                    <span className="text-[9px] text-white/25 font-medium">lume.app/e/casamento-da-ana</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1" />
                  </div>

                  {/* Grade de fotos ao vivo */}
                  <div className="grid grid-cols-3 gap-1.5 rounded-2xl overflow-hidden"
                    style={{ background: '#0a0a0c', padding: '6px' }}>
                    {PHOTO_GRID.map((photo, i) => (
                      <div key={i}
                        className={`relative overflow-hidden rounded-xl ${photo.span} ${
                          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                        } transition-all duration-700`}
                        style={{ transitionDelay: `${600 + i * 120}ms`, minHeight: 90 }}>
                        <img
                          src={photo.src}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ minHeight: 90 }}
                          width={photo.width}
                          height={photo.height}
                          loading="lazy"
                        />
                        {/* Overlay sutil com gradiente */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />

                        {/* Badge "novo" na última foto */}
                        {i === PHOTO_GRID.length - 1 && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(232,90,112,0.9)', backdropFilter: 'blur(4px)' }}>
                            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                            <span className="text-[8px] font-black text-white tracking-wide uppercase">Novo</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Barra de status inferior */}
                  <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-b-2xl"
                    style={{ background: 'rgba(0,0,0,0.3)' }}>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-white/40" />
                      <span className="text-[9px] text-white/40 font-bold">87 convidados</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Images className="w-3 h-3 text-white/40" />
                      <span className="text-[9px] text-white/40 font-bold">142 fotos</span>
                    </div>
                    <div className="flex-1" />
                    {/* Mini upload bar */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-16 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div className="h-full rounded-full bg-[#E85A70]"
                          style={{ width: isVisible ? '65%' : '0%', transition: 'width 1.5s ease 1s', boxShadow: '0 0 6px #E85A70' }} />
                      </div>
                      <span className="text-[9px] text-[#E85A70] font-black">+3 agora</span>
                    </div>
                  </div>
                </div>

                {/* Pé (suporte) da TV */}
                <div className="flex flex-col items-center mt-2">
                  <div className="w-12 h-3 rounded-b-lg" style={{ background: 'linear-gradient(180deg, #2a2a2e, #1e1e22)' }} />
                  <div className="w-24 h-1.5 rounded-full mt-0.5" style={{ background: '#1e1e22' }} />
                </div>
              </div>

              {/* ── Toast flutuante 1 — canto superior direito ── */}
              <div
                className={`absolute -top-3 -right-3 sm:right-4 sm:top-2 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
                style={{ transitionDelay: '1200ms' }}
              >
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(232,90,112,0.2)', border: '1px solid rgba(232,90,112,0.3)' }}>
                    <span className="text-xs">📸</span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90 leading-none">Ana & Pedro</p>
                    <p className="text-[9px] text-white/40 mt-0.5">enviaram uma foto · agora</p>
                  </div>
                </div>
              </div>

              {/* ── Toast flutuante 2 — canto inferior esquerdo ── */}
              <div
                className={`absolute -bottom-4 -left-3 sm:left-4 sm:bottom-10 transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: '1500ms' }}
              >
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl"
                  style={{
                    background: 'rgba(255,255,255,0.07)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-white/90 leading-none">142 fotos enviadas</p>
                    <p className="text-[9px] text-white/40 mt-0.5">Galeria atualizada automaticamente</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
