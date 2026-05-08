# YouTube Auto Upload Test Setup

This build schedules YouTube uploads through Supabase Storage + `scheduled_posts` + a Supabase Edge Function worker.

## 1. Frontend `.env`

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://oiqqdanhxmmckwpruedg.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 2. Supabase secrets

Set your production app URL:

```powershell
npx supabase secrets set APP_URL="https://socmed-beta.vercel.app"
```

Optional worker secret:

```powershell
npx supabase secrets set PROCESS_UPLOAD_SECRET="change-this-secret"
```

If you set `PROCESS_UPLOAD_SECRET`, every call to `process-scheduled-uploads` must include header:

```txt
x-cron-secret: change-this-secret
```

## 3. Deploy Edge Functions

```powershell
npx supabase functions deploy youtube-auth-start --no-verify-jwt
npx supabase functions deploy youtube-auth-callback --no-verify-jwt
npx supabase functions deploy platform-connections-status --no-verify-jwt
npx supabase functions deploy platform-disconnect --no-verify-jwt
npx supabase functions deploy process-scheduled-uploads --no-verify-jwt
```

## 4. Test manually

1. Connect YouTube from `/connections`.
2. Go to Scheduler.
3. Select YouTube.
4. Upload a small MP4, ideally under 50 MB for first test.
5. Set schedule time to a few minutes from now.
6. Save schedule.
7. After schedule time passes, open:

```txt
https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads
```

Expected result:

```json
{
  "processed": 1,
  "results": [
    {
      "status": "uploaded"
    }
  ]
}
```

## 5. Enable automatic processing with Supabase Cron

Run this in Supabase SQL Editor if you did not set `PROCESS_UPLOAD_SECRET`:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'process-youtube-scheduled-uploads',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads',
    headers := '{"Content-Type":"application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

If you set `PROCESS_UPLOAD_SECRET`, use this instead and replace the secret:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'process-youtube-scheduled-uploads',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := 'https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads',
    headers := '{"Content-Type":"application/json","x-cron-secret":"change-this-secret"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

## 6. Check scheduled upload rows

```sql
select id, platform, title, scheduled_at, status, youtube_video_id, upload_error, uploaded_at
from public.scheduled_posts
order by created_at desc;
```

## Notes

- Default privacy is `private`.
- The worker processes up to 3 due uploads per run.
- The first implementation uses YouTube multipart upload, which is best for small test videos. For large production files, switch to YouTube resumable upload.
