import { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import * as Sentry from '@sentry/node';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error
  request.log.error(error);

  // Send to Sentry (if configured)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      contexts: {
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      },
    });
  }

  // Determine status code
  const statusCode = error.statusCode || 500;

  // Don't leak error details in production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : error.message;

  // Send error response
  reply.status(statusCode).send({
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
}

