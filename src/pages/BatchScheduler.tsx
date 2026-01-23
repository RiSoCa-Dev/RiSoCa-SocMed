import { useState } from 'react';
import { format } from 'date-fns';
import BatchUpload from '../components/BatchUpload';
import BatchVideoConfig from '../components/BatchVideoConfig';
import BatchReview from '../components/BatchReview';
import { validateAllVideos, validateBatchVideo, type BatchVideo } from '../utils/batchHelpers';
import { FaRocket, FaCheckCircle, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa';
import type { Platform } from '../components/PlatformSelector';

type Step = 1 | 2 | 3;

const BatchScheduler = () => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [videos, setVideos] = useState<BatchVideo[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  // Validate videos only when moving to review step or when explicitly needed
  // Don't validate on every change to avoid showing errors before user has a chance to fill fields

  const handleVideosChange = (newVideos: BatchVideo[]) => {
    // Don't validate on upload - let user configure first
    setVideos(newVideos);
  };

  const handleVideoUpdate = (updatedVideo: BatchVideo) => {
    const updatedVideos = videos.map((v) =>
      v.id === updatedVideo.id ? updatedVideo : v
    );
    // Validate the updated video immediately to show/hide errors in real-time
    const videoIndex = updatedVideos.findIndex((v) => v.id === updatedVideo.id);
    if (videoIndex !== -1) {
      const errors = validateBatchVideo(updatedVideos[videoIndex]);
      updatedVideos[videoIndex].errors = errors;
      updatedVideos[videoIndex].isValid = errors.length === 0;
    }
    setVideos(updatedVideos);
  };

  const handleNext = () => {
    if (currentStep === 1 && videos.length > 0) {
      // Auto-select Facebook for all videos when entering configure step
      const updatedVideos = videos.map((v) => ({
        ...v,
        selectedPlatforms: v.selectedPlatforms.length === 0 ? ['facebook' as Platform] : v.selectedPlatforms
      }));
      setVideos(updatedVideos as BatchVideo[]);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate before moving to review step
      const updatedVideos = [...videos];
      validateAllVideos(updatedVideos);
      setVideos(updatedVideos);
      
      const validVideos = updatedVideos.filter((v) => v.isValid);
      if (validVideos.length > 0) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as Step);
    }
  };

  const handleEditVideo = (videoId: string) => {
    setEditingVideoId(videoId);
    setCurrentStep(2);
  };

  const handleScheduleAll = async () => {
    const validVideos = videos.filter((v) => v.isValid);
    if (validVideos.length === 0) return;

    setIsScheduling(true);

    try {
      // Create FormData for batch upload
      const formData = new FormData();
      formData.append('videos', JSON.stringify(validVideos.map((v) => ({
        platforms: v.selectedPlatforms,
        scheduledDate: format(v.scheduledDate, 'yyyy-MM-dd'),
        scheduledTime: v.scheduledTime,
        formData: v.formData
      }))));

      // Append all video files - multer.array expects the same field name
      validVideos.forEach((video) => {
        formData.append('videos', video.file);
      });

      const response = await fetch('http://localhost:3001/api/posts/batch', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule videos');
      }

      // Clear videos and reset
      videos.forEach((v) => URL.revokeObjectURL(v.previewUrl));
      setVideos([]);
      setCurrentStep(1);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error: any) {
      console.error('Error scheduling videos:', error);
      alert(error.message || 'Failed to schedule videos. Please try again.');
    } finally {
      setIsScheduling(false);
    }
  };

  const validVideos = videos.filter((v) => v.isValid);
  const canProceedToStep2 = videos.length > 0;
  const canProceedToStep3 = validVideos.length > 0;

  // Bulk operations
  const handleSelectAll = () => {
    if (selectedVideoIds.size === videos.length) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(videos.map((v) => v.id)));
    }
  };

  const handleToggleVideoSelection = (videoId: string) => {
    const newSet = new Set(selectedVideoIds);
    if (newSet.has(videoId)) {
      newSet.delete(videoId);
    } else {
      newSet.add(videoId);
    }
    setSelectedVideoIds(newSet);
  };

  const handleBulkApplyDate = (date: Date, time: string) => {
    const updatedVideos = videos.map((v) => {
      if (selectedVideoIds.has(v.id)) {
        return { ...v, scheduledDate: date, scheduledTime: time };
      }
      return v;
    });
    validateAllVideos(updatedVideos);
    setVideos(updatedVideos);
  };

  const handleBulkApplyPlatforms = (platforms: Platform[]) => {
    const updatedVideos = videos.map((v) => {
      if (selectedVideoIds.has(v.id)) {
        return { ...v, selectedPlatforms: platforms };
      }
      return v;
    });
    validateAllVideos(updatedVideos);
    setVideos(updatedVideos);
  };

  const handleClearAllConfigurations = () => {
    const updatedVideos = videos.map((v) => ({
      ...v,
      selectedPlatforms: [],
      formData: {},
      scheduledDate: new Date(),
      scheduledTime: '14:30'
    }));
    validateAllVideos(updatedVideos);
    setVideos(updatedVideos);
    setSelectedVideoIds(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto p-6 md:p-8">
        {/* Wizard Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                      ${currentStep === step
                        ? 'bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg scale-110'
                        : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-700 text-gray-400'
                      }
                    `}
                  >
                    {currentStep > step ? (
                      <FaCheckCircle />
                    ) : (
                      step
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      currentStep === step ? 'text-white' : 'text-gray-400'
                    }`}
                  >
                    {step === 1 && 'Upload Videos'}
                    {step === 2 && 'Configure'}
                    {step === 3 && 'Review'}
                  </p>
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step ? 'bg-green-500' : 'bg-slate-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-green-500/20 border border-green-500/50 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <FaCheckCircle className="text-green-500 text-xl" />
            <span className="text-green-200 font-medium">
              Successfully scheduled {validVideos.length} video{validVideos.length > 1 ? 's' : ''}!
            </span>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">Upload Videos</h2>
                <p className="text-gray-400">Select multiple video files to schedule</p>
              </div>
              <BatchUpload videos={videos} onVideosChange={handleVideosChange} />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white text-2xl font-bold mb-2">Configure Videos</h2>
                  <p className="text-gray-400">
                    Configure each video's platforms, date/time, and settings
                  </p>
                </div>
                {videos.length > 0 && (
                  <div className="text-sm text-gray-400">
                    {validVideos.length} of {videos.length} ready
                  </div>
                )}
              </div>

              {/* Bulk Actions */}
              {videos.length > 0 && (
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        {selectedVideoIds.size === videos.length ? (
                          <>
                            <FaTimes /> Deselect All
                          </>
                        ) : (
                          <>
                            <FaCheck /> Select All
                          </>
                        )}
                      </button>
                      <span className="text-gray-400 text-sm">
                        {selectedVideoIds.size} of {videos.length} selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearAllConfigurations}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-sm font-medium transition-colors border border-red-500/50"
                    >
                      Clear All Configurations
                    </button>
                  </div>

                  {selectedVideoIds.size > 0 && (
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-gray-400 text-sm">Apply to selected:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const date = new Date();
                          const time = '14:30';
                          handleBulkApplyDate(date, time);
                        }}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium transition-colors border border-blue-500/50"
                      >
                        Same Date/Time
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyPlatforms(['facebook'])}
                        className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-medium transition-colors border border-blue-500/50"
                      >
                        Facebook Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyPlatforms(['instagram'])}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-pink-300 rounded-lg text-xs font-medium transition-colors border border-pink-500/50"
                      >
                        Instagram Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyPlatforms(['youtube'])}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg text-xs font-medium transition-colors border border-red-500/50"
                      >
                        YouTube Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyPlatforms(['tiktok'])}
                        className="px-3 py-1.5 bg-black/40 hover:bg-black/60 text-white rounded-lg text-xs font-medium transition-colors border border-white/20"
                      >
                        TikTok Only
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkApplyPlatforms(['facebook', 'instagram', 'youtube', 'tiktok'])}
                        className="px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-medium transition-colors border border-primary/50"
                      >
                        All Platforms
                      </button>
                    </div>
                  )}
                </div>
              )}

              {editingVideoId && (
                <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg flex items-center justify-between">
                  <span className="text-blue-200 text-sm">
                    Editing video configuration
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingVideoId(null)}
                    className="text-blue-300 hover:text-blue-200 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <div className="space-y-4">
                {videos.map((video, index) => {
                  if (editingVideoId && video.id !== editingVideoId) {
                    return null;
                  }
                  return (
                    <BatchVideoConfig
                      key={video.id}
                      video={video}
                      onVideoUpdate={handleVideoUpdate}
                      index={index}
                      isSelected={selectedVideoIds.has(video.id)}
                      onToggleSelection={handleToggleVideoSelection}
                    />
                  );
                })}
              </div>

              {videos.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <FaExclamationTriangle className="text-4xl mx-auto mb-4" />
                  <p>No videos uploaded. Please go back to step 1 to upload videos.</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">Review & Schedule</h2>
                <p className="text-gray-400">Review all videos before scheduling</p>
              </div>
              <BatchReview
                videos={videos}
                onEditVideo={handleEditVideo}
                onScheduleAll={handleScheduleAll}
                isScheduling={isScheduling}
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back
          </button>

          {currentStep < 3 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
              className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <FaRocket />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchScheduler;
