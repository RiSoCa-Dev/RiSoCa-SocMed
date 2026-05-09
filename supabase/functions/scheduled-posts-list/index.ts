/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const { data, error } = await owner.admin
    .from("scheduled_posts")
    .select(
      "id, platform, selected_platforms, title, description, scheduled_at, status, privacy_status, youtube_video_id, upload_error, uploaded_at, created_at"
    )
    .order("scheduled_at", { ascending: false })
    .limit(50);

  if (error) return json({ error: error.message }, 500);

  return json({ posts: data || [] });
});
