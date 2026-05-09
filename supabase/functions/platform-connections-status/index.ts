/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const { data, error } = await owner.admin.from("social_accounts").select("platform, platform_account_id, username, connected_at, metadata");
  if (error) return json({ error: error.message }, 500);
  const accounts = data || [];
  const grouped = {
    youtube: accounts.filter((a) => a.platform === "youtube"),
    facebook: accounts.filter((a) => a.platform === "facebook"),
    instagram: accounts.filter((a) => a.platform === "instagram"),
    tiktok: accounts.filter((a) => a.platform === "tiktok"),
    x: accounts.filter((a) => a.platform === "x"),
    linkedin: accounts.filter((a) => a.platform === "linkedin"),
    pinterest: accounts.filter((a) => a.platform === "pinterest"),
  };
  return json({ accounts: grouped });
});
