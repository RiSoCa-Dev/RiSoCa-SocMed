/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

type CompleteUploadBody = {
  scheduledPostId: string;
  ok: boolean;
  youtubeVideoId?: string | null;
  error?: unknown;
  privacyStatus?: string;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const body = (await req.json().catch(() => null)) as CompleteUploadBody | null;

  if (!body?.scheduledPostId) {
    return json({ error: "scheduledPostId is required" }, 400);
  }

  const uploadError = body.error ? JSON.stringify(body.error) : null;
  const status = body.ok ? "uploaded" : "failed";

  const { error: updateError } = await owner.admin
    .from("scheduled_posts")
    .update({
      status,
      youtube_video_id: body.ok ? body.youtubeVideoId ?? null : null,
      upload_error: uploadError,
      uploaded_at: body.ok ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.scheduledPostId);

  if (updateError) {
    return json({ error: updateError.message }, 500);
  }

  await owner.admin.from("publish_logs").insert({
    scheduled_post_id: body.scheduledPostId,
    platform: "youtube",
    status,
    message: body.ok
      ? "Video uploaded to YouTube resumable upload session."
      : "YouTube upload failed.",
    metadata: {
      youtubeVideoId: body.youtubeVideoId ?? null,
      privacyStatus: body.privacyStatus ?? null,
      error: body.error ?? null,
    },
  });

  return json({ ok: true });
});
