# Fix HTTP 431 Error (Request Header Fields Too Large)

## 🚨 IMMEDIATE FIX - Use the Cookie Clearer Page

**If you're currently experiencing the HTTP 431 error, visit this page:**
- Navigate to: `/clear-cookies` (e.g., `http://localhost:3000/clear-cookies`)
- This will automatically clear all cookies and redirect you to login

## Quick Fix Steps

### Step 1: Use the Cookie Clearer (Easiest)
1. **Navigate to `/clear-cookies`** in your browser
2. The page will automatically clear all cookies
3. You'll be redirected to the login page

### Step 2: Clear Browser Cookies (Manual)
1. **Open your browser's Developer Tools** (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Cookies** → your domain
4. **Delete all cookies** (especially ones starting with `sb-` or `supabase-`)
5. **Refresh the page**

### Step 3: Clear All Site Data (Alternative)
1. Press **Ctrl+Shift+Delete** (or **Cmd+Shift+Delete** on Mac)
2. Select **Cookies and other site data**
3. Choose **All time**
4. Click **Clear data**
5. Refresh the page

### Step 4: Try Incognito/Private Mode
- Open an **incognito/private window**
- Navigate to your site
- Try logging in again

### Step 5: Check Server Configuration

If you're using a reverse proxy (nginx, Apache, etc.), you may need to increase the header size limit:

**For Nginx:**
```nginx
http {
    large_client_header_buffers 4 16k;
    client_header_buffer_size 4k;
}
```

**For Next.js in production:**
The middleware has been updated to limit cookie sizes, but if you're still getting errors, you may need to configure your hosting provider.

## What Caused This?

HTTP 431 happens when:
- Too many cookies are being set
- Individual cookies are too large (>4KB)
- Total header size exceeds server limits (usually 8-16KB)

Supabase auth can create multiple cookies, and if they get too large or numerous, you'll hit this limit.

## Prevention

The middleware has been updated to:
- Limit cookie values to 4KB max
- Limit total number of cookies
- Better cookie management

## Still Having Issues?

1. **Check cookie count:** Open DevTools → Application → Cookies and count how many there are
2. **Check cookie sizes:** Look for any cookies >4KB
3. **Clear session storage:** Also clear localStorage and sessionStorage in DevTools
4. **Try a different browser:** To rule out browser-specific issues

If the problem persists after clearing cookies, the middleware changes should help prevent it from happening again.

