import { prisma } from '../database/client.js';

export interface WaitlistEntry {
  id: string;
  email: string;
  name?: string;
  source: string;
  status: 'PENDING' | 'CONFIRMED' | 'CONVERTED';
  createdAt: Date;
}

export class WaitlistService {
  async addToWaitlist(email: string, name?: string, source: string = 'landing_page'): Promise<WaitlistEntry> {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido');
    }

    // Verificar se já existe
    const existing = await prisma.waitlist.findUnique({
      where: { email }
    });

    if (existing) {
      // Atualizar se existir
      return await prisma.waitlist.update({
        where: { email },
        data: { name, source, status: 'PENDING' }
      });
    }

    // Criar novo
    return await prisma.waitlist.create({
      data: {
        email,
        name,
        source,
        status: 'PENDING'
      }
    });
  }

  async getWaitlistStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    converted: number;
  }> {
    const [total, pending, confirmed, converted] = await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.count({ where: { status: 'PENDING' } }),
      prisma.waitlist.count({ where: { status: 'CONFIRMED' } }),
      prisma.waitlist.count({ where: { status: 'CONVERTED' } })
    ]);

    return { total, pending, confirmed, converted };
  }

  async getWaitlistEntries(limit: number = 50): Promise<WaitlistEntry[]> {
    return await prisma.waitlist.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async confirmEmail(email: string): Promise<void> {
    await prisma.waitlist.update({
      where: { email },
      data: { status: 'CONFIRMED' }
    });
  }

  async convertToUser(email: string, userId: string): Promise<void> {
    await prisma.waitlist.update({
      where: { email },
      data: { status: 'CONVERTED', userId }
    });
  }
}

export const waitlistService = new WaitlistService();