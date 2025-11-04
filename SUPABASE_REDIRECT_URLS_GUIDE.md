# Supabase Redirect URLs Configuration for Vercel

This guide explains how to configure Supabase redirect URLs to work with Vercel deployments (both default and custom domains).

## 🎯 Why This Matters

Supabase requires you to whitelist redirect URLs for security. Without proper configuration, users will get redirect errors when:
- Logging in
- Resetting passwords
- Using OAuth providers
- Using magic links

---

## 📋 Step-by-Step Configuration

### Step 1: Access Supabase Dashboard

1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project: `rlrwmxmzncqhapfizxcy`

### Step 2: Navigate to URL Configuration

1. Click **Authentication** in the sidebar
2. Click **URL Configuration** tab
3. You'll see two sections:
   - **Site URL** (single URL)
   - **Redirect URLs** (whitelist of allowed URLs)

### Step 3: Configure Site URL

Set the **Site URL** to your production domain:

**For Vercel Default Domain:**
```
https://smart-global-operations-platform.vercel.app
```

**For Custom Domain:**
```
https://yourdomain.com
```

**Note:** This should be your primary production URL.

### Step 4: Add Redirect URLs

Add these URLs to the **Redirect URLs** list (one per line):

#### Production URLs
```
https://smart-global-operations-platform.vercel.app/**
https://smart-global-operations-platform.vercel.app/auth/callback
https://smart-global-operations-platform.vercel.app/auth/reset-password
```

#### Custom Domain URLs (if using)
```
https://yourdomain.com/**
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

#### Preview Deployment URLs (Optional)
```
https://*.vercel.app/**
```

**Note:** The `**` wildcard allows all paths under that domain.

#### Local Development URLs
```
http://localhost:3000/**
http://localhost:3000/auth/callback
http://localhost:3000/auth/reset-password
```

### Step 5: Save Configuration

1. Click **"Save"** at the bottom
2. Changes take effect immediately (no deployment needed)

---

## 🔍 Complete Redirect URL List

Copy and paste this complete list into Supabase:

```
# Production - Vercel Default Domain
https://smart-global-operations-platform.vercel.app/**
https://smart-global-operations-platform.vercel.app/auth/callback
https://smart-global-operations-platform.vercel.app/auth/reset-password
https://smart-global-operations-platform.vercel.app/auth/login

# Custom Domain (if using - replace with your domain)
https://yourdomain.com/**
https://www.yourdomain.com/**

# Preview Deployments (wildcard for all preview URLs)
https://*.vercel.app/**

# Local Development
http://localhost:3000/**
http://127.0.0.1:3000/**
```

---

## 🎯 URL Patterns Explained

### Wildcard Pattern (`**`)

The `**` wildcard matches:
- All paths under the domain
- All subdomains (if used)
- Future paths you add

**Example:**
```
https://yourdomain.com/**
```

Matches:
- ✅ `https://yourdomain.com/auth/callback`
- ✅ `https://yourdomain.com/auth/reset-password?token=...`
- ✅ `https://yourdomain.com/dashboard`
- ✅ `https://yourdomain.com/any/future/path`

### Specific Paths

You can also specify exact paths:

```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

**Use when:** You want stricter security (only allow specific paths)

---

## 🔐 Security Best Practices

1. **Use Wildcards Sparingly**
   - `**` allows all paths - use only for trusted domains
   - Prefer specific paths for custom domains

2. **Remove Old URLs**
   - Remove URLs for domains you no longer use
   - Keep only active domains

3. **Separate Dev/Prod**
   - Use different Supabase projects for dev/prod (optional)
   - Or use wildcards carefully

4. **Monitor Redirect Errors**
   - Check Supabase logs for redirect failures
   - Update URLs if you see errors

---

## 🌐 Handling Multiple Domains

### Scenario 1: Default + Custom Domain

If you use both Vercel default domain and custom domain:

```
Site URL: https://yourdomain.com

