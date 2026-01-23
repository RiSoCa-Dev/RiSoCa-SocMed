import { useRef, useState } from 'react';
import { FaImage, FaVideo, FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const MediaUpload = ({ onFileSelect, selectedFile }: MediaUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime', 'video/avi'];
    if (validTypes.includes(file.type)) {
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 50);
      onFileSelect(file);
    } else {
      alert('Invalid file type. Please upload an image or video.');
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
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FaImage className="text-6xl text-gray-500" />;
    return selectedFile.type.startsWith('video/') ? (
      <FaVideo className="text-6xl text-primary" />
    ) : (
      <FaImage className="text-6xl text-primary" />
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
        transition-all duration-300 overflow-hidden
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
      {/* Animated background gradient */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-600/20 to-pink-600/20 animate-pulse-slow"></div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="relative z-10 animate-scale-in">
          <div className="relative inline-block">
            {selectedFile.type.startsWith('image/') ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Preview"
                className="max-h-64 mx-auto rounded-xl shadow-2xl border-2 border-slate-700"
              />
            ) : (
              <div className="relative">
                <video
                  src={URL.createObjectURL(selectedFile)}
                  className="max-h-64 mx-auto rounded-xl shadow-2xl border-2 border-slate-700"
                  controls
                />
                <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  <FaVideo className="inline mr-1" />
                  Video
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-700 transition-all shadow-lg hover:scale-110"
            >
              <FaTimes />
            </button>
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="mb-4 flex justify-center">
            {isDragging ? (
              <FaCloudUploadAlt className="text-6xl text-primary animate-bounce" />
            ) : (
              getFileIcon()
            )}
          </div>
          <p className="text-white font-semibold text-lg mb-2">
            {isDragging ? 'Drop your file here' : 'Upload Media'}
          </p>
          <p className="text-gray-400 text-sm">
            {isDragging ? 'Release to upload' : 'Click or drag & drop to upload'}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Supports images and videos (JPEG, PNG, GIF, MP4)
          </p>
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
