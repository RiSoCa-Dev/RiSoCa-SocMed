import { useEffect, useMemo, useState } from "react";
import { supabaseUrl, supabaseAnonKey } from "../lib/supabase";

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
    } catch (error) {
      console.error(error);
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
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-slate-900">Platform Connections</h1>
          <p className="mt-2 text-slate-600">
            Connect channels once, then schedule uploads from the scheduler.
          </p>
        </header>

        <section className="grid gap-4">
          <ConnectionCard
            title="YouTube"
            description="Upload scheduled videos to your YouTube channel."
            connected={accounts.youtube.length > 0}
            details={accounts.youtube.map((a) => a.username || "YouTube channel")}
            loading={loading}
            onConnect={connectYouTube}
            onDisconnect={() => disconnect("youtube")}
            busy={busyPlatform === "youtube"}
          />

          <ConnectionCard
            title="Facebook"
            description="Publish scheduled videos to connected Facebook Pages."
            connected={accounts.facebook.length > 0}
            details={accounts.facebook.map((a) => a.username || a.platform_account_id || "Facebook Page")}
            loading={loading}
            onConnect={() => connectMeta("facebook")}
            onDisconnect={() => disconnect("meta")}
            busy={busyPlatform === "meta"}
          />

          <ConnectionCard
            title="Instagram"
            description="Publish scheduled videos/Reels to linked professional Instagram accounts."
            connected={accounts.instagram.length > 0}
            details={accounts.instagram.map((a) => a.username || a.platform_account_id || "Instagram account")}
            loading={loading}
            onConnect={() => connectMeta("instagram")}
            onDisconnect={() => disconnect("meta")}
            busy={busyPlatform === "meta"}
            helper={!accounts.instagram.length && metaConnected ? "No linked Instagram professional account found. Link Instagram to your Facebook Page, then reconnect Meta." : undefined}
          />

          <ConnectionCard
            title="TikTok"
            description="TikTok connection will be added after Content Posting API access is approved."
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${connected ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
              {loading ? "Checking..." : connected ? "Connected" : "Not connected"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
          {connected && details.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {details.map((detail) => (
                <span key={detail} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                  {detail}
                </span>
              ))}
            </div>
          )}
          {helper && <p className="mt-3 text-sm text-amber-700">{helper}</p>}
        </div>

        <div className="flex gap-2">
          {connected ? (
            <button onClick={onDisconnect} disabled={busy} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {busy ? "Disconnecting..." : "Disconnect"}
            </button>
          ) : (
            <button onClick={onConnect} disabled={loading || busy} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60">
              Connect {title}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
