import { initTRPC, TRPCError } from '@trpc/server';
import { Context } from './context';
import * as schemas from '@kittypup/types';
import { getPresignedUploadUrl, getPresignedDownloadUrl } from '../services/s3Service';
import { createJob, getJob, listUserJobs, handleWorkerCallback } from '../services/jobService';
import { getUserEntitlement, consumeCredit } from '../services/entitlementService';
import { requestDataDeletion, requestDataExport } from '../services/complianceService';
import { verifyPurchase } from '../services/iapService';

const t = initTRPC.context<Context>().create();

const requireAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in',
    });
  }
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
    },
  });
});

const protectedProcedure = t.procedure.use(requireAuth);

export const trpcRouter = t.router({
  // Upload endpoints
  getUploadUrl: protectedProcedure
    .input(schemas.getUploadUrlSchema)
    .output(schemas.uploadUrlResponseSchema)
    .mutation(async ({ input, ctx }) => {
      return getPresignedUploadUrl(input.fileName, input.contentType);
    }),

  // Job endpoints
  createJob: protectedProcedure
    .input(schemas.createJobSchema)
    .output(schemas.jobSchema)
    .mutation(async ({ input, ctx }) => {
      return createJob(ctx.userId, input);
    }),

  getJob: protectedProcedure
    .input(schemas.getJobSchema)
    .output(schemas.jobSchema.nullable())
    .query(async ({ input, ctx }) => {
      return getJob(input.jobId, ctx.userId);
    }),

  listJobs: protectedProcedure
    .input(schemas.listJobsSchema)
    .query(async ({ input, ctx }) => {
      return listUserJobs(ctx.userId, input.limit, input.cursor);
    }),

  // Entitlement endpoints
  getEntitlement: protectedProcedure
    .output(schemas.entitlementSchema)
    .query(async ({ ctx }) => {
      return getUserEntitlement(ctx.userId);
    }),

  consumeCredit: protectedProcedure
    .input(schemas.consumeCreditSchema)
    .mutation(async ({ input, ctx }) => {
      return consumeCredit(ctx.userId, input.jobId);
    }),

  // IAP endpoints
  verifyPurchase: protectedProcedure
    .input(schemas.verifyPurchaseSchema)
    .output(schemas.purchaseResultSchema)
    .mutation(async ({ input, ctx }) => {
      return verifyPurchase(ctx.userId, input);
    }),

  // Compliance endpoints
  requestDeletion: protectedProcedure
    .input(schemas.requestDeletionSchema)
    .mutation(async ({ input, ctx }) => {
      return requestDataDeletion(ctx.userId, input.reason);
    }),

  requestExport: protectedProcedure
    .input(schemas.requestExportSchema)
    .mutation(async ({ input, ctx }) => {
      return requestDataExport(ctx.userId, input.email);
    }),

  // Health check
  health: t.procedure.query(() => {
    return { status: 'ok', timestamp: new Date() };
  }),
});

export type TRPCRouter = typeof trpcRouter;

