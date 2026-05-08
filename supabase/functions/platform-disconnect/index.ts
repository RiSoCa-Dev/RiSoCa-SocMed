/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const { platform } = await req.json().catch(() => ({ platform: null }));
  if (!supabaseUrl || !serviceRoleKey || !platform) return new Response(JSON.stringify({ error: "Missing required parameter" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  if (platform === "meta") {
    await supabase.from("social_accounts").delete().in("platform", ["meta", "facebook", "instagram"]);
    await supabase.from("meta_pages").delete().neq("page_id", "");
  } else {
    await supabase.from("social_accounts").delete().eq("platform", platform);
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
