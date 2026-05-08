import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaClock, FaExclamationTriangle, FaPlus, FaYoutube } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

type ScheduledPost = {
  id: string;
  title: string | null;
  status: string;
  scheduled_at: string;
  youtube_video_id: string | null;
  upload_error: string | null;
  created_at: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function Dashboard() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('scheduled_posts')
      .select('id,title,status,scheduled_at,youtube_video_id,upload_error,created_at')
      .order('scheduled_at', { ascending: false })
      .limit(8);

    if (queryError) {
      setError(queryError.message);
      setPosts([]);
    } else {
      setPosts((data || []) as ScheduledPost[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const stats = useMemo(() => {
    return {
      total: posts.length,
      scheduled: posts.filter((post) => post.status === 'scheduled').length,
      uploaded: posts.filter((post) => post.status === 'uploaded').length,
      failed: posts.filter((post) => post.status === 'failed').length,
    };
  }, [posts]);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-red-300">
              <FaYoutube /> YouTube Scheduler
            </p>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="mt-2 text-slate-400">Live data from Supabase. No mock counters.</p>
          </div>

          <Link to="/scheduler" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500">
            <span className="flex items-center gap-2"><FaPlus /> Schedule Video</span>
          </Link>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">{error}</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Recent jobs" value={stats.total} icon={<FaCalendarAlt />} />
          <StatCard label="Scheduled" value={stats.scheduled} icon={<FaClock />} />
          <StatCard label="Uploaded" value={stats.uploaded} icon={<FaCheckCircle />} />
          <StatCard label="Failed" value={stats.failed} icon={<FaExclamationTriangle />} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent scheduled posts</h2>
            <button type="button" onClick={loadPosts} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-slate-400">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
              No scheduled videos yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-800">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">YouTube ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {posts.map((post) => (
                    <tr key={post.id} className="bg-slate-900">
                      <td className="px-4 py-3 text-slate-100">{post.title || 'Untitled video'}</td>
                      <td className="px-4 py-3 text-slate-300">{formatDate(post.scheduled_at)}</td>
                      <td className="px-4 py-3"><StatusPill status={post.status} /></td>
                      <td className="px-4 py-3 text-slate-300">{post.youtube_video_id || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-blue-300">{icon}</div>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const classes =
    status === 'uploaded'
      ? 'bg-green-500/10 text-green-300 border-green-500/30'
      : status === 'failed'
        ? 'bg-red-500/10 text-red-300 border-red-500/30'
        : 'bg-blue-500/10 text-blue-300 border-blue-500/30';

  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${classes}`}>{status}</span>;
}
