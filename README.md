A clean Buffer-style scheduler prototype focused on simple account connections and automatic YouTube uploads.

## Current working flow

1. Connect YouTube from **Connections**.
2. Upload video files from **Scheduler**.
3. The app saves files to Supabase Storage bucket `post-media`.
4. The app creates rows in `scheduled_posts`.
5. The Supabase Edge Function `process-scheduled-uploads` uploads due videos to YouTube.

## Local setup

Create `.env` in the project root:

```env
VITE_SUPABASE_URL=https://oiqqdanhxmmckwpruedg.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Install and run:

```powershell
npm install
npm run dev
```

```powershell
npx supabase functions deploy youtube-auth-start --no-verify-jwt
npx supabase functions deploy youtube-auth-callback --no-verify-jwt
npx supabase functions deploy platform-connections-status --no-verify-jwt
npx supabase functions deploy platform-disconnect --no-verify-jwt
npx supabase functions deploy process-scheduled-uploads --no-verify-jwt
```


```txt
https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/process-scheduled-uploads
```

## Notes

Facebook, Instagram, and TikTok buttons are intentionally simple placeholders until their OAuth app credentials, scopes, and platform approvals are configured.
