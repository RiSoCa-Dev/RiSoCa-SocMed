import { useState } from 'react';
import { FaGoogle, FaCalendarAlt, FaYoutube, FaFacebookF, FaInstagram } from 'react-icons/fa';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
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
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-10 lg:block">
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
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                <FaCalendarAlt />
                Plan once. Publish everywhere.
              </div>
              <h1 className="text-5xl font-black leading-tight tracking-tight">
                Schedule videos to your connected channels.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Connect YouTube, Facebook Pages, and Instagram accounts, then manage uploads from one clean scheduler.
              </p>

              <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FaYoutube className="text-2xl text-red-400" />
                  <p className="mt-3 font-semibold">YouTube</p>
                  <p className="text-sm text-slate-400">Auto upload tested</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FaFacebookF className="text-2xl text-blue-400" />
                  <p className="mt-3 font-semibold">Facebook</p>
                  <p className="text-sm text-slate-400">Pages OAuth</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <FaInstagram className="text-2xl text-pink-400" />
                  <p className="mt-3 font-semibold">Instagram</p>
                  <p className="text-sm text-slate-400">Professional accounts</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500">Private dashboard secured by Supabase Auth.</p>
          </div>
        </section>

        <section className="flex items-center justify-center bg-slate-50 p-6 text-slate-900">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-xl font-black text-white">
                R
              </div>
              <h2 className="text-3xl font-black">Welcome back</h2>
              <p className="mt-2 text-slate-600">Sign in to manage your scheduler.</p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={busy}
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 px-5 py-4 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaGoogle />
              {busy ? 'Opening Google...' : 'Continue with Google'}
            </button>

            <p className="mt-6 text-center text-xs leading-5 text-slate-500">
              By continuing, you access the private RiSoCa Scheduler dashboard.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
