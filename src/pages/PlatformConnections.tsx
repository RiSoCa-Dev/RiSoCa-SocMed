import { useEffect, useState } from 'react';
import { FaCheckCircle, FaFacebook, FaInstagram, FaPlug, FaSpinner, FaUnlink, FaYoutube } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import { getFunctionUrl } from '../lib/supabase';

type PlatformId = 'youtube' | 'facebook' | 'instagram' | 'tiktok';

type Platform = {
  id: PlatformId;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
};

type StatusResponse = {
  connections?: Array<{ platform: PlatformId; connected: boolean }>;
};

const platforms: Platform[] = [
  { id: 'youtube', name: 'YouTube', icon: <FaYoutube />, enabled: true },
  { id: 'facebook', name: 'Facebook', icon: <FaFacebook />, enabled: false },
  { id: 'instagram', name: 'Instagram', icon: <FaInstagram />, enabled: false },
  { id: 'tiktok', name: 'TikTok', icon: <FaTiktok />, enabled: false },
];

export default function PlatformConnections() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busyPlatform, setBusyPlatform] = useState<PlatformId | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refreshStatus = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(getFunctionUrl('platform-connections-status'));
      if (!response.ok) throw new Error(await response.text());

      const data = (await response.json()) as StatusResponse;
      const next: Record<string, boolean> = {};

      for (const item of data.connections || []) {
        next[item.platform] = item.connected;
      }

      setConnected(next);
    } catch (error) {
      console.error(error);
      setMessage('Could not load connection status. Redeploy platform-connections-status if needed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const connect = (platform: Platform) => {
    if (platform.id === 'youtube') {
      window.location.href = getFunctionUrl('youtube-auth-start');
      return;
    }

    setMessage(`${platform.name} OAuth is not connected yet. YouTube is the active test platform.`);
  };

  const disconnect = async (platform: Platform) => {
    setBusyPlatform(platform.id);
    setMessage(null);

    try {
      const response = await fetch(getFunctionUrl('platform-disconnect'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id }),
      });

      if (!response.ok) throw new Error(await response.text());

      setConnected((current) => ({ ...current, [platform.id]: false }));
      setMessage(`${platform.name} disconnected.`);
    } catch (error) {
      console.error(error);
      setMessage(`Could not disconnect ${platform.name}.`);
    } finally {
      setBusyPlatform(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-blue-300">
            <FaPlug /> Channels
          </p>
          <h1 className="text-3xl font-bold">Platform Connections</h1>
          <p className="mt-2 text-slate-400">Connect accounts once. Scheduled uploads use the saved permission automatically.</p>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-100">
            {message}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {platforms.map((platform) => {
            const isConnected = Boolean(connected[platform.id]);
            const isBusy = busyPlatform === platform.id;

            return (
              <div key={platform.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-2xl">
                      {platform.icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold">{platform.name}</h2>
                      <p className={isConnected ? 'text-sm text-green-300' : 'text-sm text-slate-400'}>
                        {loading ? 'Checking...' : isConnected ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>

                  {isConnected && <FaCheckCircle className="text-2xl text-green-400" />}
                </div>

                <div className="mt-5">
                  {isConnected ? (
                    <button
                      type="button"
                      onClick={() => disconnect(platform)}
                      disabled={isBusy}
                      className="w-full rounded-xl border border-red-500/40 px-4 py-3 font-semibold text-red-200 transition hover:bg-red-500/10 disabled:opacity-60"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isBusy ? <FaSpinner className="animate-spin" /> : <FaUnlink />}
                        Disconnect
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => connect(platform)}
                      className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
                    >
                      Connect {platform.name}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
