/// <reference lib="deno.ns" />
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Missing Supabase Edge Function secrets" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const nowIso = new Date().toISOString();
  const { data: duePosts, error } = await supabase
    .from("scheduled_posts")
    .select("id, platform, selected_platforms, status, scheduled_at")
    .lte("scheduled_at", nowIso)
    .in("status", ["scheduled", "queued"])
    .limit(25);

  if (error) {
    return json({ error: error.message }, 500);
  }

  const posts = duePosts || [];

  for (const post of posts) {
    await supabase.from("publish_logs").insert({
      scheduled_post_id: post.id,
      platform: post.platform || "unknown",
      status: "skipped",
      message:
        "Shared queue worker is active. YouTube uses direct scheduled uploads; remaining platform publishers are enabled as credentials and approvals are completed.",
      metadata: {
        selectedPlatforms: post.selected_platforms || [],
      },
    });
  }

  return json({
    ok: true,
    processed: posts.length,
    message:
      "Shared queue worker checked due posts. YouTube direct uploads remain handled by YouTube publishAt; other publishers are scaffolded.",
  });
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}