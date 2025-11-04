# Send Email Edge Function

This Supabase Edge Function sends emails using Resend.

## Setup

1. **Deploy the function:**
   ```bash
   supabase functions deploy send-email
   ```

2. **Set environment variables in Supabase:**
   - Go to Supabase Dashboard > Project Settings > Edge Functions
   - Add secrets:
     - `RESEND_API_KEY`: Your Resend API key
     - `FROM_EMAIL`: Default sender email (optional, defaults to onboarding@resend.dev)

## Usage

Call the function from your application:

```typescript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
    html: '<h1>Welcome to our platform</h1>',
    text: 'Welcome to our platform',
    from: 'noreply@yourdomain.com' // Optional
  }
})
```

## Environment Variables

- `RESEND_API_KEY` (required): Your Resend API key
- `FROM_EMAIL` (optional): Default sender email address

