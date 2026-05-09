/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const state = url.searchParams.get("state");
  const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

  if (error) {
    return Response.redirect(`${appUrl}/connections?error=${encodeURIComponent(error)}`, 302);
  }

  if (!code) {
    return Response.redirect(`${appUrl}/connections?error=missing_oauth_code`, 302);
  }

  if (!state) {
    return Response.redirect(`${appUrl}/connections?error=missing_oauth_state`, 302);
  }

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
    return Response.redirect(`${appUrl}/connections?error=missing_edge_function_secrets`, 302);
  }

  const redirectUri = "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/youtube-auth-callback";
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: oauthState, error: stateError } = await supabase
    .from("oauth_states")
    .select("id, expires_at, used_at")
    .eq("state", state)
    .eq("provider", "youtube")
    .single();

  if (
    stateError ||
    !oauthState ||
    oauthState.used_at ||
    new Date(oauthState.expires_at).getTime() < Date.now()
  ) {
    return Response.redirect(`${appUrl}/connections?error=invalid_or_expired_oauth_state`, 302);
  }

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    return Response.redirect(`${appUrl}/connections?error=${encodeURIComponent(tokenData.error || "google_token_failed")}`, 302);
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString()
    : null;

  const { error: saveError } = await supabase.from("social_accounts").upsert(
    {
      platform: "youtube",
      access_token: tokenData.access_token ?? null,
      refresh_token: tokenData.refresh_token ?? null,
      token_type: tokenData.token_type ?? null,
      scope: tokenData.scope ?? null,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "platform" }
  );

  if (saveError) {
    return Response.redirect(`${appUrl}/connections?error=${encodeURIComponent(saveError.message)}`, 302);
  }

  await supabase
    .from("oauth_states")
    .update({ used_at: new Date().toISOString() })
    .eq("id", oauthState.id);

  return Response.redirect(`${appUrl}/connections?connected=youtube`, 302);
});
