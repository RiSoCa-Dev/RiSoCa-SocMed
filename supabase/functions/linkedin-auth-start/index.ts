/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const required = ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET"];
  const missing = required.filter((key) => !Deno.env.get(key));
  if (missing.length) {
    return json({ error: `Missing ${missing.join(", ")}. Add developer credentials before connecting this platform.` }, 400);
  }
  return json({ error: "OAuth scaffold exists. Callback and publishing implementation must be enabled after platform app approval." }, 400);
});
