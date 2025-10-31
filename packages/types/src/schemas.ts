import { z } from 'zod';
import { PetType, JobStatus, SubscriptionTier } from './enums';

// Upload schemas
export const getUploadUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
});

export const uploadUrlResponseSchema = z.object({
  uploadUrl: z.string().url(),
  fileKey: z.string(),
});

// Job schemas
export const createJobSchema = z.object({
  petType: z.nativeEnum(PetType),
  imageKeys: z.array(z.string()).min(1).max(6),
  breed: z.string().optional(),
});

export const jobSchema = z.object({
  id: z.string(),
  userId: z.string(),
  petType: z.nativeEnum(PetType),
  status: z.nativeEnum(JobStatus),
  inputImageKeys: z.array(z.string()),
  resultImageKey: z.string().nullable(),
  resultUrl: z.string().url().nullable(),
  isWatermarked: z.boolean(),
  breed: z.string().nullable(),
  error: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().nullable(),
});

export const getJobSchema = z.object({
  jobId: z.string(),
});

export const listJobsSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
});

// Entitlement schemas
export const entitlementSchema = z.object({
  userId: z.string(),
  tier: z.nativeEnum(SubscriptionTier),
  creditsRemaining: z.number(),
  unlimitedUntil: z.date().nullable(),
  activeSubscription: z.boolean(),
});

export const consumeCreditSchema = z.object({
  jobId: z.string(),
});

// Privacy/Compliance schemas
export const requestDeletionSchema = z.object({
  userId: z.string(),
  reason: z.string().optional(),
});

export const requestExportSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
});

export const deletionRequestSchema = z.object({
  id: z.string(),
  userId: z.string(),
  requestedAt: z.date(),
  completedAt: z.date().nullable(),
  status: z.enum(['pending', 'processing', 'completed']),
});

// Purchase/IAP schemas
export const verifyPurchaseSchema = z.object({
  platform: z.enum(['ios', 'android']),
  receiptData: z.string(),
  productId: z.string(),
});

export const purchaseResultSchema = z.object({
  success: z.boolean(),
  entitlement: entitlementSchema.nullable(),
  error: z.string().nullable(),
});

// Worker callback schema (internal)
export const workerCallbackSchema = z.object({
  jobId: z.string(),
  success: z.boolean(),
  resultKey: z.string().optional(),
  error: z.string().optional(),
});

