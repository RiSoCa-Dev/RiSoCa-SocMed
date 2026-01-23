import { useState } from 'react';
import { format } from 'date-fns';
import type { BatchVideo } from '../utils/batchHelpers';
import type { Platform } from './PlatformSelector';
import PlatformSelector from './PlatformSelector';
import PlatformFieldRenderer from './PlatformFieldRenderer';
import DateTimePicker from './DateTimePicker';
import PostPreview from './PostPreview';
import { FaChevronDown, FaChevronUp, FaVideo, FaCheck } from 'react-icons/fa';

interface BatchVideoConfigProps {
  video: BatchVideo;
  onVideoUpdate: (video: BatchVideo) => void;
  index: number;
  isSelected?: boolean;
  onToggleSelection?: (videoId: string) => void;
}

const BatchVideoConfig = ({ video, onVideoUpdate, index, isSelected = false, onToggleSelection }: BatchVideoConfigProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  const handlePlatformToggle = (platform: Platform) => {
    const updatedVideo: BatchVideo = {
      ...video,
      selectedPlatforms: video.selectedPlatforms.includes(platform)
        ? video.selectedPlatforms.filter((p) => p !== platform)
        : [...video.selectedPlatforms, platform],
      errors: [], // Clear errors when platform changes
      isValid: false // Will be recalculated
    };
    onVideoUpdate(updatedVideo);
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    const updatedVideo: BatchVideo = {
      ...video,
      formData: {
        ...video.formData,
        [fieldId]: value
      }
    };
    onVideoUpdate(updatedVideo);
  };

  const handleDateChange = (date: Date) => {
    const updatedVideo: BatchVideo = {
      ...video,
      scheduledDate: date
    };
    onVideoUpdate(updatedVideo);
  };

  const handleTimeChange = (time: string) => {
    const updatedVideo: BatchVideo = {
      ...video,
      scheduledTime: time
    };
    onVideoUpdate(updatedVideo);
  };

  const getCombinedContent = () => {
    if (video.selectedPlatforms.length === 1) {
      const platform = video.selectedPlatforms[0];
      if (platform === 'youtube') {
        return video.formData[`${platform}_title`] || '';
      }
      return video.formData[`${platform}_caption`] || video.formData[`${platform}_content`] || '';
    }
    return '';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4">
        {onToggleSelection && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelection(video.id);
            }}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
              isSelected
                ? 'bg-primary border-primary text-white'
                : 'border-gray-500 hover:border-primary'
            }`}
          >
            {isSelected && <FaCheck className="text-xs" />}
          </button>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between flex-1 hover:bg-slate-700/30 transition-colors rounded-lg p-2 -m-2"
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <video
                src={video.previewUrl}
                className="w-20 h-20 object-cover rounded-lg"
                muted
              />
              <div className="absolute top-1 left-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate" title={video.file.name}>
                {video.file.name}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {video.selectedPlatforms.length > 0 ? (
                  <span className="text-gray-400 text-xs">
                    {video.selectedPlatforms.length} platform{video.selectedPlatforms.length > 1 ? 's' : ''} selected
                  </span>
                ) : (
                  <span className="text-yellow-400 text-xs">No platforms selected</span>
                )}
                {video.scheduledDate && video.scheduledTime && (
                  <span className="text-gray-500 text-xs">•</span>
                )}
                {video.scheduledDate && video.scheduledTime && (
                  <span className="text-gray-400 text-xs">
                    {format(video.scheduledDate, 'MMM d, yyyy')} at {video.scheduledTime}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {video.errors.length > 0 && (
              <span className="text-red-400 text-xs font-medium">
                {video.errors.length} error{video.errors.length > 1 ? 's' : ''}
              </span>
            )}
            {isExpanded ? (
              <FaChevronUp className="text-gray-400 text-xl" />
            ) : (
              <FaChevronDown className="text-gray-400 text-xl" />
            )}
          </div>
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6 border-t border-slate-700/50 animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* Platform Selector */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <PlatformSelector
                  selectedPlatforms={video.selectedPlatforms}
                  onPlatformToggle={handlePlatformToggle}
                />
              </div>

              {/* Date/Time Picker */}
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <label className="block text-white text-sm font-medium mb-3">
                  Schedule Date & Time
                </label>
                <DateTimePicker
                  date={video.scheduledDate}
                  time={video.scheduledTime}
                  onDateChange={handleDateChange}
                  onTimeChange={handleTimeChange}
                />
              </div>

              {/* Platform Fields */}
              {video.selectedPlatforms.length > 0 && (
                <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                  <PlatformFieldRenderer
                    platforms={video.selectedPlatforms}
                    formData={video.formData}
                    onFieldChange={handleFieldChange}
                  />
                </div>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="lg:sticky lg:top-6">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                {!showPreview ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-400 text-sm mb-4">Preview your post across platforms</p>
                    <button
                      type="button"
                      onClick={() => setShowPreview(true)}
                      className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
                    >
                      <FaVideo className="text-lg" />
                      <span>Show Preview</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Post Preview</h4>
                      <button
                        type="button"
                        onClick={() => setShowPreview(false)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        Hide
                      </button>
                    </div>
                    <PostPreview
                      platforms={video.selectedPlatforms}
                      content={getCombinedContent()}
                      mediaUrl={video.previewUrl}
                      mediaFile={video.file}
                      formData={video.formData}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Errors Display */}
          {video.errors.length > 0 && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-200 font-medium mb-2">Validation Errors:</p>
              <ul className="list-disc list-inside space-y-1">
                {video.errors.map((error, idx) => (
                  <li key={idx} className="text-red-300 text-sm">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchVideoConfig;
