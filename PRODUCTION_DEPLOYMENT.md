# Production Deployment Checklist

## Issue: OAuth redirecting to localhost after Google login

### Root Cause
The app is redirecting to `localhost:3000` after authentication because:
1. `NEXT_PUBLIC_APP_URL` environment variable points to localhost
2. Supabase redirect URLs may not include production URL
3. Google OAuth may not have production callback configured

---

## ✅ Fix Steps

### 1. Update Vercel Environment Variables

Go to: https://vercel.com/your-project/settings/environment-variables

Add/Update:
```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Important**: Redeploy after adding environment variables!

---

### 2. Update Supabase Redirect URLs

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/url-configuration

#### Site URL
Set to: `https://your-app.vercel.app`

#### Redirect URLs
Add both (keep localhost for development):
```
https://your-app.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

---

### 3. Configure Google OAuth Credentials

Go to: https://console.cloud.google.com/apis/credentials

Find your OAuth 2.0 Client ID and add:

#### Authorized JavaScript origins
```
https://your-app.vercel.app
https://YOUR_PROJECT_REF.supabase.co
```

#### Authorized redirect URIs
```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

---

### 4. Verify Supabase Google Provider Settings

Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/auth/providers

Check Google provider is enabled with:
- ✅ Client ID configured
- ✅ Client Secret configured
- ✅ Authorized Redirect URI matches Google Console

---

### 5. Redeploy Application

After making all changes:

```bash
# Commit any local changes
git add .
git commit -m "Fix production OAuth redirect URLs"
git push origin main

# Or trigger manual redeploy in Vercel dashboard
```

---

## Testing After Deployment

### Test Flow
1. Visit: https://goals-woad.vercel.app
2. Click "Sign in with Google"
3. Complete Google authentication
4. Verify redirect to: `https://goals-woad.vercel.app/dashboard` (NOT localhost)

### Debug if still failing
Check browser console for errors:
- Open DevTools (F12)
- Go to Console tab
- Look for CORS or redirect errors

Check Supabase Auth logs:
- Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/logs/explorer
- Filter by: `auth` logs
- Look for failed authentication attempts

---

## Environment Variable Reference

### Development (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Production (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

**Note**: Do NOT include `VAPID_PRIVATE_KEY` or `VAPID_SUBJECT` in Next.js environment variables - these are only for Edge Functions.

---

## Additional Configuration

### Custom Domain (Optional)
If you want to use a custom domain like `goals.app`:

1. **Add domain in Vercel**:
   - Go to: https://vercel.com/your-project/settings/domains
   - Add your custom domain
   - Configure DNS records as shown

2. **Update all URLs above**:
   - Replace `https://your-app.vercel.app` with `https://yourdomain.com`
   - Update Vercel environment variables
   - Update Supabase redirect URLs
   - Update Google OAuth credentials

---

## Troubleshooting

### Issue: Still redirects to localhost
- Clear browser cache and cookies
- Verify Vercel environment variables are set
- Check deployment logs in Vercel
- Redeploy the application

### Issue: "Invalid redirect URL" error
- Double-check Supabase redirect URLs include production URL
- Verify exact match (no trailing slashes)
- Check URL format: `https://` not `http://`

### Issue: Google OAuth error
- Verify Google Console has correct redirect URIs
- Check OAuth consent screen is published
- Ensure Supabase callback URL is added to Google

### Issue: CORS errors
- Check Supabase CORS settings allow your domain
- Verify API keys are correct in Vercel
- Check browser DevTools Network tab for blocked requests

---

## Quick Fix Commands

### Check current environment (locally)
```powershell
$env:NEXT_PUBLIC_APP_URL
```

### View Vercel environment variables
```bash
vercel env ls
```

### Add environment variable via CLI
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Then enter: https://goals-woad.vercel.app
```

### Trigger Vercel redeploy via CLI
```bash
vercel --prod
```

---

## Success Criteria

After completing all steps, you should have:
- ✅ Production app URL in Vercel environment variables
- ✅ Both localhost and production URLs in Supabase redirect URLs
- ✅ Supabase callback in Google OAuth authorized redirect URIs
- ✅ Successful login redirects to production domain
- ✅ No console errors or CORS issues

---

## Support Resources

- Vercel Docs: https://vercel.com/docs/environment-variables
- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Google OAuth Setup: https://support.google.com/cloud/answer/6158849

---

Last Updated: 2025-12-26
Project: Goals Tracker
