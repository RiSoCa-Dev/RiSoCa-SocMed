/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const BUCKET = "post-media";
const MAX_JOBS_PER_RUN = 3;

Deno.serve(async (req) => {
  try {
    const configuredSecret = Deno.env.get("PROCESS_UPLOAD_SECRET");
    if (configuredSecret) {
      const receivedSecret = req.headers.get("x-cron-secret");
      if (receivedSecret !== configuredSecret) {
        return json({ error: "Unauthorized" }, 401);
      }
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
    const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");

    if (!supabaseUrl || !serviceRoleKey || !googleClientId || !googleClientSecret) {
      return json({ error: "Missing required Edge Function secrets" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: account, error: accountError } = await supabase
      .from("social_accounts")
      .select("refresh_token")
      .eq("platform", "youtube")
      .single();

    if (accountError || !account?.refresh_token) {
      return json({ error: "YouTube account is not connected or refresh token is missing" }, 400);
    }

    const { data: jobs, error: jobsError } = await supabase
      .from("scheduled_posts")
      .select("*")
      .eq("platform", "youtube")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(MAX_JOBS_PER_RUN);

    if (jobsError) {
      return json({ error: jobsError.message }, 500);
    }

    if (!jobs || jobs.length === 0) {
      return json({ processed: 0, message: "No due scheduled posts" });
    }

    const results = [];

    for (const job of jobs) {
      const result = await processJob({
        supabase,
        job,
        refreshToken: account.refresh_token,
        googleClientId,
        googleClientSecret,
      });
      results.push(result);
    }

    return json({ processed: results.length, results });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 500);
  }
});

async function processJob(args: {
  supabase: ReturnType<typeof createClient>;
  job: any;
  refreshToken: string;
  googleClientId: string;
  googleClientSecret: string;
}) {
  const { supabase, job, refreshToken, googleClientId, googleClientSecret } = args;

  const processingStartedAt = new Date().toISOString();

  const { error: lockError } = await supabase
    .from("scheduled_posts")
    .update({ status: "processing", updated_at: processingStartedAt, upload_error: null })
    .eq("id", job.id)
    .eq("status", "scheduled");

  if (lockError) {
    return { id: job.id, status: "failed_to_lock", error: lockError.message };
  }

  try {
    const accessToken = await refreshGoogleAccessToken({
      refreshToken,
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    });

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(BUCKET)
      .download(job.video_path);

    if (downloadError || !fileBlob) {
      throw new Error(downloadError?.message || "Failed to download video from storage");
    }

    const videoBytes = new Uint8Array(await fileBlob.arrayBuffer());
    const mimeType = fileBlob.type || "video/mp4";

    const youtubeVideo = await uploadToYoutube({
      accessToken,
      videoBytes,
      mimeType,
      title: job.title || "Scheduled video",
      description: job.description || "",
      privacyStatus: job.privacy_status || "private",
    });

    const { error: updateError } = await supabase
      .from("scheduled_posts")
      .update({
        status: "uploaded",
        youtube_video_id: youtubeVideo.id,
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        upload_error: null,
      })
      .eq("id", job.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return { id: job.id, status: "uploaded", youtube_video_id: youtubeVideo.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    await supabase
      .from("scheduled_posts")
      .update({
        status: "failed",
        upload_error: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    return { id: job.id, status: "failed", error: message };
  }
}

async function refreshGoogleAccessToken(input: {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}) {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      refresh_token: input.refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(`Google token refresh failed: ${JSON.stringify(data)}`);
  }

  return data.access_token as string;
}

async function uploadToYoutube(input: {
  accessToken: string;
  videoBytes: Uint8Array;
  mimeType: string;
  title: string;
  description: string;
  privacyStatus: string;
}) {
  const boundary = `risoca_boundary_${crypto.randomUUID()}`;
  const metadata = {
    snippet: {
      title: input.title.slice(0, 100),
      description: input.description.slice(0, 5000),
      categoryId: "22",
    },
    status: {
      privacyStatus: input.privacyStatus || "private",
      selfDeclaredMadeForKids: false,
    },
  };

  const encoder = new TextEncoder();
  const start = encoder.encode(
    `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      `${JSON.stringify(metadata)}\r\n` +
      `--${boundary}\r\n` +
      `Content-Type: ${input.mimeType}\r\n\r\n`
  );
  const end = encoder.encode(`\r\n--${boundary}--\r\n`);
  const body = concatUint8Arrays([start, input.videoBytes, end]);

  const response = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`YouTube upload failed: ${JSON.stringify(data)}`);
  }

  return data;
}

function concatUint8Arrays(parts: Uint8Array[]) {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
