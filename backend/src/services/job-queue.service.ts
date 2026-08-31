import { prisma } from '../database/client.js';
import { env } from '../config/env.js';

export interface JobQueue {
  enqueueJob: (jobData: any) => Promise<string>;
  dequeueJob: () => Promise<any | null>;
  updateJobProgress: (jobId: string, progress: number) => Promise<void>;
  completeJob: (jobId: string, result?: any) => Promise<void>;
  failJob: (jobId: string, error: string) => Promise<void>;
  getJobStatus: (jobId: string) => Promise<any>;
}

class SimpleJobQueue implements JobQueue {
  async enqueueJob(jobData: any): Promise<string> {
    const job = await prisma.job.create({
      data: {
        type: jobData.type || 'VIDEO_PROCESSING',
        status: 'PENDING',
        progress: 0,
        userId: jobData.userId || 'demo-user'
      }
    });
    return job.id;
  }

  async dequeueJob(): Promise<any | null> {
    const job = await prisma.job.findFirst({
      where: {
        status: 'PENDING'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (job) {
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' }
      });
    }

    return job;
  }

  async updateJobProgress(jobId: string, progress: number): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: { progress: Math.min(100, Math.max(0, progress)) }
    });
  }

  async completeJob(jobId: string, result?: any): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        progress: 100
      }
    });
  }

  async failJob(jobId: string, error: string): Promise<void> {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        error: error
      }
    });
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });
    return job;
  }
}

export const jobQueue = new SimpleJobQueue();

// Worker para processar jobs em background
export async function startJobWorker(): Promise<void> {
  if (env.NODE_ENV === 'development') {
    console.log('🚀 Starting job worker...');
  }

  const processNextJob = async () => {
    try {
      const job = await jobQueue.dequeueJob();
      
      if (job) {
        if (env.NODE_ENV === 'development') {
          console.log(`📋 Processing job ${job.id} of type ${job.type}`);
        }
        
        try {
          // Processar job baseado no tipo
          switch (job.type) {
            case 'VIDEO_PROCESSING':
              await processVideoJob(job);
              break;
            default:
              console.error(`Unknown job type: ${job.type}`);
              await jobQueue.failJob(job.id, `Unknown job type: ${job.type}`);
          }
        } catch (error) {
          console.error(`Job ${job.id} failed:`, error);
          await jobQueue.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    } catch (error) {
      if (env.NODE_ENV === 'development') {
        console.error('Error in job worker:', error);
      }
    }

    // Continuar processando
    setTimeout(processNextJob, 1000);
  };

  // Iniciar processamento
  processNextJob();
}

async function processVideoJob(job: any): Promise<void> {
  const { projectId, sourceVideoId, userId } = job.data || {};
  
  if (!projectId || !sourceVideoId) {
    throw new Error('Missing required job data');
  }

  // Atualizar progresso
  await jobQueue.updateJobProgress(job.id, 10);

  // Aqui você chamaria o pipeline de processamento de vídeo
  // Por enquanto, simulamos o processamento
  await simulateVideoProcessing(job.id);

  await jobQueue.completeJob(job.id, { projectId, clipsGenerated: 5 });
}

async function simulateVideoProcessing(jobId: string): Promise<void> {
  const steps = [
    { progress: 20, delay: 2000 },
    { progress: 40, delay: 3000 },
    { progress: 60, delay: 2000 },
    { progress: 80, delay: 3000 },
    { progress: 100, delay: 2000 }
  ];

  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, step.delay));
    await jobQueue.updateJobProgress(jobId, step.progress);
  }
}