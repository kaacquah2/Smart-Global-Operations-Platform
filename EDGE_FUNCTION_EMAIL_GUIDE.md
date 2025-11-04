# Using Supabase Edge Function for Email

## ✅ Updated Implementation

The password reset route now **tries the Supabase Edge Function first**, then falls back to direct Resend calls. This provides:

1. **Better architecture** - Centralized email logic
2. **Fallback support** - Works even if Edge Function is not deployed
3. **Better error handling** - Clear logging of which method was used

## 🚀 To Activate the Edge Function

### Step 1: Deploy the Edge Function

```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref rlrwmxmzncqhapfizxcy

# Set secrets in Supabase
supabase secrets set RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
supabase secrets set FROM_EMAIL=onboarding@resend.dev

# Deploy the function
supabase functions deploy send-email
```

### Step 2: Verify Deployment

After deployment, you should see:
```
Function deployed successfully!
Function URL: https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email
```

### Step 3: Test

The password reset will now automatically try the Edge Function first!

## 📋 How It Works

1. **Tries Edge Function First**
   - Calls `supabase.functions.invoke('send-email')`
   - Uses service role key for authentication
   - If successful, returns immediately

2. **Falls Back to Direct Resend**
   - If Edge Function fails or is not deployed
   - Uses direct Resend API call
   - Same error handling as before

3. **Logging**
   - Shows which method was used
   - Logs success/failure for debugging
   - Clear error messages

## ⚠️ Important Notes

### Domain Verification Still Required

**Even with Edge Function**, you still need to verify a domain in Resend to send to other recipients. The Edge Function uses the same Resend API key and has the same restrictions.

**To fix domain verification**:
1. Go to https://resend.com/domains
2. Add and verify your domain
3. Update `FROM_EMAIL` secret in Supabase: `supabase secrets set FROM_EMAIL=noreply@yourdomain.com`
4. Or update in Supabase Dashboard → Edge Functions → Secrets

### Edge Function Benefits

- ✅ Centralized email logic
- ✅ Better for database triggers
- ✅ Easier to maintain
- ✅ Can be called from anywhere
- ❌ Still subject to Resend domain verification rules

## 🔍 Troubleshooting

### Edge Function Not Working?

1. **Check if deployed**: `supabase functions list`
2. **Check logs**: `supabase functions logs send-email`
3. **Verify secrets**: `supabase secrets list`
4. **Check Supabase Dashboard**: Edge Functions → send-email → Logs

### Still Getting Domain Verification Error?

- Edge Function uses the same Resend API key
- Same domain restrictions apply
- **Solution**: Verify a domain in Resend (see `RESEND_DOMAIN_VERIFICATION.md`)

### Testing Edge Function

You can test the Edge Function directly:

```bash
curl -X POST https://rlrwmxmzncqhapfizxcy.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Hello!</h1>"
  }'
```

## ✅ Current Status

- ✅ Code updated to use Edge Function first
- ✅ Fallback to direct Resend if Edge Function fails
- ✅ Better logging and error handling
- ⚠️ **Still need domain verification** for production use

## 📚 Related Documentation

- **Edge Function Setup**: `SUPABASE_EDGE_FUNCTION_SETUP.md`
- **Domain Verification**: `RESEND_DOMAIN_VERIFICATION.md`
- **Quick Fix**: `RESEND_DOMAIN_QUICK_FIX.md`

