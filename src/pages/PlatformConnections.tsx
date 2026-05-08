import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaFacebookF, FaInstagram, FaLinkedinIn, FaPinterestP, FaYoutube } from "react-icons/fa";
import { FaTiktok, FaXTwitter } from "react-icons/fa6";
import { supabaseAnonKey, supabaseUrl } from "../lib/supabase";

type PlatformKey = "youtube" | "facebook" | "instagram" | "tiktok" | "x" | "linkedin" | "pinterest";

type Account = {
  platform: string;
  platform_account_id?: string | null;
  username?: string | null;
  connected_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type StatusResponse = { accounts: Record<PlatformKey, Account[]> };

const emptyStatus: StatusResponse["accounts"] = {
  youtube: [], facebook: [], instagram: [], tiktok: [], x: [], linkedin: [], pinterest: [],
};

const platformCards: Array<{
  id: PlatformKey;
  title: string;
  description: string;
  icon: ReactNode;
  startFunction: string;
  disconnectPlatform: "youtube" | "meta" | "tiktok" | "x" | "linkedin" | "pinterest";
  badge: string;
}> = [
  { id: "youtube", title: "YouTube", description: "Connect a YouTube channel for automatic scheduled video uploads.", icon: <FaYoutube />, startFunction: "youtube-auth-start", disconnectPlatform: "youtube", badge: "Live" },
  { id: "facebook", title: "Facebook", description: "Connect Facebook Pages through Meta OAuth.", icon: <FaFacebookF />, startFunction: "meta-auth-start?platform=facebook", disconnectPlatform: "meta", badge: "OAuth ready" },
  { id: "instagram", title: "Instagram", description: "Connect professional Instagram accounts linked to your Facebook Page.", icon: <FaInstagram />, startFunction: "meta-auth-start?platform=instagram", disconnectPlatform: "meta", badge: "OAuth ready" },
  { id: "tiktok", title: "TikTok", description: "Requires TikTok Client Key/Secret and Content Posting API access.", icon: <FaTiktok />, startFunction: "tiktok-auth-start", disconnectPlatform: "tiktok", badge: "Needs credentials" },
  { id: "x", title: "X / Twitter", description: "Requires X OAuth 2.0 credentials and write permissions.", icon: <FaXTwitter />, startFunction: "x-auth-start", disconnectPlatform: "x", badge: "Needs credentials" },
  { id: "linkedin", title: "LinkedIn", description: "Requires LinkedIn OAuth app and posting product approval.", icon: <FaLinkedinIn />, startFunction: "linkedin-auth-start", disconnectPlatform: "linkedin", badge: "Needs approval" },
  { id: "pinterest", title: "Pinterest", description: "Requires Pinterest developer app credentials.", icon: <FaPinterestP />, startFunction: "pinterest-auth-start", disconnectPlatform: "pinterest", badge: "Needs credentials" },
];

function functionUrl(name: string) { return `${supabaseUrl}/functions/v1/${name}`; }

function getHeaders(): HeadersInit {
  return supabaseAnonKey ? { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

export default function PlatformConnections() {
  const [accounts, setAccounts] = useState<StatusResponse["accounts"]>(emptyStatus);
  const [loading, setLoading] = useState(true);
  const [busyPlatform, setBusyPlatform] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const connected = params.get("connected");
  const error = params.get("error");
  const metaConnected = useMemo(() => accounts.facebook.length > 0 || accounts.instagram.length > 0, [accounts]);

  async function loadStatus() {
    setLoading(true);
    try {
      const res = await fetch(functionUrl("platform-connections-status"), { headers: getHeaders() });
      const data = (await res.json()) as Partial<StatusResponse>;
      setAccounts({ ...emptyStatus, ...(data.accounts || {}) });
    } catch (err) {
      console.error(err);
      setAccounts(emptyStatus);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadStatus(); }, []);

  function connect(startFunction: string) { window.location.href = functionUrl(startFunction); }

  async function disconnect(platform: string) {
    setBusyPlatform(platform);
    try {
      await fetch(functionUrl("platform-disconnect"), { method: "POST", headers: getHeaders(), body: JSON.stringify({ platform }) });
      await loadStatus();
    } finally {
      setBusyPlatform(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 p-6 shadow-2xl">
          <p className="text-sm font-semibold text-blue-300">RiSoCa Scheduler</p>
          <h1 className="mt-2 text-4xl font-black">Platform Connections</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Connect your publishing channels once. YouTube is ready for uploads now; the other buttons are wired to OAuth starts and activate when developer credentials and platform approvals are added.</p>
        </header>

        {connected && <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100"><FaCheckCircle />{connected} connected successfully.</div>}
        {error && <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100"><FaExclamationTriangle />Connection failed: {decodeURIComponent(error)}</div>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platformCards.map((card) => {
            const platformAccounts = accounts[card.id] || [];
            const connectedStatus = platformAccounts.length > 0;
            return (
              <ConnectionCard
                key={card.id}
                title={card.title}
                description={card.description}
                icon={card.icon}
                badge={card.badge}
                connected={connectedStatus}
                details={platformAccounts.map((a) => a.username || a.platform_account_id || card.title)}
                loading={loading}
                onConnect={() => connect(card.startFunction)}
                onDisconnect={() => disconnect(card.disconnectPlatform)}
                busy={busyPlatform === card.disconnectPlatform}
                helper={card.id === "instagram" && !platformAccounts.length && metaConnected ? "No linked Instagram professional account found. Link Instagram to your Facebook Page, then reconnect Meta." : undefined}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}

function ConnectionCard({ title, description, icon, badge, connected, details, loading, busy, helper, onConnect, onDisconnect }: { title: string; description: string; icon: ReactNode; badge: string; connected: boolean; details: string[]; loading: boolean; busy: boolean; helper?: string; onConnect: () => void; onDisconnect: () => void }) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-2xl text-blue-300">{icon}</div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${connected ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-800 text-slate-300"}`}>{loading ? "Checking" : connected ? "Connected" : badge}</span>
      </div>
      <h2 className="mt-5 text-xl font-bold">{title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{description}</p>
      {connected && details.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{details.map((detail) => <span key={detail} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{detail}</span>)}</div>}
      {helper && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">{helper}</p>}
      <div className="mt-5">{connected ? <button onClick={onDisconnect} disabled={busy} className="w-full rounded-2xl border border-slate-700 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:opacity-60">{busy ? "Disconnecting..." : "Disconnect"}</button> : <button onClick={onConnect} disabled={loading || busy} className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60">Connect {title}</button>}</div>
    </div>
  );
}
