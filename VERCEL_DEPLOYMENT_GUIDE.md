# Vercel Deployment Guide

Complete guide for deploying your application to Vercel, including configuration for Vercel's default domain and custom domains.

## 🚀 Quick Start

### 1. Connect Your Repository to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository (GitHub, GitLab, or Bitbucket)
4. Vercel will auto-detect Next.js settings

### 2. Configure Environment Variables

In your Vercel project dashboard, go to **Settings** → **Environment Variables** and add:

#### Required Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rlrwmxmzncqhapfizxcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Email Service (Resend)
RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
FROM_EMAIL=onboarding@resend.dev

# Application URL (Auto-detected by Vercel - see below)
```

#### ⚠️ Important: Application URL Configuration

**Option 1: Auto-Detection (Recommended)**
- **Don't set** `NEXT_PUBLIC_APP_URL` in Vercel
- The app will automatically detect the URL from Vercel's environment variables
- Works with both default Vercel domain and custom domains
- Supports preview deployments automatically

**Option 2: Manual Configuration**
If you want to set it explicitly:

```env
# For default Vercel domain
NEXT_PUBLIC_APP_URL=https://your-project-name.vercel.app

# For custom domain (after setup)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Deploy

1. Click **"Deploy"**
2. Wait for build to complete
3. Your app will be live at `https://your-project-name.vercel.app`

---

## 🔧 How URL Detection Works

The app uses a smart URL detection system that works automatically:

### Priority Order (Highest to Lowest):

1. **`NEXT_PUBLIC_APP_URL`** - Explicitly set URL (if configured)
2. **`VERCEL_URL`** - Vercel's automatic environment variable (preview/production)
3. **Request Headers** - Extracted from `x-forwarded-proto` and `host`
4. **Fallback** - Default URL based on environment

### Supported Environments:

- ✅ **Production** - Uses production Vercel URL
- ✅ **Preview Deployments** - Automatically uses preview URL
- ✅ **Custom Domains** - Automatically detected when configured
- ✅ **Local Development** - Falls back to `http://localhost:3000`

---

## 🌐 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to your project → **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions

### Step 2: Configure DNS

Add these DNS records to your domain provider:

