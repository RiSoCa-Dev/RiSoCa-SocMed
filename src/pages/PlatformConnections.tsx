import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabase";

type Account = {
  platform: string;
  platform_account_id?: string | null;
  username?: string | null;
  connected_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type StatusResponse = {
  accounts: {
    youtube: Account[];
    facebook: Account[];
    instagram: Account[];
    tiktok: Account[];
  };
};

const emptyStatus: StatusResponse["accounts"] = {
  youtube: [],
  facebook: [],
  instagram: [],
  tiktok: [],
};

function functionUrl(name: string) {
  return `${supabaseUrl}/functions/v1/${name}`;
}

function getHeaders(): HeadersInit {
  return supabaseAnonKey
    ? {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      }
    : { "Content-Type": "application/json" };
}

export default function PlatformConnections() {
  const [accounts, setAccounts] = useState<StatusResponse["accounts"]>(emptyStatus);
  const [loading, setLoading] = useState(true);
  const [busyPlatform, setBusyPlatform] = useState<string | null>(null);

  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const error = params.get("error");

  const metaConnected = useMemo(
    () => accounts.facebook.length > 0 || accounts.instagram.length > 0,
    [accounts]
  );

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch(functionUrl("platform-connections-status"), {
        headers: getHeaders(),
      });
      const data = (await res.json()) as StatusResponse;
      setAccounts(data.accounts || emptyStatus);
    } catch (err) {
      console.error(err);
      setAccounts(emptyStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  function connectYouTube() {
    window.location.href = functionUrl("youtube-auth-start");
  }

  function connectMeta(platform: "facebook" | "instagram") {
    window.location.href = `${functionUrl("meta-auth-start")}?platform=${platform}`;
  }

  async function disconnect(platform: "youtube" | "meta" | "tiktok") {
    setBusyPlatform(platform);
    try {
      await fetch(functionUrl("platform-disconnect"), {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ platform }),
      });
      await loadStatus();
    } finally {
      setBusyPlatform(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-blue-950 p-6">
          <h1 className="text-4xl font-black">Platform Connections</h1>
          <p className="mt-2 text-slate-300">Connect channels once. Schedule posts anytime.</p>
        </header>

        {connected && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
            <FaCheckCircle />
            {connected} connected successfully.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
            <FaExclamationTriangle />
            Connection failed: {error}
          </div>
        )}

        <section className="grid gap-4">
          <ConnectionCard
            title="YouTube"
            description="Auto-upload scheduled videos to your YouTube channel."
            connected={accounts.youtube.length > 0}
            details={accounts.youtube.map((a) => a.username || "YouTube channel")}
            loading={loading}
            onConnect={connectYouTube}
            onDisconnect={() => disconnect("youtube")}
            busy={busyPlatform === "youtube"}
          />

          <ConnectionCard
            title="Facebook"
            description="Connect Facebook Pages through Meta OAuth."
            connected={accounts.facebook.length > 0}
            details={accounts.facebook.map((a) => a.username || a.platform_account_id || "Facebook Page")}
            loading={loading}
            onConnect={() => connectMeta("facebook")}
            onDisconnect={() => disconnect("meta")}
            busy={busyPlatform === "meta"}
          />

          <ConnectionCard
            title="Instagram"
            description="Connect professional Instagram accounts linked to your Page."
            connected={accounts.instagram.length > 0}
            details={accounts.instagram.map((a) => a.username || a.platform_account_id || "Instagram account")}
            loading={loading}
            onConnect={() => connectMeta("instagram")}
            onDisconnect={() => disconnect("meta")}
            busy={busyPlatform === "meta"}
            helper={
              !accounts.instagram.length && metaConnected
                ? "No linked Instagram professional account found. Link Instagram to your Facebook Page, then reconnect."
                : undefined
            }
          />

          <ConnectionCard
            title="TikTok"
            description="TikTok will be enabled after Content Posting API approval."
            connected={accounts.tiktok.length > 0}
            details={accounts.tiktok.map((a) => a.username || "TikTok account")}
            loading={loading}
            onConnect={() => alert("TikTok API credentials and Content Posting API approval are needed first.")}
            onDisconnect={() => disconnect("tiktok")}
            busy={busyPlatform === "tiktok"}
          />
        </section>
      </div>
    </main>
  );
}

function ConnectionCard({
  title,
  description,
  connected,
  details,
  loading,
  busy,
  helper,
  onConnect,
  onDisconnect,
}: {
  title: string;
  description: string;
  connected: boolean;
  details: string[];
  loading: boolean;
  busy: boolean;
  helper?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{title}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              connected ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-800 text-slate-300"
            }`}>
              {loading ? "Checking..." : connected ? "Connected" : "Not connected"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">{description}</p>
          {connected && details.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {details.map((detail) => (
                <span key={detail} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">
                  {detail}
                </span>
              ))}
            </div>
          )}
          {helper && <p className="mt-3 text-sm text-amber-300">{helper}</p>}
        </div>

        {connected ? (
          <button
            onClick={onDisconnect}
            disabled={busy}
            className="rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-60"
          >
            {busy ? "Disconnecting..." : "Disconnect"}
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={loading || busy}
            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            Connect {title}
          </button>
        )}
      </div>
    </div>
  );
}
