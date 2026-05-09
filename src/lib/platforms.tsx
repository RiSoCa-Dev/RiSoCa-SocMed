import type { ReactNode } from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaYoutube } from 'react-icons/fa';
import { FaTiktok, FaXTwitter } from 'react-icons/fa6';

export type PlatformKey =
  | 'youtube'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'x'
  | 'linkedin'
  | 'pinterest';

export type PlatformStatus = 'live' | 'oauth-ready' | 'needs-credentials' | 'needs-approval';

export type PlatformConfig = {
  id: PlatformKey;
  name: string;
  shortName: string;
  contentType: string;
  description: string;
  connectionSummary: string;
  schedulerSummary: string;
  startFunction: string;
  disconnectPlatform: 'youtube' | 'meta' | 'tiktok' | 'x' | 'linkedin' | 'pinterest';
  status: PlatformStatus;
  canAutoPublish: boolean;
  icon: ReactNode;
  iconClassName: string;
};

export const platforms: PlatformConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    shortName: 'YouTube',
    contentType: 'Shorts / Video',
    description: 'Connect your channel and upload scheduled videos automatically.',
    connectionSummary: 'OAuth and upload worker are ready.',
    schedulerSummary: 'Auto-publish enabled',
    startFunction: 'youtube-auth-start',
    disconnectPlatform: 'youtube',
    status: 'live',
    canAutoPublish: true,
    icon: <FaYoutube />,
    iconClassName: 'bg-red-500 text-white',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    shortName: 'Facebook',
    contentType: 'Page Video',
    description: 'Connect Facebook Pages through Meta OAuth.',
    connectionSummary: 'Pages OAuth is ready; publishing worker is the next phase.',
    schedulerSummary: 'Preview ready, worker next',
    startFunction: 'meta-auth-start?platform=facebook',
    disconnectPlatform: 'meta',
    status: 'oauth-ready',
    canAutoPublish: false,
    icon: <FaFacebookF />,
    iconClassName: 'bg-blue-600 text-white',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    shortName: 'Instagram',
    contentType: 'Reels',
    description: 'Connect professional Instagram accounts linked to Facebook Pages.',
    connectionSummary: 'Meta OAuth is ready for linked professional accounts.',
    schedulerSummary: 'Preview ready, worker next',
    startFunction: 'meta-auth-start?platform=instagram',
    disconnectPlatform: 'meta',
    status: 'oauth-ready',
    canAutoPublish: false,
    icon: <FaInstagram />,
    iconClassName: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    shortName: 'TikTok',
    contentType: 'Vertical Video',
    description: 'Prepare for TikTok Content Posting API access.',
    connectionSummary: 'Requires TikTok credentials and Content Posting API approval.',
    schedulerSummary: 'Needs API approval',
    startFunction: 'tiktok-auth-start',
    disconnectPlatform: 'tiktok',
    status: 'needs-approval',
    canAutoPublish: false,
    icon: <FaTiktok />,
    iconClassName: 'bg-slate-950 text-white',
  },
  {
    id: 'x',
    name: 'X / Twitter',
    shortName: 'X',
    contentType: 'Post / Video',
    description: 'Prepare OAuth 2.0 write access for video posts.',
    connectionSummary: 'Requires X OAuth credentials and write permissions.',
    schedulerSummary: 'Needs credentials',
    startFunction: 'x-auth-start',
    disconnectPlatform: 'x',
    status: 'needs-credentials',
    canAutoPublish: false,
    icon: <FaXTwitter />,
    iconClassName: 'bg-black text-white',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    contentType: 'Professional Post',
    description: 'Prepare company/profile posting once LinkedIn app access is approved.',
    connectionSummary: 'Requires LinkedIn app and posting product approval.',
    schedulerSummary: 'Needs approval',
    startFunction: 'linkedin-auth-start',
    disconnectPlatform: 'linkedin',
    status: 'needs-approval',
    canAutoPublish: false,
    icon: <FaLinkedinIn />,
    iconClassName: 'bg-sky-700 text-white',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    shortName: 'Pinterest',
    contentType: 'Pin / Idea Pin',
    description: 'Prepare Pinterest publishing with developer credentials.',
    connectionSummary: 'Requires Pinterest developer app credentials.',
    schedulerSummary: 'Needs credentials',
    startFunction: 'pinterest-auth-start',
    disconnectPlatform: 'pinterest',
    status: 'needs-credentials',
    canAutoPublish: false,
    icon: <FaPinterestP />,
    iconClassName: 'bg-red-700 text-white',
  },
];

export const platformMap = Object.fromEntries(
  platforms.map((platform) => [platform.id, platform])
) as Record<PlatformKey, PlatformConfig>;

export function platformStatusLabel(status: PlatformStatus) {
  switch (status) {
    case 'live':
      return 'Live';
    case 'oauth-ready':
      return 'OAuth ready';
    case 'needs-credentials':
      return 'Needs credentials';
    case 'needs-approval':
      return 'Needs approval';
  }
}
