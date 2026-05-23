import { useState } from 'react';
import { Plus, Minus, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'Como funciona o Lume?',
    answer: 'A Lume é uma cabine de fotos 100% digital. Você cria um evento, compartilha um QR Code com os convidados, e eles podem tirar fotos e gravar vídeos diretamente pelo celular deles, sem baixar nenhum app. Tudo vai para uma galeria ao vivo no telão.',
  },
  {
    question: 'Preciso de internet no local do evento?',
    answer: 'Os convidados precisarão de 4G/5G ou Wi-Fi do local para enviar as fotos. Hoje em dia é super comum e os pacotes de dados dão conta do recado tranquilamente.',
  },
  {
    question: 'Quantos convidados podem acessar?',
    answer: 'Não existe limite de convidados acessando o QR code ao mesmo tempo. Nossos servidores escalam automaticamente durante o seu evento.',
  },
  {
    question: 'Como baixo todas as fotos depois?',
    answer: 'Após a festa terminar, você acessa seu painel e com um único clique baixa todas as memórias em alta resolução zipadas.',
  },
  {
    question: 'Posso mostrar as fotos ao vivo em um telão?',
    answer: 'Com certeza. É um dos nossos recursos mais amados! Basta abrir o link da galeria do evento em um notebook ligado à TV ou Projetor.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-[#F8F9FA] relative overflow-hidden">
      {/* Blob decorativo de fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-[#E85A70] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="badge-rose inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded-full">
            FAQ
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Dúvidas frequentes
          </h2>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            Tudo o que você precisa saber antes de criar seu evento.
          </p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            const num = String(index + 1).padStart(2, '0');

            return (
              <div
                key={index}
                className="overflow-hidden transition-all duration-300"
                style={{
                  borderRadius: '24px',
                  border: isOpen ? '1.5px solid rgba(232,90,112,0.30)' : '1.5px solid #ede7e4',
                  background: isOpen
                    ? 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 60%)'
                    : '#FFFFFF',
                  boxShadow: isOpen
                    ? '0 8px 32px -8px rgba(232,90,112,0.18)'
                    : '0 2px 8px -4px rgba(0,0,0,0.04)',
                }}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full px-6 py-5 text-left flex items-center gap-4 group"
                >
                  {/* Número */}
                  <span
                    className="text-xs font-extrabold tracking-widest flex-shrink-0 w-7 transition-colors duration-300"
                    style={{ color: isOpen ? '#E85A70' : '#d1d5db' }}
                  >
                    {num}
                  </span>

                  {/* Pergunta */}
                  <span
                    className="flex-1 text-base font-bold transition-colors duration-300"
                    style={{ color: isOpen ? '#E85A70' : '#1c1c1e' }}
                  >
                    {item.question}
                  </span>

                  {/* Ícone */}
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isOpen ? '#E85A70' : '#F8F9FA',
                      border: isOpen ? '1.5px solid #E85A70' : '1.5px solid #ede7e4',
                    }}
                  >
                    {isOpen
                      ? <Minus className="w-3.5 h-3.5 text-white" />
                      : <Plus className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#E85A70] transition-colors" />
                    }
                  </div>
                </button>

                {/* Resposta */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? '200px' : '0px', opacity: isOpen ? 1 : 0 }}
                >
                  <div className="px-6 pb-6 pt-0 flex gap-4">
                    <div className="w-7 flex-shrink-0" /> {/* alinha com o número */}
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 border-t border-[#ede7e4] pt-4">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA de contato */}
        <div
          className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-3xl border border-[#ede7e4]"
          style={{ background: 'linear-gradient(135deg, #FDF2F4 0%, #FFFFFF 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-[#E85A70]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1c1c1e]">Ainda tem dúvidas?</p>
              <p className="text-xs text-gray-400">Nossa equipe responde rápido.</p>
            </div>
          </div>
          <a
            href="mailto:contato@lume.app.br"
            className="btn-rose px-5 py-2.5 text-sm flex-shrink-0"
          >
            Falar com suporte
          </a>
        </div>

      </div>
    </section>
  );
}
