/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const { platform } = await req.json().catch(() => ({ platform: null }));
  if (!platform) return json({ error: "Missing required parameter" }, 400);

  if (platform === "meta") {
    await owner.admin.from("social_accounts").delete().in("platform", ["meta", "facebook", "instagram"]);
    await owner.admin.from("meta_pages").delete().neq("page_id", "");
  } else {
    await owner.admin.from("social_accounts").delete().eq("platform", platform);
  }
  return json({ ok: true });
});
