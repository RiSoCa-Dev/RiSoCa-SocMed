import type { PlatformKey } from './platforms';

export type CachedScheduledPost = {
  id: string;
  platform: string;
  title: string | null;
  scheduled_at: string;
  status: string;
  privacy_status: string | null;
  selected_platforms?: string[] | null;
  youtube_video_id: string | null;
  upload_error: string | null;
  uploaded_at?: string | null;
  created_at?: string | null;
};

export type CachedAccount = {
  platform: string;
  platform_account_id?: string | null;
  username?: string | null;
  connected_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type ConnectionsCache = Record<PlatformKey, CachedAccount[]>;

let scheduledPostsCache: CachedScheduledPost[] | null = null;
let connectionsCache: ConnectionsCache | null = null;

export function getCachedScheduledPosts() {
  return scheduledPostsCache;
}

export function setCachedScheduledPosts(posts: CachedScheduledPost[]) {
  scheduledPostsCache = posts;
}

export function clearScheduledPostsCache() {
  scheduledPostsCache = null;
}

export function getCachedConnections() {
  return connectionsCache;
}

export function setCachedConnections(accounts: ConnectionsCache) {
  connectionsCache = accounts;
}

export function clearConnectionsCache() {
  connectionsCache = null;
}
