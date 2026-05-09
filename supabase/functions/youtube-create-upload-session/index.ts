/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type RequestBody = {
  title: string;
  description?: string;
  publishAt: string;
  fileSize: number;
  mimeType: string;
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

  const body = (await req.json().catch(() => null)) as RequestBody | null;

  if (!body) {
    return json({ error: "Invalid JSON body" }, 400);
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

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Missing Supabase Edge Function secrets" }, 500);
  }

  if (!googleClientId || !googleClientSecret) {
    return json({ error: "Missing Google OAuth secrets" }, 500);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: youtubeAccount, error: accountError } = await supabase
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

  const { data: scheduledPost, error: insertError } = await supabase
    .from("scheduled_posts")
    .insert({
      platform: "youtube",
      title: body.title.trim(),
      description: body.description || "",
      video_path: `youtube-direct-upload:${crypto.randomUUID()}`,
      scheduled_at: publishDate.toISOString(),
      status: "uploading",
      privacy_status: "private",
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
      privacyStatus: "private",
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

    await supabase
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

  return json({
    uploadUrl,
    scheduledPostId: scheduledPost.id,
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

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};