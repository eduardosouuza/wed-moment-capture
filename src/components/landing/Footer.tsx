import { Logo } from '@/components/Logo';
import { Heart } from 'lucide-react';
import type { NavigateFunction } from 'react-router-dom';

interface FooterProps {
  navigate: NavigateFunction;
}

export function Footer({ navigate }: FooterProps) {
  return (
    <footer className="pt-20 pb-10 px-4 sm:px-6 lg:px-8 bg-white border-t border-[#ede7e4]">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <div className="mb-6">
              <Logo variant="dark" size="md" />
            </div>
            <p className="text-sm leading-relaxed text-gray-500 font-medium">
              A cabine de fotos digital que captura a essência dos seus melhores momentos.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm text-[#1c1c1e]">Produto</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#demo" className="transition-colors hover:text-[#E85A70]">Como Funciona</a></li>
              <li><a href="#pricing" className="transition-colors hover:text-[#E85A70]">Preços</a></li>
              <li><a href="#faq" className="transition-colors hover:text-[#E85A70]">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm text-[#1c1c1e]">Empresa</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="#demo" className="transition-colors hover:text-[#E85A70]">Como Funciona</a></li>
              <li><a href="mailto:contato@lume.com.br" className="transition-colors hover:text-[#E85A70]">Contato</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-sm text-[#1c1c1e]">Legal</h4>
            <ul className="space-y-4 text-sm font-medium text-gray-500">
              <li><a href="/termos" onClick={(e) => { e.preventDefault(); navigate('/termos'); }} className="transition-colors hover:text-[#E85A70]">Termos de Uso</a></li>
              <li><a href="/privacidade" onClick={(e) => { e.preventDefault(); navigate('/privacidade'); }} className="transition-colors hover:text-[#E85A70]">Políticas de Privacidade</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 font-medium border-t border-[#ede7e4]">
          <p>© {new Date().getFullYear()} Lume. Todos os direitos reservados.</p>
          <p className="flex items-center mt-4 sm:mt-0">
            Criado com <Heart className="w-4 h-4 mx-1 text-[#E85A70] fill-[#E85A70]" /> para celebrar a vida.
          </p>
        </div>
      </div>
    </footer>
  );
}
