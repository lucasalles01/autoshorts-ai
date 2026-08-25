import crypto from 'crypto';
import { env } from '../config/env.js';
import { prisma } from '../database/client.js';

export interface PaymentWebhookEvent {
  event: string;
  data: any;
  timestamp: number;
  signature?: string;
}

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

export class PaymentService {
  private stripeWebhookSecret: string;
  private mercadoPagoWebhookSecret: string;

  constructor() {
    this.stripeWebhookSecret = env.STRIPE_WEBHOOK_SECRET || '';
    this.mercadoPagoWebhookSecret = env.MERCADO_PAGO_WEBHOOK_SECRET || '';
  }

  async handleStripeWebhook(payload: string, signature: string): Promise<PaymentWebhookEvent> {
    try {
      if (!this.stripeWebhookSecret) {
        throw new Error('Stripe webhook secret not configured');
      }

      // Verificar assinatura do Stripe
      const expectedSignature = crypto
        .createHmac('sha256', this.stripeWebhookSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const event = JSON.parse(payload) as PaymentWebhookEvent;
      await processPaymentEvent(event);
      
      return event;
    } catch (error) {
      console.error('Error processing Stripe webhook:', error);
      throw error;
    }
  }

  async handleMercadoPagoWebhook(payload: string, signature: string): Promise<PaymentWebhookEvent> {
    try {
      if (!this.mercadoPagoWebhookSecret) {
        throw new Error('Mercado Pago webhook secret not configured');
      }

      // Verificar assinatura do Mercado Pago
      const expectedSignature = crypto
        .createHmac('sha256', this.mercadoPagoWebhookSecret)
        .update(payload)
        .digest('hex');

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature');
      }

      const event = JSON.parse(payload) as PaymentWebhookEvent;
      await processPaymentEvent(event);
      
      return event;
    } catch (error) {
      console.error('Error processing Mercado Pago webhook:', error);
      throw error;
    }
  }

  async createPaymentIntent(userId: string, planId: string): Promise<{ clientSecret: string; paymentId: string }> {
    // Implementação placeholder - na prática chamaria Stripe API
    const paymentId = crypto.randomUUID();
    
    // Criar registro de pagamento no banco
    await prisma.payment.create({
      data: {
        userId,
        planId,
        amount: 0, // Será preenchido baseado no plano
        status: 'PENDING',
        paymentId,
        provider: 'STRIPE'
      }
    });

    return {
      clientSecret: 'pi_' + crypto.randomBytes(32).toString('hex'),
      paymentId
    };
  }

  async getUserCredits(userId: string): Promise<number> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { credits: true }
    });

    return user?.credits?.amount || 0;
  }

  async deductCredits(userId: string, amount: number): Promise<void> {
    const currentCredits = await this.getUserCredits(userId);
    
    if (currentCredits < amount) {
      throw new Error('Insufficient credits');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          update: {
            amount: {
              decrement: amount
            }
          }
        }
      }
    });
  }

  async addCredits(userId: string, amount: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          upsert: {
            create: { amount },
            update: { amount: { increment: amount } }
          }
        }
      }
    });
  }

  getAvailablePlans(): PaymentPlan[] {
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: 29.90,
        credits: 100,
        features: [
          '100 minutos de processamento',
          'Publicação em 1 plataforma',
          'Suporte por email',
          'Exportação em 720p'
        ]
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 79.90,
        credits: 500,
        features: [
          '500 minutos de processamento',
          'Publicação em 3 plataformas',
          'IA avançada de ganchos',
          'Exportação em 1080p',
          'Suporte prioritário'
        ]
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 199.90,
        credits: 2000,
        features: [
          '2000 minutos de processamento',
          'Publicação ilimitada',
          'IA personalizada',
          'Exportação em 4K',
          'API access',
          'Suporte dedicado 24/7'
        ]
      }
    ];
  }
}

async function processPaymentEvent(event: PaymentWebhookEvent): Promise<void> {
  switch (event.event) {
    case 'payment.succeeded':
    case 'payment.approved':
      await handleSuccessfulPayment(event.data);
      break;
    case 'payment.failed':
    case 'payment.rejected':
      await handleFailedPayment(event.data);
      break;
    default:
      console.log(`Unhandled event type: ${event.event}`);
  }
}

async function handleSuccessfulPayment(data: any): Promise<void> {
  const { userId, planId, amount } = data;
  
  // Atualizar status do pagamento
  await prisma.payment.updateMany({
    where: { paymentId: data.paymentId },
    data: { status: 'COMPLETED' }
  });

  // Adicionar créditos ao usuário
  const paymentService = new PaymentService();
  const plans = paymentService.getAvailablePlans();
  const plan = plans.find(p => p.id === planId);
  
  if (plan) {
    await paymentService.addCredits(userId, plan.credits);
  }
}

async function handleFailedPayment(data: any): Promise<void> {
  await prisma.payment.updateMany({
    where: { paymentId: data.paymentId },
    data: { status: 'FAILED' }
  });
}

export const paymentService = new PaymentService();