/// <reference lib="deno.ns" />

Deno.serve(async () => {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");

  if (!clientId) {
    return new Response("Missing GOOGLE_CLIENT_ID", { status: 500 });
  }

  const redirectUri =
    "https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/youtube-auth-callback";

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/youtube.upload",
    access_type: "offline",
    prompt: "consent",
  });

  return Response.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    302
  );
});
