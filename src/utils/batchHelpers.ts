import type { Platform } from '../components/PlatformSelector';
import { getPlatformConfig } from './platformFields';

export interface BatchVideo {
  id: string;
  file: File;
  previewUrl: string;
  selectedPlatforms: Platform[];
  scheduledDate: Date;
  scheduledTime: string;
  formData: Record<string, any>;
  errors: string[];
  isValid: boolean;
}

export const validateBatchVideo = (video: BatchVideo): string[] => {
  const errors: string[] = [];

  if (video.selectedPlatforms.length === 0) {
    errors.push('At least one platform must be selected');
  }

  if (!video.scheduledDate) {
    errors.push('Scheduled date is required');
  }

  if (!video.scheduledTime) {
    errors.push('Scheduled time is required');
  }

  // Validate platform-specific requirements
  for (const platform of video.selectedPlatforms) {
    const config = getPlatformConfig(platform);

    // Check required fields
    for (const field of config.fields) {
      if (field.required) {
        const fieldId = `${platform}_${field.id}`;
        const value = video.formData[fieldId];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(`${config.name}: ${field.label} is required`);
        }
      }
    }

    // Check character limits
    for (const field of config.fields) {
      if (field.maxLength) {
        const fieldId = `${platform}_${field.id}`;
        const value = video.formData[fieldId] || '';
        if (value.length > field.maxLength) {
          errors.push(`${config.name}: ${field.label} exceeds character limit`);
        }
      }
    }
  }

  return errors;
};

export const validateAllVideos = (videos: BatchVideo[]): boolean => {
  return videos.every((video) => {
    video.errors = validateBatchVideo(video);
    video.isValid = video.errors.length === 0;
    return video.isValid;
  });
};

export const generateVideoId = (): string => {
  return `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};
