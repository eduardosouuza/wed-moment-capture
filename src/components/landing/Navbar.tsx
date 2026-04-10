import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';

const NAV_LINKS = [
  { label: 'Como Funciona', href: 'demo' },
  { label: 'Benefícios', href: 'benefits' },
  { label: 'Preços', href: 'pricing' },
  { label: 'FAQ', href: 'faq' },
];

export function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Active section detection via IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_LINKS.map((l) => l.href);
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-5
        transition-all duration-700 ease-out
        ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
    >
      {/* Desktop pill */}
      <nav
        className={`hidden lg:flex items-center w-full max-w-5xl px-4 py-2.5
          transition-all duration-400 ease-out
          ${scrolled
            ? 'bg-white/85 backdrop-blur-2xl border border-[#ede7e4] shadow-[0_8px_32px_-12px_rgba(0,0,0,0.09)] rounded-2xl'
            : 'bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_2px_16px_-8px_rgba(0,0,0,0.04)] rounded-2xl'
          }`}
      >
        {/* Logo */}
        <div className="flex-shrink-0 mr-6">
          <Logo size="md" />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-[#ede7e4] mr-6" />

        {/* Nav links */}
        <div className="flex items-center gap-1 flex-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.href;
            return (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-colors duration-200 group
                  ${isActive ? 'text-[#E85A70]' : 'text-gray-500 hover:text-[#1c1c1e]'}`}
              >
                {/* Hover / active background */}
                <span
                  className={`absolute inset-0 rounded-xl transition-opacity duration-200
                    bg-[#FDF2F4]
                    ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}
                />
                <span className="relative">{link.label}</span>

                {/* Active underline dot */}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E85A70]" />
                )}
              </button>
            );
          })}
        </div>

        {/* CTA buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary px-4 py-2 text-sm"
          >
            Entrar
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="btn-rose flex items-center gap-1.5 px-5 py-2 text-sm shadow-[0_4px_14px_-6px_rgba(232,90,112,0.55)]"
          >
            Criar Evento
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Mobile bar */}
      <div
        className={`flex lg:hidden items-center justify-between w-full px-4 py-3
          transition-all duration-400 ease-out
          ${scrolled
            ? 'bg-white/90 backdrop-blur-2xl border border-[#ede7e4] shadow-[0_4px_20px_-8px_rgba(0,0,0,0.08)] rounded-2xl'
            : 'bg-white/50 backdrop-blur-md border border-white/60 rounded-2xl'
          }`}
      >
        <Logo size="md" />
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F8F9FA] border border-[#ede7e4] text-[#1c1c1e]"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <div
        className={`absolute top-full left-4 right-4 mt-2 lg:hidden
          bg-white border border-[#ede7e4] rounded-2xl shadow-[0_16px_48px_-12px_rgba(0,0,0,0.12)]
          overflow-hidden transition-all duration-300 ease-out origin-top
          ${mobileOpen ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'}`}
      >
        <div className="p-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollTo(link.href)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-[#E85A70] hover:bg-[#FDF2F4] transition-colors duration-150"
            >
              {link.label}
            </button>
          ))}
        </div>
        <div className="px-3 pb-3 flex flex-col gap-2">
          <button
            onClick={() => navigate('/login')}
            className="btn-secondary w-full py-2.5 text-sm"
          >
            Entrar
          </button>
          <button
            onClick={() => scrollTo('pricing')}
            className="btn-rose w-full flex items-center justify-center gap-2 py-2.5 text-sm"
          >
            Criar Evento
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
