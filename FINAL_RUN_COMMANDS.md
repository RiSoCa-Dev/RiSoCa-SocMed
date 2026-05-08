# RiSoCa Scheduler Final Run Commands

## Local build

```powershell
npm config set registry https://registry.npmjs.org/
npm ci
npm run build
```

If npm registry breaks again:

```powershell
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
Remove-Item package-lock.json -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm cache clean --force
npm install --registry=https://registry.npmjs.org/
npm run build
```

## Local `.env`

```env
VITE_SUPABASE_URL=https://oiqqdanhxmmckwpruedg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Supabase secrets

```powershell
npx supabase login
npx supabase link --project-ref oiqqdanhxmmckwpruedg
npx supabase secrets set APP_URL="https://risoca.xyz"
npx supabase secrets set GOOGLE_CLIENT_ID="your_google_client_id"
npx supabase secrets set GOOGLE_CLIENT_SECRET="your_google_client_secret"
npx supabase secrets set META_APP_ID="your_meta_app_id"
npx supabase secrets set META_APP_SECRET="your_meta_app_secret"
```

Optional future platform secrets:

```powershell
npx supabase secrets set TIKTOK_CLIENT_KEY="your_tiktok_client_key"
npx supabase secrets set TIKTOK_CLIENT_SECRET="your_tiktok_client_secret"
npx supabase secrets set X_CLIENT_ID="your_x_client_id"
npx supabase secrets set X_CLIENT_SECRET="your_x_client_secret"
npx supabase secrets set LINKEDIN_CLIENT_ID="your_linkedin_client_id"
npx supabase secrets set LINKEDIN_CLIENT_SECRET="your_linkedin_client_secret"
npx supabase secrets set PINTEREST_CLIENT_ID="your_pinterest_client_id"
npx supabase secrets set PINTEREST_CLIENT_SECRET="your_pinterest_client_secret"
```

## Deploy functions

```powershell
npx supabase functions deploy youtube-auth-start --no-verify-jwt
npx supabase functions deploy youtube-auth-callback --no-verify-jwt
npx supabase functions deploy meta-auth-start --no-verify-jwt
npx supabase functions deploy meta-auth-callback --no-verify-jwt
npx supabase functions deploy platform-connections-status --no-verify-jwt
npx supabase functions deploy platform-disconnect --no-verify-jwt
npx supabase functions deploy process-scheduled-uploads --no-verify-jwt
npx supabase functions deploy tiktok-auth-start --no-verify-jwt
npx supabase functions deploy x-auth-start --no-verify-jwt
npx supabase functions deploy linkedin-auth-start --no-verify-jwt
npx supabase functions deploy pinterest-auth-start --no-verify-jwt
```

## Run locally

```powershell
npm run dev
```

## Push

```powershell
git add .
git commit -m "Final RiSoCa Scheduler OAuth UI build"
git push origin main
```

## Vercel settings

- Framework: Vite
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`

## Status

- YouTube: OAuth and auto-upload worker active.
- Facebook: Meta OAuth connection active; publishing worker next.
- Instagram: Meta OAuth detects linked professional accounts; publishing worker next.
- TikTok/X/LinkedIn/Pinterest: buttons and Edge Function scaffolds included; each needs developer credentials and platform approval before publishing can work.
