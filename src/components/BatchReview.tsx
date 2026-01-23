import { format } from 'date-fns';
import type { BatchVideo } from '../utils/batchHelpers';
import { FaCheckCircle, FaExclamationTriangle, FaVideo, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import type { Platform } from './PlatformSelector';

interface BatchReviewProps {
  videos: BatchVideo[];
  onEditVideo: (videoId: string) => void;
  onScheduleAll: () => void;
  isScheduling: boolean;
}

const BatchReview = ({ videos, onEditVideo, onScheduleAll, isScheduling }: BatchReviewProps) => {
  const validVideos = videos.filter((v) => v.isValid);
  const invalidVideos = videos.filter((v) => !v.isValid);

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return '📘';
      case 'instagram':
        return '📷';
      case 'youtube':
        return '▶️';
      case 'tiktok':
        return '🎵';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center gap-3">
            <FaVideo className="text-primary text-2xl" />
            <div>
              <p className="text-gray-400 text-sm">Total Videos</p>
              <p className="text-white text-2xl font-bold">{videos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 border border-green-500/50">
          <div className="flex items-center gap-3">
            <FaCheckCircle className="text-green-400 text-2xl" />
            <div>
              <p className="text-gray-300 text-sm">Ready to Schedule</p>
              <p className="text-white text-2xl font-bold">{validVideos.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 border border-red-500/50">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-400 text-2xl" />
            <div>
              <p className="text-gray-300 text-sm">Need Attention</p>
              <p className="text-white text-2xl font-bold">{invalidVideos.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-4">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
          Review Scheduled Posts
        </h3>

        {videos.map((video, index) => (
          <div
            key={video.id}
            className={`bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border transition-all ${
              video.isValid
                ? 'border-green-500/50 hover:border-green-500/70'
                : 'border-red-500/50 hover:border-red-500/70'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Video Thumbnail */}
              <div className="relative flex-shrink-0">
                <video
                  src={video.previewUrl}
                  className="w-24 h-24 object-cover rounded-lg"
                  muted
                />
                <div className="absolute top-1 left-1 bg-primary text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {index + 1}
                </div>
                {video.isValid ? (
                  <div className="absolute bottom-1 right-1 bg-green-500 rounded-full p-1">
                    <FaCheckCircle className="text-white text-xs" />
                  </div>
                ) : (
                  <div className="absolute bottom-1 right-1 bg-red-500 rounded-full p-1">
                    <FaExclamationTriangle className="text-white text-xs" />
                  </div>
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate" title={video.file.name}>
                      {video.file.name}
                    </p>
                    
                    {/* Platforms */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <FaUsers className="text-gray-400 text-sm" />
                      {video.selectedPlatforms.length > 0 ? (
                        video.selectedPlatforms.map((platform) => (
                          <span key={platform} className="text-gray-300 text-sm">
                            {getPlatformIcon(platform)} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                          </span>
                        ))
                      ) : (
                        <span className="text-yellow-400 text-sm">No platforms selected</span>
                      )}
                    </div>

                    {/* Date/Time */}
                    <div className="flex items-center gap-2 mt-2">
                      <FaCalendarAlt className="text-gray-400 text-sm" />
                      <span className="text-gray-300 text-sm">
                        {format(video.scheduledDate, 'MMM d, yyyy')} at {video.scheduledTime}
                      </span>
                    </div>

                    {/* Key Fields Preview */}
                    {video.selectedPlatforms.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {video.selectedPlatforms.map((platform) => {
                          const title = video.formData[`${platform}_title`];
                          const caption = video.formData[`${platform}_caption`] || video.formData[`${platform}_content`];
                          const content = title || caption || '';
                          return content ? (
                            <p key={platform} className="text-gray-400 text-xs line-clamp-2">
                              <span className="font-medium">{platform}:</span> {content}
                            </p>
                          ) : null;
                        })}
                      </div>
                    )}

                    {/* Errors */}
                    {video.errors.length > 0 && (
                      <div className="mt-3 bg-red-500/20 border border-red-500/50 rounded-lg p-2">
                        <p className="text-red-300 text-xs font-medium mb-1">Errors:</p>
                        <ul className="list-disc list-inside space-y-0.5">
                          {video.errors.slice(0, 3).map((error, idx) => (
                            <li key={idx} className="text-red-400 text-xs">{error}</li>
                          ))}
                          {video.errors.length > 3 && (
                            <li className="text-red-400 text-xs">+{video.errors.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => onEditVideo(video.id)}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule All Button */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div>
          {invalidVideos.length > 0 && (
            <p className="text-red-400 text-sm">
              Please fix {invalidVideos.length} video{invalidVideos.length > 1 ? 's' : ''} before scheduling
            </p>
          )}
          {invalidVideos.length === 0 && validVideos.length > 0 && (
            <p className="text-green-400 text-sm">
              All {validVideos.length} video{validVideos.length > 1 ? 's are' : ' is'} ready to schedule
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onScheduleAll}
          disabled={isScheduling || invalidVideos.length > 0 || validVideos.length === 0}
          className="group relative px-8 py-4 bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform flex items-center gap-2"
        >
          {isScheduling ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Scheduling {validVideos.length} videos...</span>
            </>
          ) : (
            <>
              <FaCheckCircle />
              <span>Schedule All ({validVideos.length})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BatchReview;
