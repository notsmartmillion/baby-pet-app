import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiSecret: process.env.API_SECRET || 'change-me-in-production',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8081'],

  // Database
  databaseUrl: process.env.DATABASE_URL!,

  // Redis - parse REDIS_URL if provided, otherwise use individual values
  ...(() => {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      // Parse redis://default:password@host:port
      const match = redisUrl.match(/redis:\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)/);
      if (match) {
        return {
          redisHost: match[3],
          redisPort: parseInt(match[4], 10),
          redisPassword: match[2] || undefined,
        };
      }
    }
    // Fallback to individual env vars
    return {
      redisHost: process.env.REDIS_HOST || 'localhost',
      redisPort: parseInt(process.env.REDIS_PORT || '6379', 10),
      redisPassword: process.env.REDIS_PASSWORD || undefined,
    };
  })(),

  // AWS S3
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  s3Bucket: process.env.S3_BUCKET || 'kittypup-uploads',
  s3Endpoint: process.env.S3_ENDPOINT, // For LocalStack

  // GPU Worker
  gpuWorkerUrl: process.env.GPU_WORKER_URL || 'http://localhost:5000',

  // Sentry
  sentryDsn: process.env.SENTRY_DSN || '',

  // IAP
  appleBundleId: process.env.APPLE_BUNDLE_ID || '',
  googlePackageName: process.env.GOOGLE_PACKAGE_NAME || '',
  revenuecatApiKey: process.env.REVENUECAT_API_KEY || '',
};

// Validate required config
const requiredInProduction = [
  'databaseUrl',
  'awsAccessKeyId',
  'awsSecretAccessKey',
  's3Bucket',
];

if (config.nodeEnv === 'production') {
  const missing = requiredInProduction.filter((key) => !config[key as keyof typeof config]);
  if (missing.length > 0) {
    throw new Error(`Missing required config in production: ${missing.join(', ')}`);
  }
}
