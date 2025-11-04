# Password Reset Email Troubleshooting Guide

## Issues Fixed

### 1. ✅ HTML Template Bug
- **Fixed**: Email display now shows the email address correctly
- **Fixed**: Password is displayed with better formatting

### 2. ✅ Silent Email Failures
- **Fixed**: Email failures now return proper error messages
- **Fixed**: Admin interface shows clear error messages when email fails
- **Fixed**: Admin receives the new password if email fails (for manual sending)

### 3. ✅ Better Error Handling
- **Fixed**: Detailed error logging for debugging
- **Fixed**: Clear error messages in API responses
- **Fixed**: Success/failure status properly reported

### 4. ✅ Environment Variable Checking
- **Fixed**: Checks for `RESEND_API_KEY` before attempting to send
- **Fixed**: Clear error message if API key is missing

## Common Issues & Solutions

### Issue: "Email service not configured"
**Cause**: `RESEND_API_KEY` is not set in environment variables

**Solution**:
1. **Local Development**: Add to `.env.local`:
   ```env
   RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
   FROM_EMAIL=onboarding@resend.dev
   ```

2. **Vercel Production**: 
   - Go to Vercel Dashboard > Your Project > Settings > Environment Variables
   - Add `RESEND_API_KEY` = `re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q`
   - Add `FROM_EMAIL` = `onboarding@resend.dev` (or your verified domain)
   - Redeploy your application

### Issue: "Failed to send email via Resend"
**Possible Causes**:

1. **Invalid API Key**
   - Check Resend dashboard for API key validity
   - Verify key starts with `re_`

2. **Unverified Domain**
   - If using custom domain, verify it in Resend dashboard
   - Use `onboarding@resend.dev` for testing (no verification needed)

3. **Rate Limits**
   - Check Resend dashboard for usage limits
   - Free tier: 3,000 emails/month

4. **Invalid Email Address**
   - Verify recipient email is valid
   - Check for typos in email address

### Issue: Emails Going to Spam
**Solutions**:
1. Verify your sending domain in Resend
2. Use SPF/DKIM records (Resend provides these)
3. Ensure `FROM_EMAIL` matches your verified domain

### Issue: Admin Doesn't See Errors
**Fixed**: Admin interface now shows:
- Success message when email is sent
- Error message with password if email fails
- Password is included in error response for manual sending

## Testing

### Test Email Sending Locally:
1. Set `RESEND_API_KEY` in `.env.local`
2. Process a password reset request in admin panel
3. Check console logs for email sending status
4. Check Resend dashboard for sent emails

### Check Logs:
- **Local**: Check terminal/console output
- **Vercel**: Check Function Logs in Vercel Dashboard
- **Resend**: Check Email Logs in Resend Dashboard

## Verification Steps

1. ✅ **Environment Variables Set**
   ```bash
   # Check if variables are set
   echo $RESEND_API_KEY
   ```

2. ✅ **Resend Dashboard**
   - Login to https://resend.com
   - Check API Keys section
   - Verify key is active

3. ✅ **Email Logs**
   - Check Resend dashboard > Emails
   - Look for sent/failed emails
   - Check error messages

4. ✅ **Vercel Logs**
   - Go to Vercel Dashboard > Functions > Logs
   - Look for email sending logs
   - Check for error messages

## Manual Password Sending

If email fails, the admin will receive:
- Error message with the new password
- Instructions to manually send the password
- Password is also logged to console

**To manually send password**:
1. Copy the password from the error message
2. Send via secure email/chat
3. Inform user to change password after login

## Next Steps

1. ✅ **Verify Environment Variables** are set in Vercel
2. ✅ **Test Password Reset** with a test user
3. ✅ **Check Resend Dashboard** for email delivery
4. ✅ **Monitor Logs** for any errors

## Additional Resources

- Resend Documentation: https://resend.com/docs
- Resend Dashboard: https://resend.com/emails
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

