import { useState } from 'react';
import { FaGoogle, FaCalendarAlt, FaLock, FaYoutube } from 'react-icons/fa';
import { useAuth } from '../lib/useAuth';
import { platforms } from '../lib/platforms';
import { Badge, Button } from './ui';

export default function LoginPage({
  accessDenied = false,
  ownerEmail,
}: {
  accessDenied?: boolean;
  ownerEmail?: string | null;
}) {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleGoogleLogin() {
    setBusy(true);
    setError(null);

    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google login failed.');
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-transparent text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden p-10 lg:block">
          <div className="absolute left-16 top-16 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="absolute bottom-16 right-16 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black">
                R
              </div>
              <div>
                <p className="text-xl font-bold">RiSoCa Scheduler</p>
                <p className="text-sm text-slate-400">Social media automation</p>
              </div>
            </div>

            <div className="max-w-2xl">
              <Badge tone="primary"><FaLock />Private owner workspace</Badge>
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Your personal social publishing command center.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Sign in with the configured owner account to schedule videos, preview every platform, and manage integrations without public access.
              </p>

              <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {platforms.slice(0, 6).map((platform) => (
                  <div key={platform.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${platform.iconClassName}`}>{platform.icon}</span>
                    <p className="mt-3 font-semibold">{platform.shortName}</p>
                    <p className="text-sm text-slate-400">{platform.schedulerSummary}</p>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-sm text-slate-500">Private dashboard secured by Supabase Auth.</p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-900 lg:bg-white/95">
          <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-xl font-black text-white shadow-lg shadow-blue-200">
                <FaYoutube />
              </div>
              <h2 className="text-3xl font-black">Owner sign in</h2>
              <p className="mt-2 text-slate-600">
                {ownerEmail ? `Only ${ownerEmail} can open this dashboard.` : 'Set VITE_OWNER_EMAIL to lock this dashboard to your email.'}
              </p>
            </div>

            {accessDenied && (
              <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                This dashboard is private. Sign in with
                {' '}
                {ownerEmail || 'the configured owner email'}
                {' '}
                to continue.
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              onClick={handleGoogleLogin}
              disabled={busy}
              className="w-full bg-slate-950 px-5 py-4 hover:bg-slate-800"
            >
              <FaGoogle />
              {busy ? 'Opening Google...' : 'Continue with Google'}
            </Button>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <div className="mb-2 flex items-center gap-2 font-bold text-slate-900">
                <FaCalendarAlt />
                Private mode
              </div>
              No public signup, team invites, or shared workspace. This is built for your own publishing accounts.
            </div>

            <div className="mt-6 text-center text-xs leading-5 text-slate-500">
              <p>By continuing, you access the private RiSoCa Scheduler dashboard.</p>
              <div className="mt-3 flex justify-center gap-4">
                <a className="hover:text-slate-800" href="/privacy">Privacy</a>
                <a className="hover:text-slate-800" href="/terms">Terms</a>
                <a className="hover:text-slate-800" href="/data-deletion">Data deletion</a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
