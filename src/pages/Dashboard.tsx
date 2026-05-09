import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlug,
  FaRocket,
} from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { getOwnerFunctionHeaders } from '../lib/functionAuth';
import { getFunctionUrl } from '../lib/supabase';
import { platforms, platformMap, type PlatformKey } from '../lib/platforms';
import { Badge, Button, Card, EmptyState, PageHeader, StatCard } from '../components/ui';

type ScheduledPost = {
  id: string;
  platform: string;
  title: string | null;
  scheduled_at: string;
  status: string;
  privacy_status: string | null;
  selected_platforms?: string[] | null;
  youtube_video_id: string | null;
  upload_error: string | null;
};

type ScheduledPostsResponse = { posts: ScheduledPost[] } | { error: string };

export default function Dashboard() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);

      try {
        const headers = await getOwnerFunctionHeaders();
        const response = await fetch(getFunctionUrl('scheduled-posts-list'), { headers });
        const data = (await response.json()) as ScheduledPostsResponse;

        if (!response.ok || 'error' in data) {
          throw new Error('error' in data ? data.error : 'Could not load queue');
        }

        setPosts(data.posts);
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
      scheduled: posts.filter((p) => p.status === 'scheduled').length,
      uploaded: posts.filter((p) => p.status === 'uploaded').length,
      failed: posts.filter((p) => p.status === 'failed').length,
      processing: posts.filter((p) => p.status === 'processing').length,
    };
  }, [posts]);

  return (
    <main className="min-h-screen p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow={<Badge tone="primary"><FaRocket />Private Control Room</Badge>}
          title="Publishing Dashboard"
          description="Monitor your upcoming queue, publishing health, and platform readiness from your private workspace."
          action={(
            <Button type="button" className="min-w-36" onClick={() => window.location.assign('/scheduler')}>
              Create Post
            </Button>
          )}
        />

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard icon={<FaCalendarAlt />} label="Scheduled" value={stats.scheduled} helper="Waiting for publish time" />
          <StatCard icon={<FaCheckCircle />} label="Uploaded" value={stats.uploaded} helper="Completed uploads" tone="success" />
          <StatCard icon={<FiClock />} label="Processing" value={stats.processing} helper="Worker in progress" />
          <StatCard icon={<FaExclamationTriangle />} label="Failed" value={stats.failed} helper="Needs review" tone="danger" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-xl font-black">Recent Queue</h2>
                <p className="text-sm text-slate-400">Latest scheduled uploads from Supabase.</p>
              </div>
              <Button type="button" variant="secondary" onClick={() => window.location.assign('/scheduler')}>
              Create Post
              </Button>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading queue...</div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={<FaCalendarAlt />}
                title="No scheduled posts yet"
                description="Upload your first video and keep it private, unlisted, or ready for publishing."
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-950/80 text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Platform</th>
                      <th className="px-4 py-3">Schedule</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {posts.map((post) => {
                      const platform = platformMap[post.platform as PlatformKey];
                      return (
                        <tr key={post.id} className="border-t border-slate-800/80">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-100">{post.title || 'Untitled'}</p>
                            {post.privacy_status && <p className="mt-1 text-xs text-slate-500">Privacy: {post.privacy_status}</p>}
                            {post.upload_error && <p className="mt-1 text-xs text-red-300">{post.upload_error}</p>}
                          </td>
                          <td className="px-4 py-3 text-slate-300">{platform?.name || post.platform}</td>
                          <td className="px-4 py-3 text-slate-400">{new Date(post.scheduled_at).toLocaleString()}</td>
                          <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-200">
                <FaPlug />
              </div>
              <div>
                <h2 className="text-xl font-black">Platform Readiness</h2>
                <p className="text-sm text-slate-400">All channels in one place.</p>
              </div>
            </div>

            <div className="space-y-3">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${platform.iconClassName}`}>{platform.icon}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-100">{platform.name}</p>
                      <p className="truncate text-xs text-slate-500">{platform.schedulerSummary}</p>
                    </div>
                  </div>
                  <Badge tone={platform.canAutoPublish ? 'success' : 'warning'}>{platform.canAutoPublish ? 'Live' : 'Pending'}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === 'uploaded' ? 'success' : status === 'failed' ? 'danger' : status === 'processing' ? 'primary' : 'default';
  return <Badge tone={tone} className="capitalize">{status}</Badge>;
}