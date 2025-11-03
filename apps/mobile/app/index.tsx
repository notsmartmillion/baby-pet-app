import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { trpc } from '../utils/trpc';
import { PetType } from '@baby-pet/types';
import { compressImage } from '../utils/imageCompression';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [petType, setPetType] = useState<PetType>(PetType.CAT);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);

  const entitlementQuery = trpc.getEntitlement.useQuery(undefined, {
    onError: (error) => {
      console.error('Failed to fetch entitlement:', error);
      // Don't show error to user for now - they might not be authenticated
    },
  });
  
  const getUploadUrlMutation = trpc.getUploadUrl.useMutation();
  const createJobMutation = trpc.createJob.useMutation();
  
  const getJobQuery = trpc.getJob.useQuery(
    { jobId: jobId! },
    { 
      enabled: !!jobId, 
      refetchInterval: (data) => {
        // Stop polling when job is completed or failed
        return data?.status === 'completed' || data?.status === 'failed' ? false : 2000;
      },
    }
  );

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need access to your photos to generate baby pet images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);
      setSelectedImages((prev) => [...prev, ...uris].slice(0, 6));
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      // Compress image first
      const compressedUri = await compressImage(uri);
      
      const fileName = compressedUri.split('/').pop() || 'photo.jpg';
      const contentType = 'image/jpeg';

      // Get presigned URL from backend
      const { uploadUrl, fileKey } = await getUploadUrlMutation.mutateAsync({
        fileName,
        contentType,
      });

      // Upload to S3
      await FileSystem.uploadAsync(uploadUrl, compressedUri, {
        httpMethod: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
      });

      return fileKey;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const handleGenerate = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No images', 'Please select at least one photo of your pet');
      return;
    }

    try {
      setUploading(true);

      // Upload all images
      const imageKeys = await Promise.all(
        selectedImages.map((uri) => uploadImage(uri))
      );

      // Create job
      const job = await createJobMutation.mutateAsync({
        petType,
        imageKeys,
      });

      setJobId(job.id);
      Alert.alert('Success! ✨', 'Your baby pet is being generated!');
    } catch (error: any) {
      console.error('Generation error:', error);
      
      if (error.message?.includes('No credits')) {
        Alert.alert(
          'No Credits',
          'You need credits to generate more images. Would you like to purchase some?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Get Credits', onPress: () => router.push('/purchase') },
          ]
        );
      } else {
        Alert.alert('Error', error.message || 'Failed to start generation');
      }
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const job = getJobQuery.data;
  const entitlement = entitlementQuery.data;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 Baby Pet Generator</Text>
        <Text style={styles.subtitle}>
          Transform your pet into an adorable baby!
        </Text>
      </View>

      {/* Entitlement Display */}
      {entitlement && (
        <View style={styles.entitlementCard}>
          <Text style={styles.entitlementText}>
            {entitlement.activeSubscription
              ? '⭐ Unlimited (Subscribed)'
              : `💎 Credits: ${entitlement.creditsRemaining}`}
          </Text>
          {!entitlement.activeSubscription && entitlement.creditsRemaining === 0 && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/purchase')}
            >
              <Text style={styles.upgradeButtonText}>Get More Credits</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Pet Type Selector */}
      <View style={styles.petTypeSelector}>
        <TouchableOpacity
          style={[styles.petTypeButton, petType === PetType.CAT && styles.petTypeButtonActive]}
          onPress={() => setPetType(PetType.CAT)}
        >
          <Text style={styles.petTypeEmoji}>🐱</Text>
          <Text style={styles.petTypeText}>Cat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.petTypeButton, petType === PetType.DOG && styles.petTypeButtonActive]}
          onPress={() => setPetType(PetType.DOG)}
        >
          <Text style={styles.petTypeEmoji}>🐶</Text>
          <Text style={styles.petTypeText}>Dog</Text>
        </TouchableOpacity>
      </View>

      {/* Image Picker */}
      <TouchableOpacity style={styles.pickButton} onPress={pickImages}>
        <Text style={styles.pickButtonText}>
          📷 Select Photos ({selectedImages.length}/6)
        </Text>
      </TouchableOpacity>

      {/* Selected Images Preview */}
      {selectedImages.length > 0 && (
        <View style={styles.imageGrid}>
          {selectedImages.map((uri, index) => (
            <View key={index} style={styles.thumbnailContainer}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Generate Button */}
      <TouchableOpacity
        style={[styles.generateButton, uploading && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={uploading || selectedImages.length === 0}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>✨ Generate Baby Pet</Text>
        )}
      </TouchableOpacity>

      {/* Job Status */}
      {job && (
        <View style={styles.jobCard}>
          <Text style={styles.jobStatus}>
            Status: {job.status.toUpperCase()}
          </Text>
          {job.status === 'processing' && (
            <View style={styles.processingContainer}>
              <ActivityIndicator style={styles.jobLoader} size="large" />
              <Text style={styles.processingText}>
                Creating your baby {petType}... This may take 10-20 seconds ⏱️
              </Text>
            </View>
          )}
          {job.status === 'completed' && job.resultUrl && (
            <View>
              <Image source={{ uri: job.resultUrl }} style={styles.resultImage} />
              {job.isWatermarked && (
                <Text style={styles.watermarkNote}>
                  💧 Remove watermark with premium
                </Text>
              )}
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => Alert.alert('Share', 'Share functionality coming soon!')}
              >
                <Text style={styles.shareButtonText}>📤 Share</Text>
              </TouchableOpacity>
            </View>
          )}
          {job.status === 'failed' && (
            <View>
              <Text style={styles.errorText}>❌ {job.error || 'Generation failed'}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => {
                  setJobId(null);
                  Alert.alert('Try Again', 'Please select new images and try again');
                }}
              >
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.quickActionText}>⚙️ Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => router.push('/purchase')}
        >
          <Text style={styles.quickActionText}>💎 Premium</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  entitlementCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entitlementText: {
    fontSize: 18,
    fontWeight: '600',
  },
  upgradeButton: {
    marginTop: 12,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  upgradeButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  petTypeSelector: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  petTypeButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  petTypeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  petTypeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  petTypeText: {
    fontSize: 18,
    fontWeight: '600',
  },
  pickButton: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  pickButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  generateButton: {
    backgroundColor: '#FF6B6B',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  jobCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobStatus: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  jobLoader: {
    marginBottom: 12,
  },
  processingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 12,
  },
  watermarkNote: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
    fontSize: 14,
  },
  shareButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#d32f2f',
    marginTop: 8,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
