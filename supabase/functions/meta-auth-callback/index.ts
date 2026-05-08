/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";

  if (!code) return new Response("Missing OAuth code", { status: 400 });

  const appId = Deno.env.get("META_APP_ID");
  const appSecret = Deno.env.get("META_APP_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!appId || !appSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Missing required environment secrets", { status: 500 });
  }

  const redirectUri = "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/meta-auth-callback";

  const shortTokenRes = await fetch(
    `https://graph.facebook.com/v25.0/oauth/access_token?${new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      redirect_uri: redirectUri,
      code,
    }).toString()}`
  );
  const shortTokenData = await shortTokenRes.json();
  if (!shortTokenRes.ok) return jsonError("Short token exchange failed", shortTokenData);

  const longTokenRes = await fetch(
    `https://graph.facebook.com/v25.0/oauth/access_token?${new URLSearchParams({
      grant_type: "fb_exchange_token",
      client_id: appId,
      client_secret: appSecret,
      fb_exchange_token: shortTokenData.access_token,
    }).toString()}`
  );
  const longTokenData = await longTokenRes.json();
  if (!longTokenRes.ok) return jsonError("Long token exchange failed", longTokenData);

  const userAccessToken = longTokenData.access_token || shortTokenData.access_token;

  const pagesRes = await fetch(
    `https://graph.facebook.com/v25.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(userAccessToken)}`
  );
  const pagesData = await pagesRes.json();
  if (!pagesRes.ok) return jsonError("Fetching pages failed", pagesData);

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const pages = Array.isArray(pagesData.data) ? pagesData.data : [];
  const nowIso = new Date().toISOString();
  const expiresAt = longTokenData.expires_in
    ? new Date(Date.now() + Number(longTokenData.expires_in) * 1000).toISOString()
    : null;

  await supabase.from("social_accounts").upsert(
    {
      platform: "meta",
      platform_account_id: "meta-user",
      access_token: userAccessToken,
      refresh_token: null,
      token_type: longTokenData.token_type || "Bearer",
      expires_at: expiresAt,
      scope: "pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish",
      metadata: { pages_count: pages.length },
      connected_at: nowIso,
      updated_at: nowIso,
    },
    { onConflict: "platform,platform_account_id" }
  );

  let instagramCount = 0;

  for (const page of pages) {
    const ig = page.instagram_business_account;

    await supabase.from("meta_pages").upsert(
      {
        page_id: page.id,
        page_name: page.name,
        page_access_token: page.access_token,
        instagram_business_account_id: ig?.id || null,
        instagram_username: ig?.username || ig?.name || null,
        updated_at: nowIso,
      },
      { onConflict: "page_id" }
    );

    await supabase.from("social_accounts").upsert(
      {
        platform: "facebook",
        platform_account_id: page.id,
        username: page.name,
        access_token: page.access_token,
        token_type: "Bearer",
        scope: "pages_show_list,pages_read_engagement,pages_manage_posts",
        metadata: { page_id: page.id, page_name: page.name },
        connected_at: nowIso,
        updated_at: nowIso,
      },
      { onConflict: "platform,platform_account_id" }
    );

    if (ig?.id) {
      instagramCount += 1;
      await supabase.from("social_accounts").upsert(
        {
          platform: "instagram",
          platform_account_id: ig.id,
          username: ig.username || ig.name || "Instagram",
          access_token: page.access_token,
          token_type: "Bearer",
          scope: "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement",
          metadata: { page_id: page.id, page_name: page.name, instagram_business_account: ig },
          connected_at: nowIso,
          updated_at: nowIso,
        },
        { onConflict: "platform,platform_account_id" }
      );
    }
  }

  return new Response(
    `<html><body style="font-family:sans-serif;padding:24px;line-height:1.5">
      <h2>Meta Connected</h2>
      <p>Facebook Pages were saved. Linked Instagram professional accounts were saved too.</p>
      <pre>${escapeHtml(JSON.stringify({ saved_pages: pages.length, saved_instagram_accounts: instagramCount }, null, 2))}</pre>
      <a href="${appUrl}/connections">Back to Platform Connections</a>
    </body></html>`,
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
});

function jsonError(message: string, details: unknown) {
  return new Response(JSON.stringify({ error: message, details }, null, 2), {
    status: 500,
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
