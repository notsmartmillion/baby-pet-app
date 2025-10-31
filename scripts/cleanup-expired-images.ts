/**
 * Cron job to auto-delete expired job images
 * Run this daily or hourly
 * 
 * Usage:
 *   tsx scripts/cleanup-expired-images.ts
 */

import { cleanupExpiredJobImages } from '../services/api/src/services/complianceService';

async function main() {
  console.log('🧹 Starting cleanup of expired images...');
  
  try {
    await cleanupExpiredJobImages();
    console.log('✅ Cleanup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

main();

