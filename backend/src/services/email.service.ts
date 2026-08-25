import { env } from '../config/env.js';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private resendApiKey: string;
  private fromEmail: string;

  constructor() {
    this.resendApiKey = env.RESEND_API_KEY || '';
    this.fromEmail = env.RESEND_FROM_EMAIL || 'noreply@autoshorts.ai';
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<void> {
    if (!this.resendApiKey) {
      console.warn('Resend API key not configured. Email not sent.');
      return;
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      console.log('Email sent successfully to:', to);
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const template = this.getWelcomeTemplate(name);
    await this.sendEmail(email, template);
  }

  async sendWaitlistConfirmation(email: string, name?: string): Promise<void> {
    const template = this.getWaitlistTemplate(name);
    await this.sendEmail(email, template);
  }

  async sendPaymentConfirmation(email: string, planName: string, amount: number): Promise<void> {
    const template = this.getPaymentTemplate(planName, amount);
    await this.sendEmail(email, template);
  }

  private getWelcomeTemplate(name?: string): EmailTemplate {
    const userName = name || 'Criador de Conteúdo';
    
    return {
      subject: 'Bem-vindo ao AutoShorts AI! 🚀',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 AutoShorts AI</h1>
              <p>Bem-vindo, ${userName}!</p>
            </div>
            <div class="content">
              <h2>Sua jornada para criar conteúdo viral começa agora!</h2>
              <p>Olá, ${userName}! Estamos muito felizes em ter você conosco.</p>
              <p>Com o AutoShorts AI, você pode:</p>
              <ul>
                <li>✨ Transformar vídeos longos em múltiplos Shorts automaticamente</li>
                <li>🎯 Detectar os melhores momentos com IA avançada</li>
                <li>📝 Adicionar legendas automáticas em estilos variados</li>
                <li>🚀 Publicar simultaneamente em TikTok, Instagram e YouTube</li>
              </ul>
              <p>Você tem <strong>100 minutos de processamento grátis</strong> para começar!</p>
              <a href="https://autoshorts.ai/dashboard" class="button">Começar Agora</a>
              <p>Se precisar de ajuda, estamos sempre por aqui.</p>
              <p>Equipe AutoShorts AI 💜</p>
            </div>
            <div class="footer">
              <p>© 2026 AutoShorts AI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Bem-vindo ao AutoShorts AI! ${userName}, sua jornada para criar conteúdo viral começa agora. Você tem 100 minutos de processamento grátis para começar!`
    };
  }

  private getWaitlistTemplate(name?: string): EmailTemplate {
    const userName = name || 'Criador de Conteúdo';
    
    return {
      subject: 'Você está na lista! 🎉 - AutoShorts AI',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .discount { background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 AutoShorts AI</h1>
              <p>Você está na lista de espera!</p>
            </div>
            <div class="content">
              <h2>Parabéns, ${userName}! 🎉</h2>
              <p>Obrigado por se juntar à nossa lista de espera exclusiva.</p>
              <div class="discount">
                <h3>🎁 Desconto Especial de Lançamento</h3>
                <p><strong>30% OFF</strong> no plano Pro quando lançarmos!</p>
              </div>
              <p>Você será notificado assim que lançarmos. Enquanto isso, fique ligado nas nossas redes sociais.</p>
              <p>Equipe AutoShorts AI 💜</p>
            </div>
            <div class="footer">
              <p>© 2026 AutoShorts AI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Parabéns, ${userName}! Você está na lista de espera do AutoShorts AI com desconto de 30% no lançamento!`
    };
  }

  private getPaymentTemplate(planName: string, amount: number): EmailTemplate {
    return {
      subject: `Pagamento Confirmado - Plano ${planName} | AutoShorts AI`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #ecfdf5; border: 2px solid #10b981; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎬 AutoShorts AI</h1>
              <p>Pagamento Confirmado!</p>
            </div>
            <div class="content">
              <div class="success">
                <h3>✅ Pagamento Recebido com Sucesso</h3>
              </div>
              <h2>Plano ${planName} Ativado</h2>
              <p>Valor pago: R$ ${amount.toFixed(2)}</p>
              <p>Seus créditos já foram adicionados à sua conta e você pode começar a usar todos os recursos do plano ${planName} imediatamente.</p>
              <a href="https://autoshorts.ai/dashboard" class="button">Ir para o Dashboard</a>
              <p>Se precisar de ajuda, estamos sempre por aqui.</p>
              <p>Equipe AutoShorts AI 💜</p>
            </div>
            <div class="footer">
              <p>© 2026 AutoShorts AI. Todos os direitos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Pagamento confirmado! Plano ${planName} ativado. Valor: R$ ${amount.toFixed(2)}. Seus créditos foram adicionados.`
    };
  }
}

export const emailService = new EmailService();