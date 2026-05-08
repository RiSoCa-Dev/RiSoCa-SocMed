# Meta / Facebook / Instagram Setup

## Run SQL

Run `supabase/migrations/20260508_meta_accounts.sql` in Supabase SQL Editor.

## Deploy Edge Functions

```powershell
npx supabase functions deploy meta-auth-start --no-verify-jwt
npx supabase functions deploy meta-auth-callback --no-verify-jwt
npx supabase functions deploy platform-connections-status --no-verify-jwt
npx supabase functions deploy platform-disconnect --no-verify-jwt
```

## Meta Redirect URI

Add this in Meta Facebook Login settings:

```txt
https://oiqqdanhxmmckwpruedg.supabase.co/functions/v1/meta-auth-callback
```

## Notes

- Facebook publishing works through Facebook Pages.
- Instagram publishing requires an Instagram Business/Creator account linked to a Facebook Page.
- While the Meta app is unpublished, only admins/developers/testers can connect.
