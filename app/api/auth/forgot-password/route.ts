import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Create admin client to access database
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Check if user exists
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single()

    // We still create a request even if user doesn't exist (for security)
    // but we'll include user info if found
    const resetRequest = {
      user_id: userData?.id || null,
      user_email: email.toLowerCase(),
      user_name: userData?.name || null,
      status: 'pending',
    }

    // Insert password reset request
    const { data: requestData, error: insertError } = await supabaseAdmin
      .from('password_reset_requests')
      .insert(resetRequest)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating password reset request:', insertError)
      return NextResponse.json(
        { error: 'Failed to create password reset request' },
        { status: 500 }
      )
    }

    // The trigger will automatically notify admins
    // So we just return success
    return NextResponse.json({
      success: true,
      message: 'Password reset request submitted successfully. An administrator will process it shortly.',
      requestId: requestData.id
    })
  } catch (error) {
    console.error('Error in forgot-password route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

