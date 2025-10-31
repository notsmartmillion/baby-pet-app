import { z } from 'zod';
import * as schemas from './schemas';

// Infer TypeScript types from Zod schemas
export type GetUploadUrlInput = z.infer<typeof schemas.getUploadUrlSchema>;
export type UploadUrlResponse = z.infer<typeof schemas.uploadUrlResponseSchema>;
export type CreateJobInput = z.infer<typeof schemas.createJobSchema>;
export type Job = z.infer<typeof schemas.jobSchema>;
export type GetJobInput = z.infer<typeof schemas.getJobSchema>;
export type ListJobsInput = z.infer<typeof schemas.listJobsSchema>;
export type Entitlement = z.infer<typeof schemas.entitlementSchema>;
export type ConsumeCreditInput = z.infer<typeof schemas.consumeCreditSchema>;
export type RequestDeletionInput = z.infer<typeof schemas.requestDeletionSchema>;
export type RequestExportInput = z.infer<typeof schemas.requestExportSchema>;
export type DeletionRequest = z.infer<typeof schemas.deletionRequestSchema>;
export type VerifyPurchaseInput = z.infer<typeof schemas.verifyPurchaseSchema>;
export type PurchaseResult = z.infer<typeof schemas.purchaseResultSchema>;
export type WorkerCallback = z.infer<typeof schemas.workerCallbackSchema>;

