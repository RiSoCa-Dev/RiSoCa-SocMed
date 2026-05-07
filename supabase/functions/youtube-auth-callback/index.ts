/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

  if (error) {
    return html(`
      <h2>YouTube connection failed</h2>
      <p>Google returned: ${escapeHtml(error)}</p>
      <a href="${appUrl}/connections">Back to Platform Connections</a>
    `, 400);
  }

  if (!code) {
    return new Response("Missing OAuth code", { status: 400 });
  }

  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!clientId || !clientSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Missing required Edge Function secrets", { status: 500 });
  }

  const redirectUri =
    "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/youtube-auth-callback";

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
    return new Response(JSON.stringify(tokenData, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString()
    : null;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

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
    return new Response(JSON.stringify({ error: saveError.message }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return html(`
    <h2>YouTube Connected</h2>
    <p>OAuth succeeded. The YouTube refresh token was saved to Supabase for automated uploads.</p>
    <pre>${escapeHtml(JSON.stringify({
      platform: "youtube",
      saved: true,
      has_access_token: Boolean(tokenData.access_token),
      has_refresh_token: Boolean(tokenData.refresh_token),
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
      token_type: tokenData.token_type,
    }, null, 2))}</pre>
    <a href="${appUrl}/connections">Back to Platform Connections</a>
  `);
});

function html(body: string, status = 200) {
  return new Response(`
    <html>
      <body style="font-family: sans-serif; padding: 24px; line-height: 1.5;">
        ${body}
      </body>
    </html>
  `, {
    status,
    headers: { "Content-Type": "text/html" },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
