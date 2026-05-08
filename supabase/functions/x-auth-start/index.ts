/// <reference lib="deno.ns" />

Deno.serve(async () => {
  const appUrl = Deno.env.get("APP_URL") || "http://localhost:5173";
  const required = ["X_CLIENT_ID", "X_CLIENT_SECRET"];
  const missing = required.filter((key) => !Deno.env.get(key));
  if (missing.length) {
    return Response.redirect(`${appUrl}/connections?error=${encodeURIComponent(`Missing ${missing.join(", ")}. Add developer credentials before connecting this platform.`)}`, 302);
  }
  return Response.redirect(`${appUrl}/connections?error=${encodeURIComponent("OAuth scaffold exists. Callback and publishing implementation must be enabled after platform app approval.")}`, 302);
});
