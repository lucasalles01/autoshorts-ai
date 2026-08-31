import { prisma } from './database/client.js';
import { socialPublisherService } from './services/social-publisher.js';
import { env } from './config/env.js';

// Local enum
enum ScheduledPostStatus {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED"
}

const TICK_MS = 30_000;

let running = false;
let timer: NodeJS.Timeout | null = null;

/**
 * Verifica periodicamente os agendamentos vencidos e dispara a publicação.
 * Sem isso os posts agendados ficavam parados para sempre no banco.
 */
async function tick() {
  if (running) return;
  running = true;

  try {
    const due = await prisma.scheduledPost.findMany({
      where: {
        status: ScheduledPostStatus.SCHEDULED,
        scheduledAt: { lte: new Date() }
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5
    });

    for (const post of due) {
      if (post.attempts >= post.maxAttempts) {
        await prisma.scheduledPost.update({
          where: { id: post.id },
          data: {
            status: ScheduledPostStatus.FAILED,
            lastError: 'Número máximo de tentativas excedido.'
          }
        });
        continue;
      }

      const result = await socialPublisherService.publishScheduledPost(post.id);
      if (env.NODE_ENV === 'development') {
        console.log(
          `[Scheduler] Post ${post.id}: ${result.success ? 'publicado' : `falhou — ${result.error}`}`
        );
      }
    }
  } catch (err: any) {
    if (env.NODE_ENV === 'development') {
      console.error('[Scheduler] Erro no ciclo de publicação:', err.message);
    }
  } finally {
    running = false;
  }
}

export function startScheduler() {
  if (timer) return;
  timer = setInterval(() => void tick(), TICK_MS);
  void tick();
  if (env.NODE_ENV === 'development') {
    console.log(`  Agendador        ativo (verifica a cada ${TICK_MS / 1000}s)`);
  }
}

export function stopScheduler() {
  if (timer) clearInterval(timer);
  timer = null;
}
