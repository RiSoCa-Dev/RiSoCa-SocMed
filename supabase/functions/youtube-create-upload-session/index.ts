/// <reference lib="deno.ns" />

import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

type RequestBody = {
  title: string;
  description?: string;
  publishAt: string;
  fileSize: number;
  mimeType: string;
  privacyStatus?: "private" | "unlisted" | "public";
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const formData = await req.formData().catch(() => null);
  const fileValue = formData?.get("file");
  const file = fileValue instanceof File ? fileValue : null;
  const body = formData
    ? {
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        publishAt: String(formData.get("publishAt") || ""),
        fileSize: file?.size || 0,
        mimeType: String(formData.get("mimeType") || file?.type || "video/mp4"),
        privacyStatus: String(formData.get("privacyStatus") || "private") as RequestBody["privacyStatus"],
      }
    : null;

  if (!body || !file) {
    return json({ error: "Video file and upload metadata are required" }, 400);
  }

  if (!body.title?.trim()) {
    return json({ error: "Title is required" }, 400);
  }

  if (!body.publishAt) {
    return json({ error: "publishAt is required" }, 400);
  }

  if (!body.fileSize || body.fileSize <= 0) {
    return json({ error: "fileSize is required" }, 400);
  }

  const publishDate = new Date(body.publishAt);

  if (Number.isNaN(publishDate.getTime())) {
    return json({ error: "Invalid publishAt date" }, 400);
  }

  if (publishDate.getTime() <= Date.now() + 60_000) {
    return json(
      { error: "Schedule time must be at least 1 minute in the future" },
      400
    );
  }

  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  const privacyStatus = body.privacyStatus || "private";

  if (!googleClientId || !googleClientSecret) {
    return json({ error: "Missing Google OAuth secrets" }, 500);
  }

  if (!["private", "unlisted", "public"].includes(privacyStatus)) {
    return json({ error: "Invalid privacyStatus" }, 400);
  }

  const { data: youtubeAccount, error: accountError } = await owner.admin
    .from("social_accounts")
    .select("refresh_token")
    .eq("platform", "youtube")
    .single();

  if (accountError || !youtubeAccount?.refresh_token) {
    return json(
      {
        error:
          "YouTube is not connected. Go to Platform Connections and connect YouTube first.",
      },
      400
    );
  }

  const accessToken = await refreshGoogleAccessToken({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    refreshToken: youtubeAccount.refresh_token,
  });

  const { data: scheduledPost, error: insertError } = await owner.admin
    .from("scheduled_posts")
    .insert({
      platform: "youtube",
      selected_platforms: ["youtube"],
      title: body.title.trim(),
      description: body.description || "",
      video_path: `youtube-direct-upload:${crypto.randomUUID()}`,
      scheduled_at: publishDate.toISOString(),
      status: "uploading",
      privacy_status: privacyStatus,
      upload_error: null,
    })
    .select("id")
    .single();

  if (insertError || !scheduledPost) {
    return json(
      {
        error:
          "Could not create scheduled post row: " +
          (insertError?.message || "Unknown error"),
      },
      500
    );
  }

  const metadata = {
    snippet: {
      title: body.title.trim().slice(0, 100),
      description: body.description || "",
    },
    status: {
      privacyStatus,
      publishAt: publishDate.toISOString(),
      selfDeclaredMadeForKids: false,
    },
  };

  const uploadSessionRes = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": String(body.fileSize),
        "X-Upload-Content-Type": body.mimeType || "video/mp4",
      },
      body: JSON.stringify(metadata),
    }
  );

  if (!uploadSessionRes.ok) {
    const errorText = await uploadSessionRes.text();

    await owner.admin
      .from("scheduled_posts")
      .update({
        status: "failed",
        upload_error: errorText,
      })
      .eq("id", scheduledPost.id);

    return json(
      {
        error: "Could not create YouTube upload session: " + errorText,
      },
      500
    );
  }

  const uploadUrl = uploadSessionRes.headers.get("location");

  if (!uploadUrl) {
    return json(
      {
        error: "YouTube did not return an upload session URL.",
      },
      500
    );
  }

  const youtubeUploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": body.mimeType || "video/mp4",
      "Content-Length": String(body.fileSize),
    },
    body: file.stream(),
  });

  const uploadResult = await youtubeUploadRes.json().catch(async () => {
    const text = await youtubeUploadRes.text().catch(() => "");
    return text ? { error: text } : null;
  });

  if (!youtubeUploadRes.ok) {
    await owner.admin
      .from("scheduled_posts")
      .update({
        status: "failed",
        upload_error: JSON.stringify(uploadResult),
        updated_at: new Date().toISOString(),
      })
      .eq("id", scheduledPost.id);

    await owner.admin.from("publish_logs").insert({
      scheduled_post_id: scheduledPost.id,
      platform: "youtube",
      status: "failed",
      message: "YouTube upload failed.",
      metadata: {
        privacyStatus,
        error: uploadResult,
      },
    });

    return json({ error: "YouTube upload failed: " + JSON.stringify(uploadResult) }, 500);
  }

  await owner.admin
    .from("scheduled_posts")
    .update({
      status: "uploaded",
      youtube_video_id: uploadResult?.id ?? null,
      uploaded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", scheduledPost.id);

  await owner.admin.from("publish_logs").insert({
    scheduled_post_id: scheduledPost.id,
    platform: "youtube",
    status: "uploaded",
    message: "Video uploaded to YouTube from the protected Edge Function.",
    metadata: {
      youtubeVideoId: uploadResult?.id ?? null,
      privacyStatus,
    },
  });

  return json({
    scheduledPostId: scheduledPost.id,
    youtubeVideoId: uploadResult?.id ?? null,
  });
});

async function refreshGoogleAccessToken({
  clientId,
  clientSecret,
  refreshToken,
}: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();

  if (!res.ok || !data.access_token) {
    throw new Error("Failed to refresh Google access token: " + JSON.stringify(data));
  }

  return data.access_token as string;
}
