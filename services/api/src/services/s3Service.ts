import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config';
import { randomUUID } from 'crypto';

const s3ClientConfig: any = {
  region: config.awsRegion,
  credentials: {
    accessKeyId: config.awsAccessKeyId,
    secretAccessKey: config.awsSecretAccessKey,
  },
};

// LocalStack support for local development
if (config.s3Endpoint) {
  s3ClientConfig.endpoint = config.s3Endpoint;
  s3ClientConfig.forcePathStyle = true;
}

const s3Client = new S3Client(s3ClientConfig);

export const getPresignedUploadUrl = async (
  fileName: string,
  contentType: string
) => {
  const fileKey = `uploads/${randomUUID()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: config.s3Bucket,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return {
    uploadUrl,
    fileKey,
  };
};

export const getPresignedDownloadUrl = async (fileKey: string) => {
  const command = new GetObjectCommand({
    Bucket: config.s3Bucket,
    Key: fileKey,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};
