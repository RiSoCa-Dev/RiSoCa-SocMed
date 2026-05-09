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
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase secrets" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data, error } = await supabase.from("social_accounts").select("platform, platform_account_id, username, connected_at, metadata");
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
  return new Response(JSON.stringify({ accounts: grouped }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});