**For Root Domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For Subdomain (www.yourdomain.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Update Environment Variables (Optional)

If you want to force a specific domain:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Note:** This is optional - the app will auto-detect your custom domain.

### Step 4: Wait for Propagation

- DNS changes can take 24-48 hours (usually much faster)
- Vercel will automatically provision SSL certificates
- Check domain status in Vercel dashboard

---

## 📧 Email Service Configuration

### Using Resend with Vercel Default Domain

**Problem:** Resend requires domain verification, but Vercel's default domain (`*.vercel.app`) cannot be verified.

**Solutions:**

#### Solution 1: Use Resend Test Domain (Development)

✅ **Works immediately** - No verification needed
- `FROM_EMAIL=onboarding@resend.dev`
- Can only send to your Resend account email
- Good for testing and development

#### Solution 2: Verify Your Custom Domain (Production)

If you have a custom domain:

1. **Add domain to Resend:**
   - Go to [resend.com/domains](https://resend.com/domains)
   - Click **"Add Domain"**
   - Enter your domain (e.g., `yourdomain.com`)

2. **Add DNS Records:**
   Resend will provide DNS records to add:
   ```
   Type: TXT
   Name: @
   Value: resend-domain-verification=...
   
   Type: SPF
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   
   Type: DKIM
   Name: resend._domainkey
   Value: ...
   ```

3. **Update Environment Variable:**
   ```env
   FROM_EMAIL=noreply@yourdomain.com
   ```

4. **Wait for Verification** (usually 5-10 minutes)

#### Solution 3: Use Alternative Email Service

See `EMAIL_SERVICE_OPTIONS.md` for alternatives that don't require domain verification:
- SendWith (Gmail integration)
- AWS SES (with email verification)
- Other services

---

## 🔐 Supabase Redirect URLs Configuration

### Step 1: Add Redirect URLs in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add these URLs to **Redirect URLs**:

```
# Production
https://your-project-name.vercel.app/**
https://yourdomain.com/**

# Preview/Development (optional)
https://*.vercel.app/**

# Local development
http://localhost:3000/**
```

### Step 2: Add Site URL

In **Authentication** → **URL Configuration**, set:

- **Site URL:** `https://your-project-name.vercel.app`
  (or your custom domain)

### Step 3: Email Templates (Optional)

If using Supabase email templates, update redirect URLs in templates:

1. Go to **Authentication** → **Email Templates**
2. Update magic link and password reset templates
3. Use relative URLs: `/auth/reset-password?token=...`

---

## 🚀 Deployment Checklist

- [ ] Repository connected to Vercel
- [ ] All environment variables configured
- [ ] `NEXT_PUBLIC_APP_URL` NOT set (for auto-detection) OR set correctly
- [ ] Supabase redirect URLs configured
- [ ] Email service configured (Resend or alternative)
- [ ] Custom domain configured (if using)
- [ ] DNS records added (if using custom domain)
- [ ] Test deployment successful
- [ ] Test password reset email flow
- [ ] Test user creation email flow
- [ ] Verify all redirects work correctly

---

## 🔍 Troubleshooting

### URL Not Detecting Correctly

**Problem:** App uses wrong URL in emails/redirects

**Solution:**
1. Check Vercel environment variables - ensure `VERCEL_URL` is present
2. Check build logs for any errors
3. Set `NEXT_PUBLIC_APP_URL` explicitly if needed
4. Verify the URL is correct in production logs

### Email Not Sending

**Problem:** Emails fail to send after deployment

**Solutions:**
1. Check `RESEND_API_KEY` is set correctly
2. Verify `FROM_EMAIL` domain is verified (if using custom domain)
3. Check Vercel function logs for errors
4. For test domain: Ensure recipient is your Resend account email

### Supabase Redirect Errors

**Problem:** Users redirected to wrong URL after login

**Solution:**
1. Add all possible URLs to Supabase redirect URLs
2. Check Site URL in Supabase dashboard
3. Verify middleware redirect logic
4. Check browser console for errors

### Preview Deployments Not Working

**Problem:** Preview deployments have wrong URLs

**Solution:**
- The app automatically detects preview URLs via `VERCEL_URL`
- Ensure you're not overriding with `NEXT_PUBLIC_APP_URL`
- Check that preview environment variables are set

---

## 📊 Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | `eyJhbGc...` |
| `RESEND_API_KEY` | Resend API key | `re_xxx...` |
| `FROM_EMAIL` | Email sender address | `onboarding@resend.dev` |

### Optional Variables

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `NEXT_PUBLIC_APP_URL` | Explicit app URL | Only if auto-detection fails |
| `VERCEL_URL` | Auto-set by Vercel | Never set manually |
| `NODE_ENV` | Environment | Auto-set by Vercel |

### Vercel Auto-Set Variables

These are automatically set by Vercel (don't set manually):
- `VERCEL_URL` - Current deployment URL
- `VERCEL_ENV` - Environment (production, preview, development)
- `NODE_ENV` - Node environment

---

## 🎯 Best Practices

1. **Don't hardcode URLs** - Use the URL utility functions
2. **Test preview deployments** - Check that URLs work correctly
3. **Monitor function logs** - Watch for URL-related errors
4. **Use environment-specific configs** - Different settings for preview/production
5. **Keep redirect URLs updated** - Add new domains as you add them

---

## 📚 Related Documentation

- **Email Setup:** `EMAIL_SERVICE_OPTIONS.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Password Reset:** `PASSWORD_RESET_IMPLEMENTATION.md`
- **Edge Functions:** `SUPABASE_EDGE_FUNCTION_SETUP.md`

---

## ✅ Success Indicators

After deployment, verify:

1. ✅ App loads at Vercel URL
2. ✅ Login works correctly
3. ✅ Password reset emails sent with correct URLs
4. ✅ User creation emails sent with correct URLs
5. ✅ All redirects work (no wrong domain errors)
6. ✅ Custom domain works (if configured)
7. ✅ Preview deployments work correctly

---

**Need Help?** Check Vercel logs, Supabase logs, or Resend dashboard for specific error messages.

