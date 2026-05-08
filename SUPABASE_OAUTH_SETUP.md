# Supabase OAuth Platform Connections

This version removes manual platform API inputs from the UI. Users connect accounts through OAuth buttons.

## 1. Frontend env in Vercel / .env.local

Only expose frontend-safe values:

```env
VITE_SUPABASE_URL=https://oiqqdanhxmmckwpruedg.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

## 2. Supabase Edge Function secrets

```powershell
npx supabase secrets set GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
npx supabase secrets set GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
npx supabase secrets set APP_URL="http://localhost:5173"
```

For Vercel production, replace APP_URL with your real Vercel URL.

## 3. Apply database migration

In Supabase SQL Editor, run:

```sql
create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_accounts enable row level security;
```

No public policies are needed. Edge Functions use the service role secret.

## 4. Deploy functions

```powershell
npx supabase functions deploy youtube-auth-start --no-verify-jwt
npx supabase functions deploy youtube-auth-callback --no-verify-jwt
npx supabase functions deploy platform-connections-status --no-verify-jwt
npx supabase functions deploy platform-disconnect --no-verify-jwt
```

## 5. Google Cloud redirect URI

Add this authorized redirect URI to your OAuth web client:

```txt
https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/youtube-auth-callback
```

## 6. Test

Run the frontend:

```powershell
npm install
npm run dev
```

Open Platform Connections and click **Connect YouTube**.

After OAuth succeeds, the callback saves the token in `social_accounts`.

## Current platform status

- YouTube: OAuth connect implemented
- Facebook: UI placeholder only; requires Meta OAuth function and permissions
- Instagram: UI placeholder only; requires Meta OAuth and Business/Creator account
- TikTok: UI placeholder only; requires TikTok Content Posting API approval
