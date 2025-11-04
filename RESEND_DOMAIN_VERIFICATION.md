# Resend Domain Verification Guide

## 🔴 Current Issue

**Error Message**: "You can only send testing emails to your own email address"

**Problem**: Resend's test domain (`onboarding@resend.dev`) only allows sending emails to the account owner's email address (`elsablankson5252@gmail.com`). To send to other recipients, you need to verify a domain.

## ✅ Solution: Verify Your Domain

### Step 1: Get a Domain (if you don't have one)

**Option A: Use Existing Domain**
- If you already have a domain (e.g., `yourcompany.com`), use that

**Option B: Buy a Domain**
- **Namecheap**: https://www.namecheap.com ($8-15/year)
- **Google Domains**: https://domains.google ($12/year)
- **Cloudflare**: https://www.cloudflare.com/products/registrar ($9/year)

### Step 2: Add Domain to Resend

1. **Login to Resend**: https://resend.com
2. **Go to Domains**: Click "Domains" in the sidebar
3. **Add Domain**: Click "Add Domain"
4. **Enter Domain**: Enter your domain (e.g., `yourdomain.com`)
5. **Copy DNS Records**: Resend will provide DNS records to add

### Step 3: Add DNS Records

Go to your domain registrar (where you bought the domain) and add these DNS records:

**Example DNS Records** (Resend will provide exact values):
```
Type: TXT
Name: @
Value: [Resend provided value]

Type: MX
Name: @
Value: [Resend provided value]

Type: CNAME
Name: [Resend provided value]
Value: [Resend provided value]
```

**Where to add DNS records**:
- **Namecheap**: Domain List → Manage → Advanced DNS
- **Google Domains**: DNS → Custom records
- **Cloudflare**: DNS → Records

### Step 4: Verify Domain

1. **Wait 5-10 minutes** for DNS propagation
2. **Go back to Resend**: Domains → Your Domain
3. **Click "Verify"**: Resend will check DNS records
4. **Status**: Should show "Verified" ✅

### Step 5: Update Environment Variables

**In Vercel**:
1. Go to **Settings** → **Environment Variables**
2. Update `FROM_EMAIL` to: `noreply@yourdomain.com` (or `noreply@yourdomain.com`)
3. **Redeploy** your application

**In `.env.local`** (for local development):
```env
FROM_EMAIL=noreply@yourdomain.com
```

### Step 6: Test

After redeploying:
1. Process a password reset request
2. Check if email is sent successfully
3. Verify email arrives in recipient's inbox

## 🚀 Quick Setup (5 minutes)

If you already have a domain:

1. **Add domain to Resend** (2 min)
2. **Add DNS records** (2 min)
3. **Verify domain** (1 min)
4. **Update FROM_EMAIL** in Vercel (1 min)
5. **Redeploy** (automatic)

## ⚠️ Temporary Workaround

Until you verify a domain, you can:

1. **Manually send passwords** - The admin interface will show the password when email fails
2. **Use account email** - Test with `elsablankson5252@gmail.com` only
3. **Use Supabase Edge Function** - Set up the Edge Function which may have different rules

## 📋 DNS Record Example

Here's what Resend typically requires:

```
TXT Record:
Name: @
Value: "v=spf1 include:resend.com ~all"

MX Record:
Name: @
Value: feedback-smtp.resend.com (Priority: 10)

CNAME Record:
Name: resend._domainkey
Value: [Resend provided value]
```

**Note**: Exact values will be provided by Resend when you add the domain.

## ✅ Verification Checklist

- [ ] Domain added to Resend
- [ ] DNS records added to domain registrar
- [ ] Domain verified in Resend dashboard
- [ ] `FROM_EMAIL` updated in Vercel
- [ ] Application redeployed
- [ ] Test email sent successfully

## 🆘 Troubleshooting

### Domain Not Verifying?
- **Wait longer**: DNS propagation can take up to 24 hours (usually 5-10 minutes)
- **Check DNS**: Use https://dnschecker.org to verify DNS records are propagated
- **Check Records**: Ensure all DNS records match exactly what Resend provided

### Emails Still Not Sending?
- **Check FROM_EMAIL**: Must match verified domain
- **Check Vercel**: Ensure environment variable is updated
- **Redeploy**: Vercel may need a redeploy to pick up new env vars

### Need Help?
- **Resend Docs**: https://resend.com/docs/dashboard/domains/introduction
- **Resend Support**: support@resend.com
- **Check Resend Dashboard**: Look for any error messages

## 📚 Additional Resources

- **Resend Domain Verification**: https://resend.com/docs/dashboard/domains/introduction
- **DNS Propagation Checker**: https://dnschecker.org
- **Resend Pricing**: https://resend.com/pricing (Free tier: 3,000 emails/month)

