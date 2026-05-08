/// <reference lib="deno.ns" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const appId = Deno.env.get("META_APP_ID");
  if (!appId) {
    return new Response(JSON.stringify({ error: "Missing META_APP_ID" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") || "facebook";
  const redirectUri = "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/meta-auth-callback";

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
    state: JSON.stringify({ platform }),
    response_type: "code",
    scope,
  });

  return Response.redirect(`https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}`, 302);
});
