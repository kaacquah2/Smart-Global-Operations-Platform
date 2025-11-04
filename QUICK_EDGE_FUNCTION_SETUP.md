# 🚀 Quick Start: Activate Supabase Edge Function for Resend

## Prerequisites Checklist

- [x] Supabase project created
- [x] Resend API key obtained
- [x] Supabase CLI installed

## Installation Steps

### 1. Install Supabase CLI (if not installed)

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This opens your browser to authenticate with Supabase.

### 3. Link Your Project

```bash
supabase link --project-ref rlrwmxmzncqhapfizxcy
```

When prompted, enter your database password (found in Supabase Dashboard > Settings > Database).

### 4. Set Environment Variables

Set the Resend API key as a secret:

```bash
supabase secrets set RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
supabase secrets set FROM_EMAIL=onboarding@resend.dev
```

**Alternative: Set via Dashboard**
1. Go to Supabase Dashboard
2. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
3. Add:
   - `RESEND_API_KEY` = `re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q`
   - `FROM_EMAIL` = `onboarding@resend.dev`

### 5. Deploy the Function

```bash
supabase functions deploy send-email
```

You should see:
```
Function deployed successfully!
Function URL: https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email
```

## ✅ Verification

Test the function:

```bash
curl -X POST https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Supabase Edge Function!</h1>"
  }'
```

Replace `YOUR_ANON_KEY` with your Supabase anon key from `.env.local`.

## 📝 Usage in Your Code

### Option 1: Use the Helper Function (Recommended)

```typescript
import { sendEmailViaEdgeFunction } from '@/lib/supabase/email'

// In your API route or component
await sendEmailViaEdgeFunction({
  to: 'user@example.com',
  subject: 'Welcome!',
  html: '<h1>Welcome to our platform</h1>',
})
```

### Option 2: Direct Call

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Password Reset',
    html: '<p>Your password has been reset.</p>',
  }
})
```

## 🔍 Troubleshooting

### Function not deploying?
- Verify you're logged in: `supabase login`
- Check project is linked: `supabase projects list`
- Ensure you're in the project root directory

### "Secret not found" error?
- Verify secrets are set: `supabase secrets list`
- Check Supabase Dashboard > Edge Functions > Secrets

### Emails not sending?
- Check Edge Function logs: `supabase functions logs send-email`
- Verify Resend API key is correct
- Check Resend dashboard for API usage/errors
- Ensure `FROM_EMAIL` is verified in Resend

### View Logs
```bash
supabase functions logs send-email
```

Or in Supabase Dashboard:
- Go to **Edge Functions** > **send-email** > **Logs**

## 🎯 Next Steps

1. ✅ **Deploy the function** (follow steps above)
2. **Update your API routes** to use the Edge Function:
   - `app/api/send-credentials/route.ts`
   - `app/api/auth/reset-password/route.ts`
3. **Set up database triggers** for automatic email notifications
4. **Verify your sending domain** in Resend for production

## 📚 Full Documentation

See `SUPABASE_EDGE_FUNCTION_SETUP.md` for detailed documentation.

