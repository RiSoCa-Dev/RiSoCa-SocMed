/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");

  if (!clientId) {
    return json({ error: "Missing GOOGLE_CLIENT_ID" }, 500);
  }

  const redirectUri =
    "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/youtube-auth-callback";

  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error } = await owner.admin.from("oauth_states").insert({
    state,
    provider: "youtube",
    platform: "youtube",
    expires_at: expiresAt,
  });

  if (error) {
    return json({ error: "Could not create OAuth state: " + error.message }, 500);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
});
