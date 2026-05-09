import { useEffect, useMemo, useState } from "react";
import { FaCheckCircle, FaExclamationTriangle, FaLock } from "react-icons/fa";
import { supabaseUrl } from "../lib/supabase";
import { getOwnerFunctionHeaders } from "../lib/functionAuth";
import { platforms, platformStatusLabel, type PlatformConfig, type PlatformKey } from "../lib/platforms";
import { Badge, Button, Card, PageHeader } from "../components/ui";

type Account = {
  platform: string;
  platform_account_id?: string | null;
  username?: string | null;
  connected_at?: string | null;
  metadata?: Record<string, unknown> | null;
};

type StatusResponse = { accounts: Record<PlatformKey, Account[]> };
type OAuthStartResponse = { url: string } | { error: string };

const emptyStatus: StatusResponse["accounts"] = {
  youtube: [], facebook: [], instagram: [], tiktok: [], x: [], linkedin: [], pinterest: [],
};

function functionUrl(name: string) { return `${supabaseUrl}/functions/v1/${name}`; }

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
      const headers = await getOwnerFunctionHeaders();
      const res = await fetch(functionUrl("platform-connections-status"), { headers });
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

  async function connect(startFunction: string) {
    setBusyPlatform(startFunction);

    try {
      const headers = await getOwnerFunctionHeaders();
      const res = await fetch(functionUrl(startFunction), { method: "POST", headers });
      const data = (await res.json()) as OAuthStartResponse;

      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Could not start OAuth connection");
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not start OAuth connection";
      window.location.href = `/connections?error=${encodeURIComponent(message)}`;
    } finally {
      setBusyPlatform(null);
    }
  }

  async function disconnect(platform: string) {
    setBusyPlatform(platform);
    try {
      const headers = await getOwnerFunctionHeaders();
      await fetch(functionUrl("platform-disconnect"), { method: "POST", headers, body: JSON.stringify({ platform }) });
      await loadStatus();
    } finally {
      setBusyPlatform(null);
    }
  }

  return (
    <main className="min-h-screen p-4 text-white sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          eyebrow={<Badge tone="primary"><FaLock />Owner-only integrations</Badge>}
          title="Platform Connections"
          description="Manage every publishing channel from one private setup page. Live integrations can publish now; pending ones show exactly what is needed next."
        />

        {connected && <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100"><FaCheckCircle />{connected} connected successfully.</div>}
        {error && <div className="flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-100"><FaExclamationTriangle />Connection failed: {decodeURIComponent(error)}</div>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {platforms.map((platform) => {
            const platformAccounts = accounts[platform.id] || [];
            const connectedStatus = platformAccounts.length > 0;
            return (
              <ConnectionCard
                key={platform.id}
                platform={platform}
                connected={connectedStatus}
                details={platformAccounts.map((a) => a.username || a.platform_account_id || platform.name)}
                loading={loading}
                onConnect={() => connect(platform.startFunction)}
                onDisconnect={() => disconnect(platform.disconnectPlatform)}
                busy={busyPlatform === platform.disconnectPlatform}
                helper={platform.id === "instagram" && !platformAccounts.length && metaConnected ? "No linked Instagram professional account found. Link Instagram to your Facebook Page, then reconnect Meta." : undefined}
              />
            );
          })}
        </section>
      </div>
    </main>
  );
}

function ConnectionCard({ platform, connected, details, loading, busy, helper, onConnect, onDisconnect }: { platform: PlatformConfig; connected: boolean; details: string[]; loading: boolean; busy: boolean; helper?: string; onConnect: () => void; onDisconnect: () => void }) {
  const badgeTone = connected ? "success" : platform.canAutoPublish ? "primary" : "warning";

  return (
    <Card className="transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${platform.iconClassName}`}>{platform.icon}</div>
        <Badge tone={badgeTone}>{loading ? "Checking" : connected ? "Connected" : platformStatusLabel(platform.status)}</Badge>
      </div>
      <h2 className="mt-5 text-xl font-black">{platform.name}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{platform.description}</p>
      <p className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-xs leading-5 text-slate-400">{platform.connectionSummary}</p>
      {connected && details.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{details.map((detail) => <span key={detail} className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{detail}</span>)}</div>}
      {helper && <p className="mt-4 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-200">{helper}</p>}
      <div className="mt-5">{connected ? <Button type="button" variant="secondary" onClick={onDisconnect} disabled={busy} className="w-full">{busy ? "Disconnecting..." : "Disconnect"}</Button> : <Button type="button" onClick={onConnect} disabled={loading || busy} className="w-full">Connect {platform.shortName}</Button>}</div>
    </Card>
  );
}
