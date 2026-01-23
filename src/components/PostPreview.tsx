import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { FaImage } from 'react-icons/fa';
import type { Platform } from './PlatformSelector';

interface PostPreviewProps {
  platforms: Platform[];
  content: string;
  mediaUrl: string | null;
  mediaFile: File | null;
  formData: Record<string, any>;
}

const PostPreview = ({ platforms, mediaUrl, mediaFile, formData }: PostPreviewProps) => {
  const allPlatforms: Platform[] = ['facebook', 'instagram', 'youtube', 'tiktok'];

  // Platform-specific aspect ratios for mobile/reels/shorts
  const platformDimensions: Record<Platform, { 
    aspectRatio: string; 
    label: string;
    width: string;
    height: string;
  }> = {
    facebook: { 
      aspectRatio: '9/16', // Reels format
      label: '9:16',
      width: 'w-full',
      height: 'h-48'
    },
    instagram: { 
      aspectRatio: '9/16', // Reels format
      label: '9:16',
      width: 'w-full',
      height: 'h-48'
    },
    youtube: { 
      aspectRatio: '9/16', // Shorts format
      label: '9:16',
      width: 'w-full',
      height: 'h-48'
    },
    tiktok: { 
      aspectRatio: '9/16', // Vertical video
      label: '9:16',
      width: 'w-full',
      height: 'h-48'
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <FaFacebook className="text-white text-sm" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex items-center justify-center">
            <FaInstagram className="text-white text-sm" />
          </div>
        );
      case 'youtube':
        return (
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <FaYoutube className="text-white text-sm" />
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center border border-white/20">
            <FaTiktok className="text-white text-sm" />
          </div>
        );
    }
  };

  // const getPlatformContent = (platform: Platform) => {
  //   if (platform === 'youtube') {
  //     const title = formData[`${platform}_title`];
  //     return title || 'Untitled Video';
  //   }
  //   return formData[`${platform}_caption`] || formData[`${platform}_content`] || content || '';
  // };

  // const getPlatformDescription = (platform: Platform) => {
  //   if (platform === 'youtube') {
  //     return formData[`${platform}_description`] || '';
  //   }
  //   return '';
  // };

  const isPlatformSelected = (platform: Platform) => {
    return platforms.includes(platform);
  };

  // const hasMediaForPlatform = (platform: Platform) => {
  //   // Show media for all platforms if media exists (both URL and file)
  //   // This ensures preview works even if only one is available
  //   return !!(mediaUrl || mediaFile);
  // };

  const isVideo = (url: string | null, file: File | null) => {
    // First, check the file type directly if File object is available (most reliable)
    if (file) {
      return file.type.startsWith('video/');
    }
    
    // Fall back to URL pattern checking for non-blob URLs
    if (!url) return false;
    if (typeof url === 'string') {
      // Check for video file extensions
      const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv'];
      const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
      
      // Check for video type in URL
      const hasVideoType = url.includes('video') || url.includes('Video');
      
      // For blob URLs, we can't detect from URL alone, so return false
      // (should have been caught by file.type check above)
      if (url.startsWith('blob:')) {
        return false; // Can't determine from blob URL alone
      }
      
      return hasVideoExtension || hasVideoType;
    }
    return false;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
        Post Preview
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {allPlatforms.map((platform) => {
          const isSelected = isPlatformSelected(platform);
          const dimensions = platformDimensions[platform];
          const hasMedia = !!(mediaUrl || mediaFile);
          
          return (
            <div
              key={platform}
              className={`
                bg-slate-800 rounded-xl overflow-hidden border transition-all duration-300
                ${isSelected 
                  ? 'border-primary/50 shadow-lg shadow-primary/20' 
                  : 'border-slate-700/50 opacity-60'
                }
              `}
            >
              {/* Platform Header */}
              <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-2">
                {getPlatformIcon(platform)}
                <span className="font-semibold text-white capitalize text-sm">
                  {platform === 'youtube' ? 'Youtube' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                </span>
              </div>

              {/* Content Area */}
              <div className="p-4">
                {/* Preview Area with Platform-Specific Aspect Ratio - 9:16 for reels/shorts */}
                <div 
                  className="relative bg-slate-900 rounded-lg border border-slate-700/50 overflow-hidden mx-auto"
                  style={{ 
                    aspectRatio: '9/16',
                    width: '100%',
                    maxWidth: '100%',
                    height: 'auto'
                  }}
                >
                  {/* Preview Label - Only show when no media */}
                  {!hasMedia && (
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                      <FaImage className="text-gray-400 text-xs" />
                      <span className="text-gray-400 text-xs">Preview</span>
                    </div>
                  )}

                  {/* Media Preview */}
                  {hasMedia && (mediaUrl || mediaFile) ? (
                    <>
                      {isVideo(mediaUrl, mediaFile) ? (
                        <video
                          src={mediaUrl || (mediaFile ? URL.createObjectURL(mediaFile) : '')}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ 
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }}
                          controls={false}
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="auto"
                          onError={(e) => {
                            console.error('Video load error:', e);
                          }}
                          onLoadedData={() => {
                            console.log('Video loaded successfully');
                          }}
                        />
                      ) : (
                        <img
                          src={mediaUrl || (mediaFile ? URL.createObjectURL(mediaFile) : '')}
                          alt="Preview"
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ 
                            objectFit: 'cover',
                            width: '100%',
                            height: '100%'
                          }}
                          onError={(e) => {
                            console.error('Image load error:', e);
                          }}
                        />
                      )}
                      
                      {/* Aspect Ratio Badge */}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-sm z-10">
                        {dimensions.label}
                      </div>
                    </>
                  ) : (
                    // Empty state
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-gray-500 text-xs">
                        {platform === 'youtube' ? 'Video Preview' : 'No content'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags (if any) - Only show tags, no text content */}
                {formData[`${platform}_tags`] && formData[`${platform}_tags`].length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {formData[`${platform}_tags`].slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded"
                      >
                        #{tag}
                      </span>
                    ))}
                    {formData[`${platform}_tags`].length > 3 && (
                      <span className="text-xs text-gray-500">+{formData[`${platform}_tags`].length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostPreview;
