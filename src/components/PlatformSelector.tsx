import { FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { useState } from 'react';

export type Platform = 'facebook' | 'instagram' | 'youtube' | 'tiktok';

interface PlatformSelectorProps {
  selectedPlatforms: Platform[];
  onPlatformToggle: (platform: Platform) => void;
}

const PlatformSelector = ({ selectedPlatforms, onPlatformToggle }: PlatformSelectorProps) => {
  const [hoveredPlatform, setHoveredPlatform] = useState<Platform | null>(null);

  const platforms: { 
    id: Platform; 
    icon: React.ReactNode; 
    name: string; 
    color: string;
    gradient: string;
    description: string;
  }[] = [
    {
      id: 'facebook',
      icon: <FaFacebook className="text-2xl" />,
      name: 'Facebook',
      color: 'bg-blue-600',
      gradient: 'from-blue-500 to-blue-700',
      description: 'Share posts, photos, and videos'
    },
    {
      id: 'instagram',
      icon: <FaInstagram className="text-2xl" />,
      name: 'Instagram',
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      description: 'Visual storytelling platform'
    },
    {
      id: 'youtube',
      icon: <FaYoutube className="text-2xl" />,
      name: 'YouTube',
      color: 'bg-red-600',
      gradient: 'from-red-500 to-red-700',
      description: 'Video content platform'
    },
    {
      id: 'tiktok',
      icon: <FaTiktok className="text-2xl" />,
      name: 'TikTok',
      color: 'bg-black',
      gradient: 'from-gray-800 to-black',
      description: 'Short-form video content'
    }
  ];

  return (
    <div>
      <label className="block text-white text-sm font-medium mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-primary to-purple-600 rounded-full"></span>
        Post to:
      </label>
      <div className="flex gap-4 flex-wrap">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          const isHovered = hoveredPlatform === platform.id;
          
          return (
            <div
              key={platform.id}
              className="relative group"
              onMouseEnter={() => setHoveredPlatform(platform.id)}
              onMouseLeave={() => setHoveredPlatform(null)}
            >
              <button
                type="button"
                onClick={() => onPlatformToggle(platform.id)}
                className={`
                  relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                  ${isSelected
                    ? `bg-gradient-to-br ${platform.gradient} text-white shadow-lg shadow-${platform.id === 'facebook' ? 'blue' : platform.id === 'instagram' ? 'pink' : platform.id === 'youtube' ? 'red' : 'gray'}-500/50 scale-110 ring-2 ring-primary ring-offset-2 ring-offset-slate-900`
                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600 hover:text-white hover:scale-105'
                  }
                  ${isHovered && !isSelected ? 'shadow-lg' : ''}
                `}
              >
                {platform.icon}
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </button>
              
              {/* Tooltip */}
              {(isHovered || isSelected) && (
                <div className={`
                  absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-50
                  bg-slate-800 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap
                  shadow-xl border border-slate-700 animate-fade-in
                  ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `}>
                  <div className="font-semibold mb-1">{platform.name}</div>
                  <div className="text-gray-400">{platform.description}</div>
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-slate-800 border-l border-t border-slate-700 rotate-45"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {selectedPlatforms.length > 0 && (
        <div className="mt-4 text-sm text-gray-400 animate-fade-in">
          {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''} selected
        </div>
      )}
    </div>
  );
};

export default PlatformSelector;
