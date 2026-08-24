import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Termos de Serviço</h1>
            <p className="text-gray-400">Última atualização: Agosto 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o AutoShorts AI, você concorda com estes Termos de Serviço. 
                Se você não concordar com qualquer parte destes termos, você não deve usar nosso serviço.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Descrição do Serviço</h2>
              <p>
                O AutoShorts AI é uma plataforma de edição automática de vídeos que permite aos usuários:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Upload de vídeos longos para processamento automático</li>
                <li>Geração automática de cortes verticais para redes sociais</li>
                <li>Adição automática de legendas e transcrições</li>
                <li>Publicação direta em plataformas como TikTok, Instagram e YouTube</li>
                <li>Gerenciamento de contas sociais e agendamento de conteúdo</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Responsabilidades do Usuário</h2>
              <p>
                Ao usar o AutoShorts AI, você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer informações verdadeiras e precisas</li>
                <li>Respeitar os direitos autorais de terceiros</li>
                <li>Não usar o serviço para conteúdo ilegal ou ofensivo</li>
                <li>Manter suas credenciais de acesso seguras</li>
                <li>Respeitar os termos de uso das plataformas de redes sociais</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Propriedade Intelectual</h2>
              <p>
                O AutoShorts AI respeita os direitos de propriedade intelectual. Você mantém a propriedade 
                do conteúdo que você carrega e processa através de nossa plataforma. No entanto, você garante 
                que possui os direitos necessários para usar, modificar e publicar tal conteúdo.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Limitação de Responsabilidade</h2>
              <p>
                O AutoShorts AI não é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Conteúdo gerado automaticamente que possa violar direitos autorais</li>
                <li>Problemas técnicos ou interrupções do serviço</li>
                <li>Perda de dados ou conteúdo do usuário</li>
                <li>Uso indevido do serviço por terceiros</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Política de Reembolso</h2>
              <p>
                Reembolsos são avaliados caso a caso. Entre em contato com nosso suporte para solicitações 
                de reembolso dentro de 30 dias da contratação do serviço.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Modificações dos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos os 
                usuários sobre alterações significativas através de aviso na plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Contato</h2>
              <p>
                Para dúvidas sobre estes Termos de Serviço, entre em contato:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: suporte@autoshorts.ai</li>
                <li>Site: https://autoshorts.ai</li>
              </ul>
            </section>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-700 text-center text-gray-400 text-sm">
            <p>© 2026 AutoShorts AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
};