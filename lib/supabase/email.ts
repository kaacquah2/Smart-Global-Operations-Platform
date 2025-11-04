import { createClient } from '@/lib/supabase/client'

interface SendEmailParams {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

/**
 * Send email using Supabase Edge Function
 * @param params Email parameters
 * @returns Promise with success status and data
 */
export async function sendEmailViaEdgeFunction(params: SendEmailParams) {
  const supabase = createClient()
  
  const { data, error } = await supabase.functions.invoke('resend-email', {
    body: params,
  })

  if (error) {
    console.error('Error calling resend-email Edge Function:', error)
    throw new Error(error.message || 'Failed to send email')
  }

  return data
}

/**
 * Send email from server-side (uses service role)
 */
export async function sendEmailViaEdgeFunctionServer(params: SendEmailParams) {
  const { createClient } = await import('@supabase/supabase-js')
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  const { data, error } = await supabase.functions.invoke('resend-email', {
    body: params,
  })

  if (error) {
    console.error('Error calling resend-email Edge Function:', error)
    throw new Error(error.message || 'Failed to send email')
  }

  return data
}

