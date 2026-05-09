/// <reference lib="deno.ns" />
import { corsHeaders, json, requireOwner } from "../_shared/ownerAuth.ts";

type PlatformPublishBody = {
  scheduledPostId: string;
  platform: "tiktok" | "x" | "linkedin" | "pinterest";
};

const platformRequirements: Record<PlatformPublishBody["platform"], string> = {
  tiktok: "TikTok Content Posting API approval plus client key/client secret.",
  x: "X OAuth 2.0 credentials plus write/media upload permissions for your API tier.",
  linkedin: "LinkedIn posting product approval and target decision: profile or organization.",
  pinterest: "Pinterest developer app credentials and a target board.",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const owner = await requireOwner(req);
  if ("error" in owner) return owner.error;

  const body = (await req.json().catch(() => null)) as PlatformPublishBody | null;

  if (!body?.scheduledPostId || !body.platform || !(body.platform in platformRequirements)) {
    return json({ error: "scheduledPostId and supported platform are required" }, 400);
  }

  const message = `Publishing for ${body.platform} is not enabled yet. Required: ${platformRequirements[body.platform]}`;

  await owner.admin.from("publish_logs").insert({
    scheduled_post_id: body.scheduledPostId,
    platform: body.platform,
    status: "needs_credentials_or_approval",
    message,
    metadata: {
      requirement: platformRequirements[body.platform],
    },
  });

  return json({
    ok: false,
    status: "needs_credentials_or_approval",
    message,
  });
});
