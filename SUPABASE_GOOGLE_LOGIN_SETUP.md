# Supabase Google Login Setup

## 1. Enable Google provider

Go to:

```txt
Supabase Dashboard → Authentication → Providers → Google
```

Enable Google and add your Google OAuth credentials.

## 2. Set Site URL

Go to:

```txt
Authentication → URL Configuration
```

Set:

```txt
Site URL: https://socmed-beta.vercel.app
```

Add Redirect URLs:

```txt
http://localhost:5173/**
https://socmed-beta.vercel.app/**
```

## 3. Vercel environment variables

```env
VITE_SUPABASE_URL=https://oiqqdanhxmmckwpruedg.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 4. Important next step

This login gate protects the app UI.

For true multi-user social automation, the next backend step is adding `user_id` to:

- `social_accounts`
- `scheduled_posts`
- `meta_pages`

Then every OAuth callback and upload worker must save/query records for the current user.
