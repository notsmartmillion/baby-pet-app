import { config } from '../config';

interface GpuJobData {
  jobId: string;
  userId: string;
  petType: string;
  imageKeys: string[];
  breed?: string;
  isWatermarked: boolean;
}

export const dispatchToGpuWorker = async (data: GpuJobData) => {
  console.log(`🚀 Dispatching job ${data.jobId} to GPU worker`);

  try {
    const response = await fetch(`${config.gpuWorkerUrl}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: data.jobId,
        pet_type: data.petType,
        image_keys: data.imageKeys,
        breed: data.breed,
        watermark: data.isWatermarked,
        callback_url: `http://localhost:${config.port}/internal/worker-callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`GPU worker responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log(`✅ GPU worker accepted job ${data.jobId}`);
    return result;
  } catch (error: any) {
    console.error(`❌ Failed to dispatch job ${data.jobId}:`, error.message);
    throw error;
  }
};