Redirect URLs:
https://yourdomain.com/**
https://smart-global-operations-platform.vercel.app/**
```

### Scenario 2: Preview Deployments

For preview deployments (branch deployments):

```
Site URL: https://yourdomain.com

Redirect URLs:
https://yourdomain.com/**
https://*.vercel.app/**
```

This allows all preview URLs automatically.

### Scenario 3: Multiple Custom Domains

If you have multiple domains:

```
Site URL: https://primary-domain.com

Redirect URLs:
https://primary-domain.com/**
https://secondary-domain.com/**
https://www.primary-domain.com/**
```

---

## 🔧 Updating Email Templates

If you use Supabase email templates (magic links, password reset), update them:

### Step 1: Go to Email Templates

1. Authentication → **Email Templates**
2. Select template (e.g., "Magic Link", "Reset Password")

### Step 2: Update Redirect URLs

Use relative URLs in templates:

**Before:**
```
https://yourdomain.com/auth/reset-password?token={{ .Token }}
```

**After (Recommended):**
```
/auth/reset-password?token={{ .Token }}
```

**Why?** Relative URLs work with any domain, so you don't need to update templates when adding new domains.

---

## 🧪 Testing Redirect URLs

### Test 1: Login Flow

1. Go to your app login page
2. Enter credentials and login
3. Should redirect to dashboard (no errors)

### Test 2: Password Reset

1. Request password reset
2. Click link in email
3. Should redirect to reset page (no errors)

### Test 3: OAuth (if enabled)

1. Click "Sign in with Google/GitHub/etc"
2. Complete OAuth flow
3. Should redirect back to app (no errors)

### Test 4: Preview Deployment

1. Create a preview deployment
2. Test login flow
3. Should work if wildcard `*.vercel.app` is configured

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** Redirect URL not in whitelist

**Solution:**
1. Check the exact URL in the error message
2. Add it to Supabase redirect URLs
3. Include wildcard pattern if needed

### Error: Redirects to Wrong Domain

**Problem:** After login, user redirected to wrong URL

**Solution:**
1. Check Site URL in Supabase
2. Verify middleware redirect logic
3. Check `NEXT_PUBLIC_APP_URL` environment variable

### Preview Deployments Not Working

**Problem:** Preview deployments show redirect errors

**Solution:**
1. Add wildcard: `https://*.vercel.app/**`
2. Or add specific preview URL manually
3. Check Vercel deployment URL matches pattern

### Local Development Not Working

**Problem:** Localhost redirects failing

**Solution:**
1. Add `http://localhost:3000/**` to redirect URLs
2. Check Site URL isn't set to production only
3. Verify middleware allows localhost

---

## 📝 Quick Reference

### Minimal Configuration (Production Only)

```
Site URL: https://smart-global-operations-platform.vercel.app

Redirect URLs:
https://smart-global-operations-platform.vercel.app/**
```

### Recommended Configuration (With Previews)

```
Site URL: https://smart-global-operations-platform.vercel.app

Redirect URLs:
https://smart-global-operations-platform.vercel.app/**
https://*.vercel.app/**
http://localhost:3000/**
```

### Production + Custom Domain

```
Site URL: https://yourdomain.com

Redirect URLs:
https://yourdomain.com/**
https://smart-global-operations-platform.vercel.app/**
```

---

## ✅ Verification Checklist

After configuration:

- [ ] Site URL set to production domain
- [ ] Production redirect URLs added
- [ ] Preview URLs added (if using preview deployments)
- [ ] Localhost URLs added (for development)
- [ ] Custom domain URLs added (if using)
- [ ] Email templates use relative URLs
- [ ] Tested login flow
- [ ] Tested password reset flow
- [ ] Tested preview deployment (if applicable)
- [ ] No redirect errors in logs

---

## 📚 Related Documentation

- **Vercel Deployment:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Password Reset:** `PASSWORD_RESET_IMPLEMENTATION.md`

---

**Need Help?** Check Supabase logs in dashboard → Logs → Auth Logs for specific redirect errors.

