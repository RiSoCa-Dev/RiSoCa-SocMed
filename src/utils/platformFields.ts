import type { Platform } from '../components/PlatformSelector';

export interface PlatformField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'file' | 'select' | 'toggle' | 'tags';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
  options?: { value: string; label: string }[];
  description?: string;
}

export interface PlatformConfig {
  name: string;
  fields: PlatformField[];
  characterLimits: {
    caption?: number;
    title?: number;
    description?: number;
  };
  mediaRequirements: {
    required: boolean;
    types: string[];
    maxSize?: number;
  };
}

export const platformConfigs: Record<Platform, PlatformConfig> = {
  facebook: {
    name: 'Facebook',
    fields: [
      {
        id: 'content',
        label: 'Message',
        type: 'textarea',
        required: true,
        placeholder: "What's on your mind?",
        maxLength: 63206,
        description: 'Share your thoughts, updates, or stories'
      },
      {
        id: 'link',
        label: 'Link URL (Optional)',
        type: 'text',
        required: false,
        placeholder: 'https://example.com',
        description: 'Add a link to share with your post'
      },
      {
        id: 'location',
        label: 'Location (Optional)',
        type: 'text',
        required: false,
        placeholder: 'Add location',
        description: 'Tag a location in your post'
      },
      {
        id: 'privacy',
        label: 'Privacy',
        type: 'select',
        required: false,
        options: [
          { value: 'PUBLIC', label: 'Public' },
          { value: 'FRIENDS', label: 'Friends' },
          { value: 'CUSTOM', label: 'Custom Audience' }
        ],
        description: 'Control who can see your post'
      },
      {
        id: 'altText',
        label: 'Alt Text (Optional)',
        type: 'text',
        required: false,
        placeholder: 'Describe the image for accessibility',
        maxLength: 1000,
        description: 'Alternative text for images (accessibility)'
      }
    ],
    characterLimits: {
      caption: 63206
    },
    mediaRequirements: {
      required: false,
      types: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime']
    }
  },
  instagram: {
    name: 'Instagram',
    fields: [
      {
        id: 'caption',
        label: 'Caption',
        type: 'textarea',
        required: true,
        placeholder: 'Write a caption... #hashtags @mentions',
        maxLength: 2200,
        description: 'Add hashtags and @mentions to increase reach'
      },
      {
        id: 'location',
        label: 'Location (Optional)',
        type: 'text',
        required: false,
        placeholder: 'Add location',
        description: 'Tag a location'
      },
      {
        id: 'userTags',
        label: 'Tag Users (Optional)',
        type: 'text',
        required: false,
        placeholder: '@username1, @username2',
        description: 'Tag other users in your post (comma-separated)'
      },
      {
        id: 'altText',
        label: 'Alt Text (Optional)',
        type: 'text',
        required: false,
        placeholder: 'Describe the image for accessibility',
        maxLength: 1000,
        description: 'Alternative text for images (accessibility)'
      },
      {
        id: 'firstComment',
        label: 'First Comment (Optional)',
        type: 'textarea',
        required: false,
        placeholder: 'Add a first comment...',
        maxLength: 2200,
        description: 'This will be posted as the first comment'
      }
    ],
    characterLimits: {
      caption: 2200
    },
    mediaRequirements: {
      required: true,
      types: ['image/jpeg', 'image/png', 'video/mp4'],
      maxSize: 100 * 1024 * 1024 // 100MB
    }
  },
  youtube: {
    name: 'YouTube',
    fields: [
      {
        id: 'title',
        label: 'Video Title',
        type: 'text',
        required: true,
        placeholder: 'Enter video title',
        maxLength: 100,
        description: 'A compelling title helps your video get discovered'
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        placeholder: 'Describe your video... #hashtags',
        maxLength: 5000,
        description: 'Include keywords and hashtags for better SEO'
      },
      {
        id: 'tags',
        label: 'Tags',
        type: 'tags',
        required: false,
        placeholder: 'Add tags (comma-separated)',
        description: 'Tags help people find your video (max 500 characters)'
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        required: false,
        options: [
          { value: '1', label: 'Film & Animation' },
          { value: '2', label: 'Autos & Vehicles' },
          { value: '10', label: 'Music' },
          { value: '15', label: 'Pets & Animals' },
          { value: '17', label: 'Sports' },
          { value: '19', label: 'Travel & Events' },
          { value: '20', label: 'Gaming' },
          { value: '22', label: 'People & Blogs' },
          { value: '23', label: 'Comedy' },
          { value: '24', label: 'Entertainment' },
          { value: '25', label: 'News & Politics' },
          { value: '26', label: 'Howto & Style' },
          { value: '27', label: 'Education' },
          { value: '28', label: 'Science & Technology' }
        ],
        description: 'Select a category for your video'
      },
      {
        id: 'privacy',
        label: 'Privacy',
        type: 'select',
        required: false,
        options: [
          { value: 'public', label: 'Public' },
          { value: 'unlisted', label: 'Unlisted' },
          { value: 'private', label: 'Private' }
        ],
        description: 'Control who can see your video'
      },
      {
        id: 'madeForKids',
        label: 'Made for Kids',
        type: 'toggle',
        required: false,
        description: 'Specify if this video is made for kids (COPPA compliance)'
      },
      {
        id: 'defaultLanguage',
        label: 'Default Language',
        type: 'select',
        required: false,
        options: [
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
          { value: 'de', label: 'German' },
          { value: 'it', label: 'Italian' },
          { value: 'pt', label: 'Portuguese' },
          { value: 'ja', label: 'Japanese' },
          { value: 'ko', label: 'Korean' },
          { value: 'zh', label: 'Chinese' }
        ],
        description: 'Primary language of your video'
      }
    ],
    characterLimits: {
      title: 100,
      description: 5000
    },
    mediaRequirements: {
      required: true,
      types: ['video/mp4', 'video/quicktime', 'video/avi'],
      maxSize: 128 * 1024 * 1024 * 1024 // 128GB
    }
  },
  tiktok: {
    name: 'TikTok',
    fields: [
      {
        id: 'caption',
        label: 'Caption',
        type: 'textarea',
        required: true,
        placeholder: 'Add a caption... #hashtags #trending',
        maxLength: 2200,
        description: 'Use trending hashtags to increase visibility'
      },
      {
        id: 'privacy',
        label: 'Privacy Level',
        type: 'select',
        required: false,
        options: [
          { value: 'PUBLIC_TO_EVERYONE', label: 'Public' },
          { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Friends' },
          { value: 'SELF_ONLY', label: 'Private' }
        ],
        description: 'Control who can see your video'
      },
      {
        id: 'allowComments',
        label: 'Allow Comments',
        type: 'toggle',
        required: false,
        description: 'Let viewers comment on your video'
      },
      {
        id: 'allowDuet',
        label: 'Allow Duet',
        type: 'toggle',
        required: false,
        description: 'Let others create duets with your video'
      },
      {
        id: 'allowStitch',
        label: 'Allow Stitch',
        type: 'toggle',
        required: false,
        description: 'Let others stitch your video'
      },
      {
        id: 'allowDownload',
        label: 'Allow Download',
        type: 'toggle',
        required: false,
        description: 'Allow others to download your video'
      },
      {
        id: 'disableDuet',
        label: 'Disable Duet',
        type: 'toggle',
        required: false,
        description: 'Disable duet feature for this video'
      },
      {
        id: 'disableStitch',
        label: 'Disable Stitch',
        type: 'toggle',
        required: false,
        description: 'Disable stitch feature for this video'
      },
      {
        id: 'disableComment',
        label: 'Disable Comments',
        type: 'toggle',
        required: false,
        description: 'Disable comments on your video'
      }
    ],
    characterLimits: {
      caption: 2200
    },
    mediaRequirements: {
      required: true,
      types: ['video/mp4', 'video/quicktime'],
      maxSize: 287 * 1024 * 1024 // 287MB
    }
  }
};

export const getPlatformConfig = (platform: Platform): PlatformConfig => {
  return platformConfigs[platform];
};

export const getCharacterLimit = (platform: Platform, fieldType: 'caption' | 'title' | 'description'): number | undefined => {
  return platformConfigs[platform].characterLimits[fieldType];
};
