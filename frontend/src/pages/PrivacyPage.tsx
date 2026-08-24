import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">Política de Privacidade</h1>
            <p className="text-gray-400">Última atualização: Agosto 2026</p>
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">1. Compromisso com a Privacidade</h2>
              <p>
                O AutoShorts AI está comprometido em proteger a privacidade e segurança dos dados dos nossos usuários. 
                Esta política descreve como coletamos, usamos e protegemos suas informações pessoais.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">2. Informações Coletadas</h2>
              <p>
                Coletamos as seguintes informações:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Informações de Conta:</strong> Nome, email e informações de perfil</li>
                <li><strong>Conteúdo do Usuário:</strong> Vídeos carregados, transcrições e cortes gerados</li>
                <li><strong>Dados de Uso:</strong> Informações sobre como você usa nossa plataforma</li>
                <li><strong>Credenciais de APIs:</strong> Tokens de acesso para integrações com redes sociais</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">3. Uso das Informações</h2>
              <p>
                Usamos suas informações para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Processar vídeos e gerar cortes automáticos</li>
                <li>Gerenciar suas contas de redes sociais</li>
                <li>Publicar conteúdo em plataformas autorizadas</li>
                <li>Comunicar atualizações e suporte</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">4. Integração com API do TikTok</h2>
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold text-purple-400">Uso Responsável e Proteção de Dados</h3>
                <p>
                  O AutoShorts AI utiliza a API oficial do TikTok para login e publicação de mídia. 
                  Nosso compromisso com a proteção de dados inclui:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Autenticação Segura:</strong> Utilizamos OAuth 2.0 para autenticação segura</li>
                  <li><strong>Tokens Criptografados:</strong> Tokens de acesso são armazenados de forma criptografada</li>
                  <li><strong>Permissões Mínimas:</strong> Solicitamos apenas as permissões necessárias para o funcionamento</li>
                  <li><strong>Sem Coleta Excessiva:</strong> Não coletamos dados além do necessário para o serviço</li>
                  <li><strong>Conformidade com Termos:</strong> Seguimos rigorosamente os termos de uso da API do TikTok</li>
                  <li><strong>Transparência:</strong> Informamos claramente quais dados são acessados através da API</li>
                </ul>
                <p className="text-sm text-gray-400">
                  <strong>Nota:</strong> O AutoShorts AI não armazena credenciais de login do TikTok diretamente. 
                  Utilizamos tokens de acesso fornecidos pela API oficial que podem ser revogados a qualquer momento pelo usuário.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">5. Proteção de Dados</h2>
              <p>
                Implementamos medidas de segurança robustas para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criptografia de dados em repouso e em trânsito</li>
                <li>Controle de acesso restrito a informações sensíveis</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Conformidade com LGPD e outras regulamentações</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">6. Compartilhamento de Dados</h2>
              <p>
                Não vendemos suas informações pessoais. Compartilhamos dados apenas:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Com serviços de processamento de vídeo (quando necessário)</li>
                <li>Com plataformas de redes sociais (para publicação autorizada)</li>
                <li>Quando exigido por lei</li>
                <li>Com seu consentimento explícito</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">7. Seus Direitos</h2>
              <p>
                Você tem o direito de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar suas informações pessoais</li>
                <li>Corrigir informações incorretas</li>
                <li>Excluir sua conta e dados associados</li>
                <li>Revogar autorizações de integração com redes sociais</li>
                <li>Exportar seus dados</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">8. Retenção de Dados</h2>
              <p>
                Mantemos seus dados apenas pelo tempo necessário para fornecer nossos serviços, 
                conforme exigido por lei ou conforme solicitado por você.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">9. Cookies e Tecnologias Similares</h2>
              <p>
                Utilizamos cookies para melhorar a experiência do usuário, analisar o uso do serviço 
                e personalizar conteúdo. Você pode gerenciar suas preferências de cookies nas configurações do navegador.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">10. Alterações nesta Política</h2>
              <p>
                Reservamo-nos o direito de atualizar esta política de privacidade. Notificaremos os 
                usuários sobre alterações significativas através de aviso na plataforma.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">11. Contato</h2>
              <p>
                Para dúvidas sobre privacidade ou exercer seus direitos, entre em contato:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: privacidade@autoshorts.ai</li>
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