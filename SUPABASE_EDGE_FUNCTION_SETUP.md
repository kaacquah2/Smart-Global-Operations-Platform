# Supabase Edge Function Setup for Resend

This guide will help you set up and deploy a Supabase Edge Function for sending emails with Resend.

## Prerequisites

1. **Supabase CLI installed**
   ```bash
   npm install -g supabase
   ```

2. **Supabase project** (already have this)
   - Project URL: `https://rlrwmxmzncqhapfizxcy.supabase.co`

3. **Resend API Key** (already have this)
   - API Key: `re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q`

## Step 1: Login to Supabase CLI

```bash
supabase login
```

This will open your browser to authenticate.

## Step 2: Link Your Project

```bash
supabase link --project-ref rlrwmxmzncqhapfizxcy
```

You'll need your database password (from Supabase dashboard > Settings > Database).

## Step 3: Set Environment Variables

Set the Resend API key as a secret in Supabase:

```bash
supabase secrets set RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
supabase secrets set FROM_EMAIL=onboarding@resend.dev
```

Or set it via Supabase Dashboard:
1. Go to **Project Settings** > **Edge Functions** > **Secrets**
2. Add:
   - Key: `RESEND_API_KEY`
   - Value: `re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q`
   - Key: `FROM_EMAIL`
   - Value: `onboarding@resend.dev` (or your verified domain email)

## Step 4: Deploy the Edge Function

```bash
supabase functions deploy send-email
```

## Step 5: Verify Deployment

After deployment, you should see:
```
Function deployed successfully!
Function URL: https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email
```

## Step 6: Test the Function

You can test it using curl:

```bash
curl -X POST https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello from Supabase Edge Function!</h1>"
  }'
```

## Using in Your Application

### Option 1: Call from Next.js API Route

Update your API routes to call the Edge Function:

```typescript
// In your Next.js API route
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: email,
    subject: 'Password Reset',
    html: emailHtml,
  }
})
```

### Option 2: Call from Client/Server Component

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome</h1>',
  }
})
```

### Option 3: Trigger from Database (Recommended)

You can set up database triggers to automatically send emails. Add this SQL in Supabase SQL Editor:

```sql
-- Create a function to call the Edge Function
CREATE OR REPLACE FUNCTION send_email_via_edge_function(
  to_email TEXT,
  subject TEXT,
  html_content TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  response http_response;
BEGIN
  SELECT content INTO response
  FROM http_post(
    'https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email',
    jsonb_build_object(
      'to', to_email,
      'subject', subject,
      'html', html_content
    )::text,
    'application/json',
    jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    )::text
  );
END;
$$;
```

## Troubleshooting

### Function not deploying?
- Make sure you're logged in: `supabase login`
- Make sure project is linked: `supabase link`
- Check your Supabase project dashboard for errors

### Emails not sending?
- Verify `RESEND_API_KEY` is set correctly
- Check Resend dashboard for API usage/errors
- Verify the `FROM_EMAIL` is verified in Resend
- Check Supabase Edge Function logs in dashboard

### View Logs
```bash
supabase functions logs send-email
```

Or view in Supabase Dashboard:
- Go to **Edge Functions** > **send-email** > **Logs**

## Next Steps

1. **Update your API routes** to use the Edge Function instead of direct Resend calls
2. **Set up database triggers** for automatic email notifications
3. **Verify your sending domain** in Resend for production use
4. **Update FROM_EMAIL** to use your verified domain

## Benefits of Using Edge Functions

- ✅ Centralized email logic
- ✅ Better security (API keys stored securely)
- ✅ Can be triggered from database events
- ✅ Better performance (runs on Supabase infrastructure)
- ✅ Easier to maintain and update

