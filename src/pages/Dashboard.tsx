import { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaPlay, FaPlug, FaRocket } from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { getOwnerFunctionHeaders } from '../lib/functionAuth';
import { getFunctionUrl } from '../lib/supabase';
import { platforms, platformMap, type PlatformKey } from '../lib/platforms';
import { Badge, Button, Card, EmptyState, StatCard } from '../components/ui';
import { getCachedScheduledPosts, setCachedScheduledPosts, type CachedScheduledPost } from '../lib/appCache';

type ScheduledPost = CachedScheduledPost;

type ScheduledPostsResponse = { posts: ScheduledPost[] } | { error: string };

export default function Dashboard() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      const cachedPosts = getCachedScheduledPosts();

      if (cachedPosts) {
        setPosts(cachedPosts);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const headers = await getOwnerFunctionHeaders();
        const response = await fetch(getFunctionUrl('scheduled-posts-list'), { headers });
        const data = (await response.json()) as ScheduledPostsResponse;

        if (!response.ok || 'error' in data) {
          throw new Error('error' in data ? data.error : 'Could not load queue');
        }

        setPosts(data.posts);
        setCachedScheduledPosts(data.posts);
      } catch (error) {
        console.error(error);
        setPosts([]);
      }

      setLoading(false);
    }

    void loadPosts();
  }, []);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
      uploaded: posts.filter((p) => p.status === 'uploaded').length,
      failed: posts.filter((p) => p.status === 'failed').length,
      processing: posts.filter((p) => p.status === 'processing' || p.status === 'uploading').length,
    };
  }, [posts]);

  const upcomingPosts = useMemo(
    () =>
      posts
        .filter((post) => new Date(post.scheduled_at).getTime() >= Date.now())
        .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
        .slice(0, 5),
    [posts]
  );

  const platformDistribution = useMemo(() => {
    const counts = new Map<PlatformKey, number>();

    for (const post of posts) {
      const postPlatforms = post.selected_platforms?.length ? post.selected_platforms : [post.platform];
      for (const platformId of postPlatforms) {
        if (platformId in platformMap) {
          counts.set(platformId as PlatformKey, (counts.get(platformId as PlatformKey) || 0) + 1);
        }
      }
    }

    return platforms.map((platform) => ({
      platform,
      count: counts.get(platform.id) || 0,
      percent: posts.length ? Math.round(((counts.get(platform.id) || 0) / posts.length) * 100) : 0,
    }));
  }, [posts]);

  return (
    <main className="min-h-screen p-2.5 text-white sm:p-3">
      <div className="mx-auto max-w-[96rem] space-y-3">
        <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <Badge tone="primary"><FaRocket />Private Control Room</Badge>
            <h1 className="mt-1.5 text-xl font-black tracking-tight">Dashboard</h1>
            <p className="mt-1 text-xs text-slate-400">Overview of your real scheduling activity.</p>
          </div>
          <Button type="button" className="w-fit bg-gradient-to-r from-blue-600 to-fuchsia-600" onClick={() => window.location.assign('/scheduler')}>
            <FaRocket />
            Schedule New Post
          </Button>
        </header>

        <section className="grid gap-2.5 md:grid-cols-5">
          <StatCard icon={<FaPlug />} label="Total Posts" value={stats.total} helper="Tracked by RiSoCa" />
          <StatCard icon={<FaCalendarAlt />} label="Scheduled" value={stats.scheduled} helper="Waiting for publish time" tone="warning" />
          <StatCard icon={<FaCheckCircle />} label="Published" value={stats.uploaded} helper="Uploaded to platform" tone="success" />
          <StatCard icon={<FiClock />} label="Processing" value={stats.processing} helper="Worker in progress" />
          <StatCard icon={<FaExclamationTriangle />} label="Failed" value={stats.failed} helper="Needs review" tone="danger" />
        </section>

        <section className="grid gap-3 xl:grid-cols-[1fr_300px]">
          <Card>
            <div className="mb-3.5 flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
              <div>
                <h2 className="border-l-4 border-blue-500 pl-2.5 text-base font-black">Upcoming Posts</h2>
                <p className="mt-1.5 text-xs text-slate-400">Next scheduled posts from your private queue.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => window.location.assign('/scheduler')}>
              Create Post
              </Button>
            </div>

            {loading ? (
              <div className="p-5 text-center text-xs text-slate-400">Loading queue...</div>
            ) : upcomingPosts.length === 0 ? (
              <EmptyState
                icon={<FaCalendarAlt />}
                title="No upcoming posts"
                description="Schedule a YouTube video to populate your upcoming list."
              />
            ) : (
              <div className="space-y-2.5">
                {upcomingPosts.map((post) => (
                  <PostRow key={post.id} post={post} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-3.5 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/15 text-blue-200">
                <FaPlug />
              </div>
              <div>
                <h2 className="text-base font-black">Platform Distribution</h2>
                <p className="text-xs text-slate-400">Real posts by selected platform.</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {platformDistribution.map(({ platform, count, percent }) => (
                <div key={platform.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-2.5">
                  <div className="mb-2 flex items-center justify-between gap-2.5">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-sm ${platform.iconClassName}`}>{platform.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-slate-100">{platform.name}</p>
                        <p className="truncate text-xs text-slate-500">{count} posts</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{percent}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <Card>
          <div className="mb-3.5">
            <h2 className="border-l-4 border-blue-500 pl-2.5 text-base font-black">Recent Posts Performance</h2>
            <p className="mt-1.5 text-xs text-slate-400">Latest upload status from your actual scheduling data.</p>
          </div>

          {loading ? (
            <div className="p-5 text-center text-xs text-slate-400">Loading recent posts...</div>
          ) : posts.length === 0 ? (
            <EmptyState title="No post history yet" description="Completed and failed uploads will appear here." />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/40">
              {posts.slice(0, 5).map((post) => (
                <PostRow key={post.id} post={post} showError variant="performance" />
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}

function PostRow({
  post,
  showError = false,
  variant = 'compact',
}: {
  post: ScheduledPost;
  showError?: boolean;
  variant?: 'compact' | 'performance';
}) {
  const platform = platformMap[post.platform as PlatformKey];
  const scheduledAt = new Date(post.scheduled_at);
  const uploadedAt = post.uploaded_at ? new Date(post.uploaded_at) : null;
  const youtubeUrl = post.youtube_video_id ? `https://www.youtube.com/watch?v=${post.youtube_video_id}` : null;

  if (variant === 'performance') {
    return (
      <div className="border-b border-slate-800/80 p-3 last:border-b-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              {platform && <span className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${platform.iconClassName}`}>{platform.icon}</span>}
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-slate-100">{post.title || 'Untitled post'}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {platform?.name || post.platform} · Scheduled {scheduledAt.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-2 grid gap-2 text-[10px] text-slate-400 sm:grid-cols-3">
              <Metric label="Visibility" value={post.privacy_status || 'Default'} />
              <Metric label="Uploaded" value={uploadedAt ? uploadedAt.toLocaleString() : 'Not yet'} />
              <Metric label="Video ID" value={post.youtube_video_id || 'Pending'} />
            </div>

            {showError && post.upload_error && (
              <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2 text-[10px] text-red-200">
                {post.upload_error}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-[10px] font-bold text-slate-300 transition hover:border-blue-400 hover:text-blue-200"
              >
                <FaPlay />
                Open
              </a>
            )}
            <StatusBadge status={post.status} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-slate-100">{post.title || 'Untitled post'}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
            {platform && <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md ${platform.iconClassName}`}>{platform.icon}</span>}
            <span>{new Date(post.scheduled_at).toLocaleString()}</span>
            {post.privacy_status && <span>Visibility: {post.privacy_status}</span>}
          </div>
          {showError && post.upload_error && <p className="mt-3 text-xs text-red-300">{post.upload_error}</p>}
        </div>
        <StatusBadge status={post.status} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-900/70 px-2 py-1.5">
      <p className="font-bold uppercase tracking-[0.12em] text-slate-600">{label}</p>
      <p className="mt-0.5 truncate text-slate-300">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'uploaded' ? 'success' : status === 'failed' ? 'danger' : status === 'processing' || status === 'uploading' ? 'primary' : 'default';
  return <Badge tone={tone} className="capitalize">{status}</Badge>;
}