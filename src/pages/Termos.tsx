import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export default function Termos() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Logo size="sm" />
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-purple-600 transition-colors flex items-center">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-gray-500 mb-12">Última atualização: Março de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao acessar e utilizar a plataforma Lume ("Serviço"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concorda com qualquer parte destes termos, não deve utilizar o Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p className="text-gray-600 leading-relaxed">
              A Lume é uma plataforma de cabine de fotos digital que permite aos usuários criar eventos, convidar participantes via QR Code e coletar fotos e vídeos em tempo real. O serviço é oferecido em diferentes planos com funcionalidades variadas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Conta do Usuário</h2>
            <p className="text-gray-600 leading-relaxed">
              Para utilizar determinadas funcionalidades, você precisará criar uma conta. Você é responsável por manter a confidencialidade das suas credenciais de acesso e por todas as atividades que ocorrerem sob sua conta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Pagamentos e Reembolsos</h2>
            <p className="text-gray-600 leading-relaxed">
              Os pagamentos são processados de forma segura através de nossos parceiros de pagamento. Oferecemos garantia de 7 dias — se você não estiver satisfeito com o serviço, devolvemos 100% do valor pago, sem perguntas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Conteúdo do Usuário</h2>
            <p className="text-gray-600 leading-relaxed">
              Você mantém a propriedade de todas as fotos e vídeos capturados através do Serviço. A Lume não utiliza, vende ou compartilha seu conteúdo com terceiros. Armazenamos seu conteúdo apenas pelo período definido no seu plano.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Uso Aceitável</h2>
            <p className="text-gray-600 leading-relaxed">
              Você concorda em não utilizar o Serviço para fins ilegais, ofensivos ou que violem os direitos de terceiros. Reservamo-nos o direito de suspender ou encerrar contas que violem estas regras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h2>
            <p className="text-gray-600 leading-relaxed">
              O Serviço é fornecido "como está". Não nos responsabilizamos por danos indiretos, incidentais ou consequenciais resultantes do uso ou incapacidade de uso do Serviço.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco pelo e-mail: contato@lume.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
