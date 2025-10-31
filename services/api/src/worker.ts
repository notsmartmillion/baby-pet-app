/**
 * Worker process that consumes jobs from the queue
 * Run this separately from the main API server for better scaling
 * 
 * Usage:
 *   tsx src/worker.ts
 */

import { startWorker } from './queue';
import { config } from './config';

console.log('🚀 Starting Baby Pet worker...');
console.log(`📍 GPU Worker URL: ${config.gpuWorkerUrl}`);

const worker = startWorker();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM received, closing worker...');
  await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT received, closing worker...');
  await worker.close();
  process.exit(0);
});

