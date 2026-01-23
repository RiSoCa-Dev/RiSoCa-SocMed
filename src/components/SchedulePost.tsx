import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import PlatformSelector from './PlatformSelector';
import type { Platform } from './PlatformSelector';
import MediaUpload from './MediaUpload';
import DateTimePicker from './DateTimePicker';
import PlatformFieldRenderer from './PlatformFieldRenderer';
import PostPreview from './PostPreview';
import { getPlatformConfig } from '../utils/platformFields';
import { FaRocket, FaCheckCircle } from 'react-icons/fa';

const SchedulePost = () => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['facebook']);
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date());
  const [scheduledTime, setScheduledTime] = useState('14:30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleMediaSelect = (file: File | null) => {
    setMediaFile(file);
    if (file) {
      const preview = URL.createObjectURL(file);
      setMediaPreview(preview);
    } else {
      if (mediaPreview) {
        URL.revokeObjectURL(mediaPreview);
      }
      setMediaPreview(null);
    }
  };

  const validateForm = (): string | null => {
    if (selectedPlatforms.length === 0) {
      return 'Please select at least one platform';
    }

    for (const platform of selectedPlatforms) {
      const config = getPlatformConfig(platform);
      
      // Check media requirements
      if (config.mediaRequirements.required && !mediaFile) {
        return `${config.name} requires a media file`;
      }

      // Check required fields
      for (const field of config.fields) {
        if (field.required) {
          const fieldId = `${platform}_${field.id}`;
          const value = formData[fieldId];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return `${config.name}: ${field.label} is required`;
          }
        }
      }

      // Check character limits
      for (const field of config.fields) {
        if (field.maxLength) {
          const fieldId = `${platform}_${field.id}`;
          const value = formData[fieldId] || '';
          if (value.length > field.maxLength) {
            return `${config.name}: ${field.label} exceeds character limit`;
          }
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('platforms', JSON.stringify(selectedPlatforms));
      submitData.append('content', content);
      submitData.append('scheduledDate', format(scheduledDate, 'yyyy-MM-dd'));
      submitData.append('scheduledTime', scheduledTime);
      
      // Add platform-specific fields
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, value);
        }
      });

      if (mediaFile) {
        submitData.append('media', mediaFile);
      }

      const response = await fetch('http://localhost:3001/api/posts', {
        method: 'POST',
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule post');
      }

      // Reset form
      setSelectedPlatforms(['facebook']);
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      setFormData({});
      setScheduledDate(new Date());
      setScheduledTime('14:30');
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      alert(error.message || 'Failed to schedule post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const combinedContent = useMemo(() => {
    if (selectedPlatforms.length === 1) {
      const platform = selectedPlatforms[0];
      // const config = getPlatformConfig(platform);
      if (platform === 'youtube') {
        return formData[`${platform}_title`] || '';
      }
      return formData[`${platform}_caption`] || formData[`${platform}_content`] || content;
    }
    return content;
  }, [selectedPlatforms, formData, content]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <FaCheckCircle className="text-green-500 text-xl" />
            <span className="text-green-200 font-medium">Post scheduled successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Platform Selector */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onPlatformToggle={handlePlatformToggle}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Media & Basic Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Media Upload */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
                  Media
                </h2>
                <MediaUpload onFileSelect={handleMediaSelect} selectedFile={mediaFile} />
              </div>

              {/* Platform-Specific Fields */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
                <h2 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
                  Platform Settings
                </h2>
                <PlatformFieldRenderer
                  platforms={selectedPlatforms}
                  formData={formData}
                  onFieldChange={handleFieldChange}
                />
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="lg:col-span-1">
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl sticky top-6">
                <PostPreview
                  platforms={selectedPlatforms}
                  content={combinedContent}
                  mediaUrl={mediaPreview}
                  mediaFile={mediaFile}
                  formData={formData}
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <DateTimePicker
                date={scheduledDate}
                time={scheduledTime}
                onDateChange={setScheduledDate}
                onTimeChange={setScheduledTime}
              />

              <button
                type="submit"
                disabled={isSubmitting || selectedPlatforms.length === 0}
                className="group relative px-8 py-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Scheduling...</span>
                  </>
                ) : (
                  <>
                    <FaRocket />
                    <span>Schedule Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchedulePost;
