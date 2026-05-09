import { useEffect, useMemo, useState } from 'react';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaRocket,
} from 'react-icons/fa';
import { FiClock } from 'react-icons/fi';
import { supabase } from '../lib/supabase';

type ScheduledPost = {
  id: string;
  platform: string;
  title: string | null;
  scheduled_at: string;
  status: string;
  youtube_video_id: string | null;
  upload_error: string | null;
};

export default function Dashboard() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      setLoading(true);

      const { data } = await supabase
        .from('scheduled_posts')
        .select(
          'id, platform, title, scheduled_at, status, youtube_video_id, upload_error'
        )
        .order('scheduled_at', { ascending: false })
        .limit(20);

      setPosts((data || []) as ScheduledPost[]);
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
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-blue-950 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-sm text-blue-200">
                <FaRocket />
                RiSoCa Scheduler
              </p>

              <h1 className="text-4xl font-black">
                Publishing Dashboard
              </h1>

              <p className="mt-2 text-slate-300">
                Monitor your scheduled and uploaded posts.
              </p>
            </div>

            <a
              href="/scheduler"
              className="rounded-2xl bg-blue-600 px-5 py-3 text-center font-bold text-white hover:bg-blue-500"
            >
              Create Post
            </a>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <StatCard
            icon={<FaCalendarAlt />}
            label="Scheduled"
            value={stats.scheduled}
          />

          <StatCard
            icon={<FaCheckCircle />}
            label="Uploaded"
            value={stats.uploaded}
          />

          <StatCard
            icon={<FiClock />}
            label="Processing"
            value={stats.processing}
          />

          <StatCard
            icon={<FaExclamationTriangle />}
            label="Failed"
            value={stats.failed}
          />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Recent Queue</h2>

              <p className="text-sm text-slate-400">
                Latest scheduled uploads from Supabase.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-400">
              Loading queue...
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-700 p-8 text-center text-slate-400">
              No scheduled posts yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {posts.map((post) => (
                    <tr
                      key={post.id}
                      className="border-t border-slate-800"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-100">
                          {post.title || 'Untitled'}
                        </p>

                        {post.upload_error && (
                          <p className="mt-1 text-xs text-red-300">
                            {post.upload_error}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3 capitalize text-slate-300">
                        {post.platform}
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {new Date(post.scheduled_at).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs capitalize text-slate-200">
                          {post.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-300">
        {icon}
      </div>

      <p className="text-3xl font-black">{value}</p>

      <p className="mt-1 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}