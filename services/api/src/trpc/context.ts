import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../db';

export const createContext = async ({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}) => {
  // In production, extract userId from JWT/session
  // For now, we'll use a header for demo purposes
  const userId = req.headers['x-user-id'] as string | undefined;

  return {
    req,
    res,
    prisma,
    userId,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

