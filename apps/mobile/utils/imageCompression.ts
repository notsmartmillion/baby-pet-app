import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Compress and resize image before upload
 * Reduces upload time and storage costs
 */
export async function compressImage(uri: string): Promise<string> {
  try {
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [
        // Resize to max 2048px (maintains aspect ratio)
        { resize: { width: 2048 } },
      ],
      {
        compress: 0.8, // 80% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );
    
    return manipResult.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Return original if compression fails
  }
}

/**
 * Get image file info
 */
export function getImageInfo(uri: string) {
  const fileName = uri.split('/').pop() || 'photo.jpg';
  const match = /\.(\w+)$/.exec(fileName);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  
  return {
    uri,
    name: fileName,
    type,
  };
}

