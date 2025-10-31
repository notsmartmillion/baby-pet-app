import { prisma } from '../db';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { config } from '../config';

const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
});

/**
 * GDPR Art. 17 - Right to erasure ("Right to be forgotten")
 * CCPA/CPRA - Right to deletion
 */
export const requestDataDeletion = async (userId: string, reason?: string) => {
  // Create deletion request
  const request = await prisma.deletionRequest.create({
    data: {
      userId,
      reason,
      status: 'pending',
    },
  });

  // Process deletion asynchronously (in production, queue this)
  await processDataDeletion(userId, request.id);

  return request;
};

/**
 * GDPR Art. 15 - Right of access (data export)
 * CCPA - Right to know
 */
export const requestDataExport = async (userId: string, email: string) => {
  // Gather all user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      jobs: true,
      entitlement: true,
      deletionRequests: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // In production:
  // 1. Generate a comprehensive JSON export
  // 2. Upload to S3 with expiring presigned URL
  // 3. Send email with download link
  // 4. Log the export request for compliance records

  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
    jobs: user.jobs.map((job) => ({
      id: job.id,
      petType: job.petType,
      status: job.status,
      createdAt: job.createdAt,
    })),
    entitlement: user.entitlement,
  };

  console.log(`📦 Data export requested for user ${userId} to ${email}`);
  // TODO: Send email with export data or download link

  return {
    success: true,
    message: 'Export will be sent to your email within 24 hours',
  };
};

const processDataDeletion = async (userId: string, requestId: string) => {
  try {
    // Update request status
    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: { status: 'processing' },
    });

    // 1. Get all user's jobs to find S3 keys
    const jobs = await prisma.job.findMany({
      where: { userId },
    });

    // 2. Delete all S3 objects
    const s3Keys: string[] = [];
    jobs.forEach((job) => {
      s3Keys.push(...job.inputImageKeys);
      if (job.resultImageKey) {
        s3Keys.push(job.resultImageKey);
      }
    });

    for (const key of s3Keys) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.s3Bucket,
            Key: key,
          })
        );
      } catch (err) {
        console.error(`Failed to delete S3 object ${key}:`, err);
      }
    }

    // 3. Delete all database records (cascading deletes will handle relations)
    await prisma.user.delete({
      where: { id: userId },
    });

    // 4. Mark deletion request as completed
    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    console.log(`✅ Data deletion completed for user ${userId}`);
  } catch (error) {
    console.error(`❌ Data deletion failed for user ${userId}:`, error);
    await prisma.deletionRequest.update({
      where: { id: requestId },
      data: { status: 'pending' }, // Retry later
    });
  }
};

/**
 * Auto-delete job images after retention period (24-72h)
 * Run this as a cron job
 */
export const cleanupExpiredJobImages = async () => {
  const retentionHours = 72; // 3 days
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - retentionHours);

  const expiredJobs = await prisma.job.findMany({
    where: {
      createdAt: {
        lt: cutoffDate,
      },
      status: 'completed',
    },
  });

  for (const job of expiredJobs) {
    // Delete input images from S3
    for (const key of job.inputImageKeys) {
      try {
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.s3Bucket,
            Key: key,
          })
        );
      } catch (err) {
        console.error(`Failed to delete expired image ${key}:`, err);
      }
    }

    // Keep result image but clear input keys
    await prisma.job.update({
      where: { id: job.id },
      data: {
        inputImageKeys: [],
      },
    });
  }

  console.log(`🧹 Cleaned up ${expiredJobs.length} expired jobs`);
};

