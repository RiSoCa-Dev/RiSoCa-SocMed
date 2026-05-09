/// <reference lib="deno.ns" />

Deno.serve(async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      message:
        "YouTube scheduling now uploads directly to YouTube with publishAt. This worker is reserved for Facebook/Instagram/TikTok later.",
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});