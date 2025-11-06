import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { trpcRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { fastifyTRPCPlugin } from '@trpc/server/adapters/fastify';
import { initQueue } from './queue';
import { errorHandler } from './middleware/errorHandler';
import * as Sentry from '@sentry/node';

const start = async () => {
  // Initialize Sentry (optional)
  if (config.sentryDsn) {
    Sentry.init({
      dsn: config.sentryDsn,
      environment: config.nodeEnv,
      tracesSampleRate: config.nodeEnv === 'production' ? 0.1 : 1.0,
    });
  }

  const fastify = Fastify({
    logger: {
      level: config.nodeEnv === 'production' ? 'info' : 'debug',
      transport:
        config.nodeEnv === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    maxParamLength: 5000,
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    requestIdHeader: 'x-request-id',
  });

  // Error handler
  fastify.setErrorHandler(errorHandler);

  // CORS
  await fastify.register(cors, {
    origin: config.nodeEnv === 'development' ? true : config.allowedOrigins,
    credentials: true,
  });

  // Health check (before other routes)
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
      version: '1.0.0',
    };
  });

  // Readiness check (includes dependencies)
  fastify.get('/ready', async (request, reply) => {
    try {
      // Check database
      const { prisma } = await import('./db');
      await prisma.$queryRaw`SELECT 1`;

      // Check Redis
      const { jobQueue } = await import('./queue');
      await jobQueue.client.ping();

      reply.send({
        status: 'ready',
        checks: {
          database: 'ok',
          redis: 'ok',
        },
      });
    } catch (error: any) {
      reply.status(503).send({
        status: 'not ready',
        error: error.message,
      });
    }
  });

  // Initialize job queue
  try {
    await initQueue();
    fastify.log.info('📬 Job queue initialized');
  } catch (error: any) {
    fastify.log.error('Failed to initialize queue:', error);
    if (config.nodeEnv === 'production') {
      process.exit(1);
    } else {
      fastify.log.warn('⚠️  Queue not available - continuing in dev mode');
    }
  }

  // tRPC
  await fastify.register(fastifyTRPCPlugin, {
    prefix: '/trpc',
    trpcOptions: {
      router: trpcRouter,
      createContext,
      onError({ error, type, path, input, ctx, req }) {
        fastify.log.error({
          type,
          path,
          error: error.message,
          code: error.code,
        });
        
        if (config.sentryDsn) {
          Sentry.captureException(error, {
            contexts: {
              trpc: { type, path, input },
            },
          });
        }
      },
    },
  });

  // Worker callback endpoint (internal)
  fastify.post('/internal/worker-callback', async (request, reply) => {
    const { jobId, success, resultKey, error } = request.body as any;
    const { handleWorkerCallback } = await import('./services/jobService');

    try {
      await handleWorkerCallback(jobId, success, resultKey, error);
      return { success: true };
    } catch (err: any) {
      fastify.log.error('Worker callback error:', err);
      reply.code(500);
      return { success: false, error: err.message };
    }
  });

  // Cleanup endpoint (for cron jobs)
  fastify.post('/internal/cleanup', async (request, reply) => {
    // Add auth check in production
    const authHeader = request.headers.authorization;
    if (config.nodeEnv === 'production' && authHeader !== `Bearer ${config.apiSecret}`) {
      reply.code(401);
      return { error: 'Unauthorized' };
    }

    try {
      const { cleanupExpiredJobImages } = await import('./services/complianceService');
      await cleanupExpiredJobImages();
      return { success: true, message: 'Cleanup completed' };
    } catch (err: any) {
      fastify.log.error('Cleanup error:', err);
      reply.code(500);
      return { success: false, error: err.message };
    }
  });

  // Graceful shutdown
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, closing server gracefully...`);
      await fastify.close();
      process.exit(0);
    });
  });

  // Start server
  try {
    await fastify.listen({
      port: config.port,
      host: '0.0.0.0',
    });
    
    fastify.log.info(`
    ╔═══════════════════════════════════════════╗
    ║                                           ║
    ║   🐾 Kittypup API Server                   ║
    ║                                           ║
    ║   Environment: ${config.nodeEnv.padEnd(27)}║
    ║   Port: ${String(config.port).padEnd(33)}║
    ║   Health: http://localhost:${config.port}/health    ║
    ║                                           ║
    ╚═══════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
