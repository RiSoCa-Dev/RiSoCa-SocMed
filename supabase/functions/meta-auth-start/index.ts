/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const appId = Deno.env.get("META_APP_ID");
  if (!appId) {
    return json({ error: "Missing META_APP_ID" }, 500);
  }

  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") || "facebook";
  const redirectUri = "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/meta-auth-callback";
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await owner.admin.from("oauth_states").insert({
    state,
    provider: "meta",
    platform,
    expires_at: expiresAt,
  });

  if (error) {
    return json({ error: "Could not create OAuth state: " + error.message }, 500);
  }

  const scope = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
    "instagram_basic",
    "instagram_content_publish",
  ].join(",");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    response_type: "code",
    scope,
  });

  return json({ url: `https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}` });
});
