import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './config';

const connection = new IORedis({
  host: config.redisHost,
  port: config.redisPort,
  password: config.redisPassword,
  maxRetriesPerRequest: null,
});

export const jobQueue = new Queue('image-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100,
      age: 24 * 3600, // 24 hours
    },
    removeOnFail: {
      count: 1000,
      age: 7 * 24 * 3600, // 7 days
    },
  },
});

export const initQueue = async () => {
  console.log('📬 Queue initialized');
};

// Worker that dispatches to Python GPU service
export const startWorker = () => {
  const worker = new Worker(
    'image-generation',
    async (job) => {
      const { dispatchToGpuWorker } = await import('./services/gpuDispatcher');
      return dispatchToGpuWorker(job.data);
    },
    {
      connection,
      concurrency: 5, // Adjust based on GPU capacity
    }
  );

  worker.on('completed', (job) => {
    console.log(`✅ Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
  });

  console.log('👷 Worker started');
  return worker;
};

