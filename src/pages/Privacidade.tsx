import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export default function Privacidade() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-gray-500 mb-12">Última atualização: Março de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informações que Coletamos</h2>
            <p className="text-gray-600 leading-relaxed">
              Coletamos as seguintes informações quando você utiliza nosso serviço:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3 ml-4">
              <li>Informações de conta: nome, e-mail e senha (criptografada)</li>
              <li>Dados de pagamento: processados com segurança por nossos parceiros (Stripe)</li>
              <li>Fotos e vídeos: conteúdo capturado pelos participantes dos seus eventos</li>
              <li>Dados de uso: informações sobre como você interage com o serviço</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Como Usamos suas Informações</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos suas informações exclusivamente para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3 ml-4">
              <li>Fornecer e manter o Serviço</li>
              <li>Processar pagamentos e gerenciar sua assinatura</li>
              <li>Enviar comunicações importantes sobre o Serviço</li>
              <li>Melhorar a experiência do usuário</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Armazenamento de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Seus dados são armazenados de forma segura utilizando Supabase, com criptografia em repouso e em trânsito. As fotos e vídeos são armazenados pelo período definido no seu plano contratado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              <strong>Não vendemos, compartilhamos ou transferimos</strong> suas informações pessoais ou conteúdo a terceiros, exceto quando necessário para:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3 ml-4">
              <li>Processar pagamentos (Stripe)</li>
              <li>Cumprir obrigações legais</li>
              <li>Proteger nossos direitos e segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Seus Direitos (LGPD)</h2>
            <p className="text-gray-600 leading-relaxed">
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mt-3 ml-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
              <li>Solicitar a portabilidade dos seus dados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies estritamente necessários para o funcionamento do Serviço, como autenticação e preferências de sessão. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Segurança</h2>
            <p className="text-gray-600 leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo criptografia SSL/TLS, autenticação segura e controle de acesso baseado em funções.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo e-mail: privacidade@lume.app
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
