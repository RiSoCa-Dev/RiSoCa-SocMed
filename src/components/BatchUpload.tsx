import { useRef, useState } from 'react';
import { FaVideo, FaCloudUploadAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { formatFileSize } from '../utils/batchHelpers';
import type { BatchVideo } from '../utils/batchHelpers';

interface BatchUploadProps {
  videos: BatchVideo[];
  onVideosChange: (videos: BatchVideo[]) => void;
}

const BatchUpload = ({ videos, onVideosChange }: BatchUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newVideos: BatchVideo[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('video/')) {
        const previewUrl = URL.createObjectURL(file);
        const video: BatchVideo = {
          id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file,
          previewUrl,
          selectedPlatforms: [],
          scheduledDate: new Date(),
          scheduledTime: '14:30',
          formData: {},
          errors: [],
          isValid: false
        };
        newVideos.push(video);

        // Simulate upload progress
        setUploadProgress((prev) => ({ ...prev, [video.id]: 0 }));
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[video.id] || 0;
            if (current >= 100) {
              clearInterval(interval);
              return prev;
            }
            return { ...prev, [video.id]: current + 10 };
          });
        }, 50);
      }
    });

    onVideosChange([...videos, ...newVideos]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      URL.revokeObjectURL(video.previewUrl);
    }
    onVideosChange(videos.filter((v) => v.id !== videoId));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[videoId];
      return newProgress;
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300
          ${isDragging
            ? 'border-primary bg-primary/10 scale-105 shadow-2xl shadow-primary/50'
            : 'border-slate-600 hover:border-primary/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:from-slate-700/50 hover:to-slate-800/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {isDragging && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-pink-600/20 animate-pulse-slow rounded-2xl"></div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="relative z-10">
          <div className="mb-4 flex justify-center">
            {isDragging ? (
              <FaCloudUploadAlt className="text-6xl text-primary animate-bounce" />
            ) : (
              <FaVideo className="text-6xl text-gray-500" />
            )}
          </div>
          <p className="text-white font-semibold text-lg mb-2">
            {isDragging ? 'Drop your videos here' : 'Upload Multiple Videos'}
          </p>
          <p className="text-gray-400 text-sm">
            {isDragging ? 'Release to upload' : 'Click or drag & drop multiple video files'}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Supports MP4, MOV, AVI, WebM formats
          </p>
        </div>
      </div>

      {/* Uploaded Videos List */}
      {videos.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-lg font-semibold">
              Uploaded Videos ({videos.length})
            </h3>
            <button
              type="button"
              onClick={() => {
                videos.forEach((v) => URL.revokeObjectURL(v.previewUrl));
                onVideosChange([]);
                setUploadProgress({});
              }}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((video) => {
              const progress = uploadProgress[video.id] || 100;
              return (
                <div
                  key={video.id}
                  className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-4 border border-slate-700/50 shadow-lg hover:shadow-xl transition-all animate-scale-in"
                >
                  <div className="relative mb-3">
                    <video
                      src={video.previewUrl}
                      className="w-full h-32 object-cover rounded-lg"
                      muted
                    />
                    {progress < 100 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {progress === 100 && (
                      <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                        <FaCheckCircle className="text-white text-sm" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(video.id);
                      }}
                      className="absolute top-2 left-2 bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-700 transition-all shadow-lg"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-white text-sm font-medium truncate" title={video.file.name}>
                      {video.file.name}
                    </p>
                    <p className="text-gray-400 text-xs">{formatFileSize(video.file.size)}</p>
                    {progress < 100 && (
                      <div className="w-full bg-slate-700 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-gradient-to-r from-primary to-purple-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchUpload;
