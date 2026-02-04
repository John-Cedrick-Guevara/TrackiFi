# TrackiFi Deployment Guide

## 🚀 Production Deployment Instructions

This guide covers deploying the **TrackiFi** application to production with proper SPA routing and session persistence.

---

## 📋 Pre-Deployment Checklist

### ✅ Session Persistence (Already Configured)

- ✓ Supabase client configured with `persistSession: true`
- ✓ Auto token refresh enabled with `autoRefreshToken: true`
- ✓ Auth state properly restored on app load
- ✓ Loading state fixed to prevent premature redirects

### ✅ Production Routing (Configured)

- ✓ SPA fallback routing configured for Vercel
- ✓ Security headers added
- ✓ Service Worker cache control configured

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend Hosting)

**Why Vercel?**

- Zero-config for Vite apps
- Automatic HTTPS
- Global CDN
- Built-in analytics

**Steps:**

1. Install Vercel CLI (if not already installed):

   ```bash
   npm i -g vercel
   ```

2. Navigate to the client directory:

   ```bash
   cd client
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

**Configuration:** `vercel.json` is already configured with:

- SPA fallback routing (all routes → `index.html`)
- Security headers
- Service Worker cache control

---

### Option 2: Cloudflare (Backend Hosting)

**Why Cloudflare Workers?**

- Edge-first performance
- Seamless integration with your codebase
- Scale to zero costs

**Steps:**

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Deploy via Wrangler:
   ```bash
   npx wrangler deploy
   ```

**Configuration:** `wrangler.toml` is already configured for the Hono backend.

---

## 🔐 Environment Variables

### Required Environment Variables

Create a `.env.production` file in the `client/` directory:

```env
VITE_SUPABASE_URL=https://jkyygbfqgjqqueshgrqd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**For Vercel/Cloudflare:**
Set these in the platform's dashboard under **Environment Variables**

---

## 🧪 Testing Your Deployment

After deployment, test these scenarios:

### 1. Session Persistence Test

1. ✅ Sign in to the application
2. ✅ Close the browser completely
3. ✅ Reopen the browser and navigate to your deployed URL
4. ✅ **Expected:** You should still be logged in

### 2. Direct Route Navigation Test

1. ✅ Navigate to `/dashboard` directly in the URL bar
2. ✅ **Expected:** Page loads correctly (no 404)
3. ✅ Refresh the page
4. ✅ **Expected:** Page stays on `/dashboard` (no 404)
5. ✅ Repeat for `/analytics` and other routes

### 3. Deep Link Test (Critical)

1. ✅ Copy a deep link like `https://your-trackifi-app.vercel.app/dashboard`
2. ✅ Paste it in a new browser tab
3. ✅ **Expected:** Page loads directly (no 404)

---

## 🐛 Troubleshooting

### Problem: Still getting 404 on refresh

**Solution:**

- **Vercel:** Make sure `vercel.json` exists in the `client/` directory.

### Problem: Session expires on browser close

**Solution:**
Already fixed in `client/src/providers.tsx`:

- `persistSession: true`
- `autoRefreshToken: true`
- `storage: window.localStorage`

If issue persists, check:

1. Browser is not set to clear site data on exit
2. No browser extensions blocking localStorage
3. Check browser console for errors

### Problem: Service Worker caching old version

**Solution:**

```javascript
// In browser console
navigator.serviceWorker.getRegistrations().then(function (registrations) {
  for (let registration of registrations) {
    registration.unregister();
  }
});
```

Then hard refresh: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)

---

## 📊 Post-Deployment Checklist

- [ ] All routes accessible (no 404s)
- [ ] Session persists across browser restarts
- [ ] Auth tokens refresh automatically
- [ ] HTTPS enabled
- [ ] Service Worker loads correctly
- [ ] PWA installable
- [ ] Security headers present (check with [securityheaders.com](https://securityheaders.com))
- [ ] Performance is acceptable (check with Lighthouse)

---

## 🔄 Continuous Deployment

### Automated Deployments

For automatic deployments on Git push:

**Vercel:**

1. Connect your GitHub/GitLab repository in the Vercel dashboard
2. Select `client` as the root directory
3. Deployments will happen automatically on push to `main`

**Cloudflare Workers:**

1. Use GitHub Actions to deploy on push to `main` (if configured)
2. Or run `npx wrangler deploy` manually after changes

3. Build output directory: `client/dist`

---

## 📝 Important Notes

### Session Token Lifetime

- **Access tokens** expire after 1 hour (Supabase default)
- **Refresh tokens** are used to automatically get new access tokens
- The app now handles token refresh **automatically** in the background
- Users stay logged in as long as the refresh token is valid

### To extend token lifetime in Supabase:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **Settings**
3. Adjust **JWT expiry** (default: 3600 seconds = 1 hour)
4. Consider increasing to 7200-86400 seconds for better UX

**Security Note:** Longer token lifetimes are acceptable when combined with:

- ✅ Auto token refresh (implemented)
- ✅ Secure storage (localStorage)
- ✅ HTTPS in production
- ✅ Proper CORS configuration

---

## 🎯 Summary

### What We Fixed:

1. **Session Persistence:**
   - Configured Supabase to persist sessions in localStorage
   - Enabled automatic token refresh
   - Fixed auth state restoration on app load

2. **Production 404 Errors:**
   - Created configuration files for all major hosting platforms
   - Implemented SPA fallback routing (all routes → index.html)
   - Added security headers
   - Configured proper caching strategies

### Architecture:

```
Browser
  ↓
TrackiFi Client (Vite SPA)
  ↓ (Supabase Auth)
  ↓
Hono API (Cloudflare Workers)
  ↓
Supabase (PostgreSQL + Auth)
```

### Client Deployment: Choose one of:

- Vercel (easiest)
- Netlify
- Cloudflare Pages (best if using Workers)
- Traditional server (Apache/Nginx)

### Backend Deployment:

- Already configured for Cloudflare Workers via `wrangler.toml`
- Deploy with: `pnpm run deploy` (from root directory)

---

**Questions? Issues?**
Check the troubleshooting section or review the platform-specific documentation.
