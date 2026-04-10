import { useState } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

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
    question: 'Posso testar antes de comprar?',
    answer: 'Sim! Você pode criar uma conta gratuita e testar as funcionalidades básicas com limite de envios para ver como tudo funciona perfeitamente.',
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-[#1c1c1e] mb-4">
            Dúvidas frequentes
          </h2>
          <p className="text-lg text-gray-500">
            Tudo o que você precisa saber sobre a nossa plataforma
          </p>
        </div>

        <div className="space-y-3">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#ede7e4] overflow-hidden transition-all duration-300"
                style={{ borderRadius: '24px' }}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-[#FDF2F4]/30 transition-colors"
                >
                  <span className={`text-base font-bold transition-colors ${isOpen ? 'text-[#E85A70]' : 'text-[#1c1c1e]'}`}>
                    {item.question}
                  </span>
                  
                  {/* Plus/Minus Indicator Memoly Style */}
                  <div className="w-8 h-8 rounded-full bg-[#f9fafb] flex items-center justify-center border border-[#ede7e4] flex-shrink-0 transition-colors"
                       style={{ background: isOpen ? '#FDF2F4' : '#f9fafb' }}>
                    {isOpen ? (
                      <Minus className="w-4 h-4 text-[#E85A70]" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#1c1c1e]" />
                    )}
                  </div>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 text-gray-500 text-sm leading-relaxed border-t border-[#ede7e4] pt-4 mx-6">
                    {item.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm font-medium">
          <p className="text-gray-500 mb-2">
            Ainda tem dúvidas? Fale com nosso suporte.
          </p>
          <a
            href="#"
            className="text-[#E85A70] hover:underline transition-all"
          >
            contato@lume.app.br
          </a>
        </div>
      </div>
    </section>
  );
}
