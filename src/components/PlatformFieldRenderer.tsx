import { useState, useEffect } from 'react';
import type { Platform } from './PlatformSelector';
import { getPlatformConfig, getCharacterLimit } from '../utils/platformFields';
import CharacterCounter from './CharacterCounter';
import { FaHashtag, FaLink, FaMapMarkerAlt, FaTag, FaLock, FaComment, FaUsers, FaCut, FaFacebook, FaInstagram, FaYoutube, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';

interface PlatformFieldRendererProps {
  platforms: Platform[];
  formData: Record<string, any>;
  onFieldChange: (fieldId: string, value: any) => void;
}

const PlatformFieldRenderer = ({ platforms, formData, onFieldChange }: PlatformFieldRendererProps) => {
  const [tagInput, setTagInput] = useState('');
  const [expandedPlatforms, setExpandedPlatforms] = useState<Set<Platform>>(new Set(platforms));
  
  // Update expanded platforms when platforms change
  useEffect(() => {
    setExpandedPlatforms(new Set(platforms));
  }, [platforms]);

  const togglePlatform = (platform: Platform) => {
    setExpandedPlatforms((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(platform)) {
        newSet.delete(platform);
      } else {
        newSet.add(platform);
      }
      return newSet;
    });
  };

  const handleTagAdd = (platform: Platform) => {
    const fieldId = `${platform}_tags`;
    const currentTags = formData[fieldId] || [];
    const newTag = tagInput.trim();
    if (newTag && !currentTags.includes(newTag)) {
      onFieldChange(fieldId, [...currentTags, newTag]);
      setTagInput('');
    }
  };

  const handleTagRemove = (platform: Platform, tag: string) => {
    const fieldId = `${platform}_tags`;
    const currentTags = formData[fieldId] || [];
    onFieldChange(fieldId, currentTags.filter((t: string) => t !== tag));
  };

  const renderField = (platform: Platform, field: any) => {
    const fieldId = `${platform}_${field.id}`;
    const value = formData[fieldId] || '';

    switch (field.type) {
      case 'textarea':
        const charLimit = getCharacterLimit(platform, field.id === 'caption' ? 'caption' : field.id === 'description' ? 'description' : 'caption');
        return (
          <div key={fieldId} className="mb-6">
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              {field.id === 'caption' && <FaHashtag className="text-primary" />}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="w-full min-h-[120px] bg-slate-800 text-white rounded-lg p-4 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
              required={field.required}
            />
            {charLimit && (
              <CharacterCounter current={value.length} max={charLimit} />
            )}
            {field.description && (
              <p className="text-gray-400 text-xs mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'text':
        return (
          <div key={fieldId} className="mb-6">
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              {field.id === 'link' && <FaLink className="text-primary" />}
              {field.id === 'location' && <FaMapMarkerAlt className="text-primary" />}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required={field.required}
            />
            {field.description && (
              <p className="text-gray-400 text-xs mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={fieldId} className="mb-6">
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              {field.id === 'privacy' && <FaLock className="text-primary" />}
              {field.id === 'category' && <FaTag className="text-primary" />}
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => onFieldChange(fieldId, e.target.value)}
              className="w-full bg-slate-800 text-white rounded-lg p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              required={field.required}
            >
              <option value="">Select {field.label.toLowerCase()}</option>
              {field.options?.map((opt: { value: string; label: string }) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {field.description && (
              <p className="text-gray-400 text-xs mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'toggle':
        return (
          <div key={fieldId} className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                {field.id.includes('comment') && <FaComment className="text-primary" />}
                {field.id.includes('duet') && <FaUsers className="text-primary" />}
                {field.id.includes('stitch') && <FaCut className="text-primary" />}
                <span className="text-white text-sm font-medium">{field.label}</span>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={value || false}
                  onChange={(e) => onFieldChange(fieldId, e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    value ? 'bg-primary' : 'bg-slate-700'
                  }`}
                  onClick={() => onFieldChange(fieldId, !value)}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      value ? 'translate-x-7' : 'translate-x-1'
                    } mt-0.5`}
                  />
                </div>
              </div>
            </label>
            {field.description && (
              <p className="text-gray-400 text-xs mt-1">{field.description}</p>
            )}
          </div>
        );

      case 'tags':
        const tags = formData[fieldId] || [];
        return (
          <div key={fieldId} className="mb-6">
            <label className="block text-white text-sm font-medium mb-2 flex items-center gap-2">
              <FaTag className="text-primary" />
              {field.label}
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleTagAdd(platform);
                  }
                }}
                placeholder={field.placeholder}
                className="flex-1 bg-slate-800 text-white rounded-lg p-3 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => handleTagAdd(platform)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(platform, tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            {field.description && (
              <p className="text-gray-400 text-xs mt-1">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (platforms.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>Select at least one platform to see available fields</p>
      </div>
    );
  }

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'facebook':
        return (
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <FaFacebook className="text-white text-xl" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-lg flex items-center justify-center">
            <FaInstagram className="text-white text-xl" />
          </div>
        );
      case 'youtube':
        return (
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <FaYoutube className="text-white text-xl" />
          </div>
        );
      case 'tiktok':
        return (
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/20">
            <FaTiktok className="text-white text-xl" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {platforms.map((platform) => {
        const config = getPlatformConfig(platform);
        const isExpanded = expandedPlatforms.has(platform);
        return (
          <div
            key={platform}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl border border-slate-700/50 shadow-lg overflow-hidden transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => togglePlatform(platform)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-700/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getPlatformIcon(platform)}
                <h3 className="text-white text-lg font-semibold">{config.name} Settings</h3>
              </div>
              <div className="text-gray-400 hover:text-white transition-colors">
                {isExpanded ? (
                  <FaChevronUp className="text-xl" />
                ) : (
                  <FaChevronDown className="text-xl" />
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="px-6 pb-6 space-y-4 animate-fade-in">
                {config.fields.map((field) => renderField(platform, field))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlatformFieldRenderer;
