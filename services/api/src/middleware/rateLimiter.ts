import { FastifyRequest } from 'fastify';

export const rateLimiterConfig = {
  global: true,
  max: 100, // requests
  timeWindow: '1 minute',
  ban: 10, // Ban for 10 minutes after exceeding limit
  cache: 10000,
  allowList: ['127.0.0.1'],
  redis: undefined, // Will be set up in index.ts with Redis connection
  keyGenerator: (request: FastifyRequest) => {
    // Use user ID if authenticated, otherwise IP
    return (request.headers['x-user-id'] as string) || request.ip;
  },
  errorResponseBuilder: (request: FastifyRequest, context: any) => {
    return {
      statusCode: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
    };
  },
};

