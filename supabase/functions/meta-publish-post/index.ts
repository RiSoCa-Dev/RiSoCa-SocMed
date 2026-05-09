/// <reference lib="deno.ns" />
import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

type MetaPublishBody = {
  scheduledPostId: string;
  platform: "facebook" | "instagram";
  mediaUrl?: string;
  caption?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const body = (await req.json().catch(() => null)) as MetaPublishBody | null;

  if (!body?.scheduledPostId || !body.platform) {
    return json({ error: "scheduledPostId and platform are required" }, 400);
  }

  if (!["facebook", "instagram"].includes(body.platform)) {
    return json({ error: "Unsupported Meta platform" }, 400);
  }

  const { data: account, error: accountError } = await owner.admin
    .from("social_accounts")
    .select("platform, platform_account_id, username")
    .eq("platform", body.platform)
    .limit(1)
    .maybeSingle();

  if (accountError) {
    return json({ error: accountError.message }, 500);
  }

  if (!account) {
    await logMetaResult(owner.admin, body.scheduledPostId, body.platform, "failed", `${body.platform} is not connected.`);
    return json({ error: `${body.platform} is not connected.` }, 400);
  }

  await logMetaResult(
    owner.admin,
    body.scheduledPostId,
    body.platform,
    "needs_implementation",
    "Meta OAuth is connected. Publishing requires final account target selection, media hosting URL, and approved Meta publishing permissions.",
    {
      accountId: account.platform_account_id,
      username: account.username,
      hasMediaUrl: Boolean(body.mediaUrl),
    }
  );

  return json({
    ok: false,
    status: "needs_implementation",
    message:
      "Meta publishing scaffold is ready, but final Facebook/Instagram publish calls require approved permissions and a public media URL.",
  });
});

async function logMetaResult(
  admin: SupabaseClient,
  scheduledPostId: string,
  platform: string,
  status: string,
  message: string,
  metadata: Record<string, unknown> = {}
) {
  await admin.from("publish_logs").insert({
    scheduled_post_id: scheduledPostId,
    platform,
    status,
    message,
    metadata,
  });
}
