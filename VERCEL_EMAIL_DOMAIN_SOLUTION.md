# Email Domain Solution for Vercel Deployment

Complete guide for handling email services when deploying to Vercel without a custom domain.

## 🎯 The Challenge

**Problem:** 
- Vercel provides a default domain: `*.vercel.app`
- Email services (like Resend) require domain verification
- You cannot verify Vercel's default domain (`*.vercel.app`) with email services
- This limits email sending capabilities

## ✅ Solutions

### Solution 1: Use Resend Test Domain (Quick Start)

**Best for:** Development, testing, immediate deployment

**Pros:**
- ✅ Works immediately - no setup needed
- ✅ No domain verification required
- ✅ Free to use
- ✅ Perfect for testing

**Cons:**
- ❌ Can only send to your Resend account email
- ❌ Not suitable for production user emails
- ❌ Limited customization

**Setup:**
```env
FROM_EMAIL=onboarding@resend.dev
RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
```

**Limitation:** Emails can only be sent to the email address associated with your Resend account.

**Use Case:** Perfect for initial deployment and testing before getting a custom domain.

---

### Solution 2: Get a Custom Domain (Recommended for Production)

**Best for:** Production deployments

**Step 1: Purchase a Domain**

Popular domain registrars:
- [Namecheap](https://www.namecheap.com) - ~$10/year
- [Google Domains](https://domains.google) - ~$12/year
- [Cloudflare](https://www.cloudflare.com/products/registrar) - at-cost pricing
- [GoDaddy](https://www.godaddy.com) - various prices

**Step 2: Add Domain to Vercel**

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions

**Step 3: Configure DNS**

Add these DNS records:

**For Root Domain:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For WWW Subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Step 4: Verify Domain in Resend**

1. Go to [resend.com/domains](https://resend.com/domains)
2. Click "Add Domain"
3. Enter your domain
4. Add DNS records provided by Resend:
   ```
   Type: TXT
   Name: @
   Value: resend-domain-verification=...
   
   Type: SPF
   Name: @
   Value: v=spf1 include:_spf.resend.com ~all
   
   Type: DKIM
   Name: resend._domainkey
   Value: [provided by Resend]
   ```

**Step 5: Update Environment Variables**

```env
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

**Step 6: Wait for Verification**

- DNS changes: 5 minutes to 48 hours (usually < 1 hour)
- Resend verification: Usually 5-10 minutes after DNS updates

**Cost:** ~$10-15/year for domain + email service (Resend free tier: 3,000 emails/month)

---

### Solution 3: Use SendWith (No Domain Required)

**Best for:** Quick production setup without domain

**How it works:**
- Uses your existing Gmail/Google Workspace account
- No domain verification needed
- Vercel integration available

**Setup:**

1. **Install Vercel Integration:**
   - Go to [vercel.com/marketplace/sendwith](https://vercel.com/marketplace/sendwith)
   - Click "Add Integration"
   - Connect your Gmail/Google Workspace account

2. **Configure:**
   - SendWith will use your connected email
   - No additional configuration needed

3. **Update Code:**
   You'll need to use SendWith API instead of Resend. See their documentation.

**Pros:**
- ✅ No domain needed
- ✅ Works immediately
- ✅ Uses your existing email

**Cons:**
- ❌ Requires Gmail/Google Workspace
- ❌ Subject to Gmail sending limits
- ❌ May require code changes

**Cost:** Free for personal use, paid for business

---

### Solution 4: Use AWS SES with Email Verification

**Best for:** Cost-effective at scale

**How it works:**
- Verify individual email addresses (no domain needed initially)
- Very cheap: $0.10 per 1,000 emails
- Can verify domain later for better deliverability

**Setup:**

1. **Create AWS Account:**
   - Sign up at [aws.amazon.com](https://aws.amazon.com)

2. **Verify Email Address:**
   - Go to AWS SES Console
   - Verify an email address (e.g., `noreply@yourdomain.com`)
   - Click verification link in email

3. **Get API Credentials:**
   - Create IAM user with SES permissions
   - Get Access Key ID and Secret Access Key

4. **Install SDK:**
   ```bash
   npm install @aws-sdk/client-ses
   ```

5. **Update Code:**
   Replace Resend code with AWS SES SDK

**Pros:**
- ✅ Very cheap
- ✅ No domain verification needed initially
- ✅ High deliverability

**Cons:**
- ❌ More complex setup
- ❌ Requires AWS account
- ❌ Sandbox mode limits (can be removed)

**Cost:** $0.10 per 1,000 emails

---

### Solution 5: Use Brevo (Sendinblue) - Email Verification Only

**Best for:** Quick setup with email verification

**How it works:**
- Verify a single email address (no domain needed)
- Can send from verified email
- Free tier: 300 emails/day

**Setup:**

1. **Sign Up:**
   - Go to [brevo.com](https://brevo.com)
   - Create account

2. **Verify Email:**
   - Verify your email address
   - No domain verification needed

3. **Get API Key:**
   - Go to Settings → API Keys
   - Create API key

4. **Install SDK:**
   ```bash
   npm install @getbrevo/brevo
   ```

5. **Update Code:**
   Replace Resend with Brevo SDK

**Pros:**
- ✅ Free tier available
- ✅ Email verification only (no domain)
- ✅ Good deliverability

**Cons:**
- ❌ Free tier limited to 300/day
- ❌ Requires code changes

**Cost:** Free tier: 300 emails/day

---

## 📊 Comparison Table

| Solution | Domain Required | Setup Time | Cost | Best For |
|----------|----------------|------------|------|----------|
| **Resend Test Domain** | ❌ No | ⭐ Immediate | Free | Testing |
| **Custom Domain + Resend** | ✅ Yes | ⭐⭐ 1-2 hours | $10-15/year | Production |
| **SendWith** | ❌ No | ⭐⭐ 30 min | Free/Paid | Quick prod |
| **AWS SES** | ❌ No (initially) | ⭐⭐⭐ 1-2 hours | $0.10/1K | Scale |
| **Brevo** | ❌ No | ⭐⭐ 30 min | Free/Paid | Quick prod |

---

## 🚀 Recommended Approach

### For Immediate Deployment (No Custom Domain)

1. **Use Resend Test Domain** (`onboarding@resend.dev`)
   - Deploy immediately
   - Test all functionality
   - Emails sent to your account email only

2. **Set Up Custom Domain** (Next Steps)
   - Purchase domain (~$10/year)
   - Configure in Vercel
   - Verify in Resend
   - Update `FROM_EMAIL` to custom domain

### For Production with Custom Domain

**Recommended Path:**
1. Purchase domain
2. Configure in Vercel
3. Verify in Resend
4. Use `noreply@yourdomain.com` or `hello@yourdomain.com`

**Timeline:**
- Domain purchase: 5 minutes
- DNS configuration: 10 minutes
- DNS propagation: 5 minutes to 1 hour
- Resend verification: 5-10 minutes
- **Total: ~30 minutes to 1 hour**

---

## 🔧 Current Configuration

Your current setup uses Resend test domain:

```env
FROM_EMAIL=onboarding@resend.dev
RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
```

**Status:** ✅ Works for testing
**Limitation:** Can only send to your Resend account email

---

## 📝 Migration Steps (Test Domain → Custom Domain)

When you're ready to move to a custom domain:

### Step 1: Purchase Domain

Buy domain from any registrar.

### Step 2: Configure in Vercel

1. Vercel Dashboard → Settings → Domains
2. Add domain
3. Configure DNS records

### Step 3: Verify in Resend

1. Add domain to Resend
2. Add DNS records
3. Wait for verification

### Step 4: Update Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```env
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Step 5: Redeploy

Redeploy your application (or push a commit).

### Step 6: Test

Test password reset and user creation emails.

---

## 🎯 Quick Decision Guide

**Choose Resend Test Domain if:**
- ✅ Deploying immediately for testing
- ✅ Don't have custom domain yet
- ✅ Only need to send to your email

**Choose Custom Domain + Resend if:**
- ✅ Ready for production
- ✅ Want professional email addresses
- ✅ Need to send to multiple users
- ✅ Have $10-15/year budget

**Choose SendWith if:**
- ✅ Already have Gmail/Google Workspace
- ✅ Want quick setup without domain
- ✅ Don't mind Gmail limits

**Choose AWS SES if:**
- ✅ Sending high volume
- ✅ Want lowest cost
- ✅ Comfortable with AWS

**Choose Brevo if:**
- ✅ Want free tier
- ✅ Need quick setup
- ✅ 300 emails/day is enough

---

## ✅ Action Items

### Immediate (Can Do Now):
- [x] Use Resend test domain for deployment
- [ ] Deploy to Vercel
- [ ] Test email functionality

### Next Steps (For Production):
- [ ] Purchase custom domain
- [ ] Configure domain in Vercel
- [ ] Verify domain in Resend
- [ ] Update environment variables
- [ ] Test production emails

---

## 📚 Related Documentation

- **Vercel Deployment:** `VERCEL_DEPLOYMENT_GUIDE.md`
- **Email Options:** `EMAIL_SERVICE_OPTIONS.md`
- **Resend Setup:** `RESEND_DOMAIN_VERIFICATION.md`
- **Edge Functions:** `EDGE_FUNCTION_EMAIL_GUIDE.md`

---

## 🆘 Troubleshooting

### "Domain verification required" Error

**Problem:** Trying to send to non-verified email

**Solution:**
- Use Resend test domain (`onboarding@resend.dev`)
- Or verify your custom domain in Resend
- Or use alternative email service

### Emails Going to Spam

**Solution:**
- Verify domain with SPF/DKIM records
- Use custom domain (not test domain)
- Set up proper email authentication

### DNS Not Propagating

**Solution:**
- Wait 24-48 hours (usually faster)
- Check DNS records are correct
- Use DNS checker tools online

---

**Bottom Line:** You can deploy immediately with Resend test domain, then upgrade to custom domain when ready for production!

