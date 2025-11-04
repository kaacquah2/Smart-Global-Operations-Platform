# Quick Deploy Script for Supabase Edge Function

# Step 1: Install Supabase CLI (if not already installed)
# npm install -g supabase

# Step 2: Login to Supabase
# supabase login

# Step 3: Link your project (replace with your project ref)
# supabase link --project-ref rlrwmxmzncqhapfizxcy

# Step 4: Set secrets
supabase secrets set RESEND_API_KEY=re_CnRNbqRj_BiXxeGN6ckDcNHxCwXJ4Zg7q
supabase secrets set FROM_EMAIL=onboarding@resend.dev

# Step 5: Deploy the function
supabase functions deploy send-email

# Step 6: View logs (optional)
# supabase functions logs send-email

echo "Deployment complete! Your Edge Function is ready to use."

