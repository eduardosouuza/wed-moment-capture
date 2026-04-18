import { useEffect, useState } from 'react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Camera, ArrowRight, PlayCircle, TrendingUp } from 'lucide-react';

const LIVE_EVENTS = [
  { name: 'Casamento Juliana & Pedro', guests: 48, extra: 31, avatars: [5, 9, 8], label: 'enviando fotos agora' },
  { name: 'Aniversário 15 anos Sofia', guests: 73, extra: 45, avatars: [12, 14, 17], label: 'enviando fotos agora' },
  { name: 'Formatura Medicina 2025', guests: 112, extra: 88, avatars: [20, 22, 25], label: 'fotos chegando ao vivo' },
  { name: 'Casamento Ana & Rafael', guests: 60, extra: 37, avatars: [30, 33, 36], label: 'enviando fotos agora' },
  { name: 'Festa Corporativa TechCo', guests: 95, extra: 60, avatars: [40, 43, 47], label: 'fotos chegando ao vivo' },
];

export function HeroSection() {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  const [eventIdx, setEventIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setEventIdx((prev) => (prev + 1) % LIVE_EVENTS.length);
        setFade(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const event = LIVE_EVENTS[eventIdx];

  return (
    <section
      ref={ref}
      className="relative flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#F8F9FA]"
      /* navbar is fixed ~88px tall (pt-5 + pill height); push content below it */
      style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '1.5rem' }}
    >
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-5 items-stretch">

          {/* ── Left card: headline + CTA ── */}
          <div
            className={`bento-card relative lg:col-span-7 px-8 py-7 sm:px-12 sm:py-10 flex flex-col justify-center transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
            }`}
          >
            <div className="absolute top-0 right-0 w-56 h-56 bg-[#E85A70] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-5 w-fit"
              style={{ background: '#FDF2F4', color: '#E85A70' }}
            >
              <span className="flex h-2 w-2 rounded-full bg-[#E85A70]" />
              A revolução das fotos em eventos
            </div>

            {/* Headline */}
            <h1
              className="font-display text-[#1c1c1e] mb-4 leading-[1.05]"
              style={{ fontSize: 'clamp(2rem, 3.8vw, 4rem)' }}
            >
              Crie memórias,<br />
              <span className="text-[#E85A70]">compartilhe emoções.</span>
            </h1>

            <p className="text-base text-gray-500 mb-7 max-w-lg leading-relaxed">
              Aquela tira de 3 fotos que todo mundo ama — agora digital, compartilhada em tempo real e personalizada com o nome do seu evento.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-rose flex items-center justify-center px-7 py-3.5 text-sm shadow-[0_8px_20px_-8px_rgba(232,90,112,0.6)]"
              >
                <Camera className="w-4 h-4 mr-2" />
                Criar Meu Evento
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('demo')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-secondary flex items-center justify-center px-7 py-3.5 text-sm"
              >
                <PlayCircle className="w-4 h-4 mr-2 text-gray-400" />
                Como funciona
              </button>
            </div>
          </div>

          {/* ── Right column ── */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-h-0">

            {/* Photo strips card */}
            <div
              className={`bento-card flex-1 p-5 relative bg-gradient-to-br from-[#FDF2F4] to-[#FFFFFF] flex items-center justify-center overflow-hidden transition-all duration-1000 delay-150 min-h-0 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div className="relative flex items-end justify-center gap-3">
                {/* glow */}
                <div className="absolute inset-0 rounded-3xl bg-[#E85A70] opacity-[0.07] blur-3xl pointer-events-none" />

                {/* Strip LEFT */}
                <div
                  className="relative bg-[#f7f3ee] rounded-xl border border-[#e8dfd5] overflow-hidden shadow-md flex-shrink-0 opacity-70"
                  style={{ width: 76, transform: 'rotate(-4deg) translateY(10px)' }}
                >
                  <div className="flex flex-col gap-[3px] p-[4px] pb-0">
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover object-top" style={{ height: 58 }} alt="" loading="lazy" />
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover" style={{ height: 58, objectPosition: '50% 45%' }} alt="" loading="lazy" />
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover object-bottom" style={{ height: 58 }} alt="" loading="lazy" />
                  </div>
                  <div className="py-1.5 text-center">
                    <p className="text-[7px] font-bold text-[#1c1c1e]">Ana & Rafael</p>
                    <p className="text-[6px] text-gray-400">15 Mar 2025</p>
                  </div>
                </div>

                {/* Strip CENTER — main */}
                <div
                  className="relative bg-[#f7f3ee] rounded-2xl shadow-xl border border-[#e8dfd5] overflow-hidden flex-shrink-0 z-10"
                  style={{ width: 136 }}
                >
                  <img
                    src="/cabine-foto.png"
                    alt="Casal feliz usando a cabine de fotos"
                    className="w-full block"
                    style={{ maxHeight: 310, objectFit: 'cover', objectPosition: 'top' }}
                    width={136}
                    height={310}
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>

                {/* Strip RIGHT */}
                <div
                  className="relative bg-[#f7f3ee] rounded-xl border border-[#e8dfd5] overflow-hidden shadow-md flex-shrink-0 opacity-70"
                  style={{ width: 76, transform: 'rotate(4deg) translateY(10px)' }}
                >
                  <div className="flex flex-col gap-[3px] p-[4px] pb-0">
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover object-top" style={{ height: 58 }} alt="" loading="lazy" />
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover" style={{ height: 58, objectPosition: '50% 45%' }} alt="" loading="lazy" />
                    <img src="/cabine-foto.png" width={66} height={58} className="w-full rounded-sm object-cover object-bottom" style={{ height: 58 }} alt="" loading="lazy" />
                  </div>
                  <div className="py-1.5 text-center">
                    <p className="text-[7px] font-bold text-[#1c1c1e]">Sofia & Lucas</p>
                    <p className="text-[6px] text-gray-400">22 Jan 2025</p>
                  </div>
                </div>

                {/* Badge Ao vivo */}
                <div className="absolute -top-3 right-12 bg-white rounded-xl px-2.5 py-1.5 shadow-md border border-[#ede7e4] flex items-center gap-1.5 z-20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E85A70] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E85A70]" />
                  </span>
                  <span className="text-[10px] font-bold text-[#E85A70]">Ao vivo</span>
                </div>
              </div>
            </div>

            {/* Live Event Card */}
            <div
              className={`bento-card px-6 py-5 bg-white transition-all duration-1000 delay-300 flex flex-col justify-center ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
            >
              <div
                className="flex items-center gap-3 mb-3 transition-opacity duration-300"
                style={{ opacity: fade ? 1 : 0 }}
              >
                <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full border border-red-100 flex-shrink-0">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-red-600 tracking-wider uppercase">Ao Vivo</span>
                </div>
                <span className="text-gray-300 max-sm:hidden">&bull;</span>
                <span className="text-xs sm:text-sm font-semibold text-[#1c1c1e] truncate">{event.name}</span>
              </div>

              <div
                className="flex items-center gap-4 transition-opacity duration-300"
                style={{ opacity: fade ? 1 : 0 }}
              >
                <div className="flex -space-x-2 shrink-0">
                  {event.avatars.map((imgId, i) => (
                    <img key={i} src={`https://i.pravatar.cc/100?img=${imgId}`} width={36} height={36} alt="Guest" className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm" loading="lazy" />
                  ))}
                  <div className="w-9 h-9 rounded-full border-2 border-white bg-[#F8F9FA] flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">
                    +{event.extra}
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center text-sm font-bold text-[#1c1c1e]">
                    <span className="text-emerald-500 mr-1.5"><TrendingUp className="w-4 h-4" /></span>
                    {event.guests} convidados
                  </div>
                  <span className="text-xs text-gray-500">{event.label}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
