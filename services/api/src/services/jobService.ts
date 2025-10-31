import { prisma } from '../db';
import { jobQueue } from '../queue';
import { TRPCError } from '@trpc/server';
import { CreateJobInput, Job } from '@baby-pet/types';
import { getPresignedDownloadUrl } from './s3Service';
import { getUserEntitlement } from './entitlementService';
import { JobStatus } from '@baby-pet/types';

export const createJob = async (userId: string, input: CreateJobInput): Promise<Job> => {
  // Check entitlements
  const entitlement = await getUserEntitlement(userId);
  
  // Check if user has credits or active subscription
  const hasAccess = 
    entitlement.creditsRemaining > 0 ||
    (entitlement.unlimitedUntil && new Date(entitlement.unlimitedUntil) > new Date());

  if (!hasAccess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No credits remaining. Please purchase more credits or subscribe.',
    });
  }

  // Determine if this job should be watermarked
  // Free tier (first image) is always watermarked
  const isWatermarked = entitlement.tier === 'free';

  // Create job
  const job = await prisma.job.create({
    data: {
      userId,
      petType: input.petType,
      inputImageKeys: input.imageKeys,
      breed: input.breed,
      status: 'pending',
      isWatermarked,
    },
  });

  // Enqueue for processing
  await jobQueue.add('generate-image', {
    jobId: job.id,
    userId,
    petType: input.petType,
    imageKeys: input.imageKeys,
    breed: input.breed,
    isWatermarked,
  });

  // Consume credit if not unlimited
  if (!entitlement.unlimitedUntil || new Date(entitlement.unlimitedUntil) <= new Date()) {
    await prisma.entitlement.update({
      where: { userId },
      data: {
        creditsRemaining: {
          decrement: 1,
        },
      },
    });
  }

  return job as Job;
};

export const getJob = async (jobId: string, userId: string): Promise<Job | null> => {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      userId,
    },
  });

  if (!job) {
    return null;
  }

  // Generate presigned URL if result is available
  let resultUrl = null;
  if (job.resultImageKey) {
    resultUrl = await getPresignedDownloadUrl(job.resultImageKey);
  }

  return {
    ...job,
    resultUrl,
  } as Job;
};

export const listUserJobs = async (
  userId: string,
  limit: number = 20,
  cursor?: string
) => {
  const jobs = await prisma.job.findMany({
    where: {
      userId,
      ...(cursor ? { id: { lt: cursor } } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit + 1,
  });

  const hasMore = jobs.length > limit;
  const items = hasMore ? jobs.slice(0, -1) : jobs;
  const nextCursor = hasMore ? items[items.length - 1].id : undefined;

  // Generate presigned URLs
  const itemsWithUrls = await Promise.all(
    items.map(async (job) => {
      let resultUrl = null;
      if (job.resultImageKey) {
        resultUrl = await getPresignedDownloadUrl(job.resultImageKey);
      }
      return {
        ...job,
        resultUrl,
      } as Job;
    })
  );

  return {
    items: itemsWithUrls,
    nextCursor,
  };
};

export const handleWorkerCallback = async (
  jobId: string,
  success: boolean,
  resultKey?: string,
  error?: string
) => {
  const updateData: any = {
    updatedAt: new Date(),
    completedAt: new Date(),
  };

  if (success && resultKey) {
    updateData.status = 'completed';
    updateData.resultImageKey = resultKey;
  } else {
    updateData.status = 'failed';
    updateData.error = error || 'Unknown error';
  }

  await prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  // TODO: Send push notification to user
  console.log(`Job ${jobId} ${success ? 'completed' : 'failed'}`);
};

