import { useRef, useEffect, useState } from 'react';
import { ArrowUpRight, Camera, QrCode, Palette, Download, Share2, Zap } from 'lucide-react';

/* ── Dados dos serviços ── */
const SERVICES = [
  {
    id: 'cabine-digital',
    icon: Camera,
    title: 'Cabine de Fotos Digital',
    description:
      'A experiência clássica da tira de 3 fotos que todo mundo ama — agora 100% digital, sem fila, sem câmera física.',
    tag: 'Mais popular',
    img: '/cabine-foto.png',
    accent: true,
  },
  {
    id: 'qr-code',
    icon: QrCode,
    title: 'QR Code Instantâneo',
    description:
      'Um QR único por evento. Seus convidados escaneiam, fotografam e a imagem já aparece na galeria em tempo real.',
    tag: 'Zero fricção',
    img: null,
    accent: false,
  },
  {
    id: 'temas',
    icon: Palette,
    title: 'Temas Personalizados',
    description:
      'Escolha a identidade visual do seu evento: molduras, cores, logotipo e mensagem personalizada.',
    tag: 'Sua marca',
    img: null,
    accent: false,
  },
  {
    id: 'download',
    icon: Download,
    title: 'Download em Alta Resolução',
    description:
      'Todas as fotos e vídeos salvos em qualidade original. Nenhuma memória comprimida, nenhum detalhe perdido.',
    tag: 'Qualidade total',
    img: null,
    accent: false,
  },
  {
    id: 'compartilhar',
    icon: Share2,
    title: 'Galeria Compartilhável',
    description:
      'Uma galeria online com link único para o evento. Envie para todo mundo pelo WhatsApp com um clique.',
    tag: 'Ao vivo',
    img: null,
    accent: false,
  },
  {
    id: 'setup',
    icon: Zap,
    title: 'Setup em 2 Minutos',
    description:
      'Crie o evento, configure o tema e gere o QR Code. Tudo pronto antes de os convidados chegarem.',
    tag: 'Rápido assim',
    img: null,
    accent: false,
  },
];

/* ── Hook para animar cada card individualmente ── */
function useCardVisible(delay = 0) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return { ref, visible };
}

/* ── Card animado ── */
function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[number];
  index: number;
}) {
  const { ref, visible } = useCardVisible(index * 90);
  const Icon = service.icon;

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col justify-between p-7 bento-card bento-card-hover cursor-default
        transition-all duration-700 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-24'}
      `}
    >
      {/* Glow de fundo no hover */}
      <div className="pointer-events-none absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'radial-gradient(circle at 70% 30%, rgba(232,90,112,0.06) 0%, transparent 70%)' }}
      />

      {/* Topo: ícone + tag */}
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
            service.accent ? 'bg-[#E85A70]' : 'bg-[#FDF2F4]'
          }`}
        >
          <Icon
            className={`w-5 h-5 ${service.accent ? 'text-white' : 'text-[#E85A70]'}`}
          />
        </div>

        <span
          className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{
            background: service.accent ? 'rgba(255,255,255,0.18)' : 'rgba(232,90,112,0.08)',
            color: service.accent ? '#fff' : '#E85A70',
            border: service.accent ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(232,90,112,0.18)',
          }}
        >
          {service.tag}
        </span>
      </div>

      {/* Imagem opcional (apenas card principal) */}
      {service.img && (
        <div className="mb-5 rounded-2xl overflow-hidden" style={{ maxHeight: 140 }}>
          <img
            src={service.img}
            alt={service.title}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      )}

      {/* Texto */}
      <div className="flex-1">
        <h3
          className="font-display text-xl font-extrabold mb-2 leading-tight"
          style={{ color: service.accent ? '#1c1c1e' : '#1c1c1e', letterSpacing: '-0.03em' }}
        >
          {service.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{service.description}</p>
      </div>

      {/* Seta de detalhe */}
      <div className="mt-6 flex justify-end">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
            service.accent
              ? 'bg-[#E85A70] text-white'
              : 'bg-[#F6F3F1] text-[#E85A70] group-hover:bg-[#E85A70] group-hover:text-white'
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

/* ── Seção principal ── */
export function ServicesSection() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]" id="services">
      <div className="max-w-7xl mx-auto">

        {/* ── Cabeçalho (mesmo padrão do Hero: badge + split headline + parágrafo) ── */}
        <div
          ref={headerRef}
          className={`grid lg:grid-cols-2 gap-8 items-end mb-16 transition-all duration-1000 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Coluna esquerda */}
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold mb-5 w-fit"
              style={{ background: '#FDF2F4', color: '#E85A70', border: '1px solid rgba(232,90,112,0.2)' }}
            >
              <span className="flex h-2 w-2 rounded-full bg-[#E85A70]" />
              / O que oferecemos
            </div>

            <h2
              className="font-display text-[#1c1c1e] leading-[1.05]"
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3.75rem)' }}
            >
              Tudo para o seu<br />
              <span className="text-[#E85A70]">evento brilhar.</span>
            </h2>
          </div>

          {/* Coluna direita */}
          <div className="lg:pb-2">
            <p className="text-base text-gray-500 leading-relaxed max-w-md mb-6">
              De reparos e instalações a manutenção preventiva — aqui você encontra cada
              recurso que precisa para criar uma celebração inesquecível.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('pricing')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-rose flex items-center gap-2 px-6 py-3 text-sm shadow-[0_8px_20px_-8px_rgba(232,90,112,0.5)]"
              >
                Ver todos os planos
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => window.scrollTo({ top: document.getElementById('demo')?.offsetTop || 0, behavior: 'smooth' })}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-sm"
              >
                Como funciona
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Grid de cards ── */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

      </div>
    </section>
  );
}
