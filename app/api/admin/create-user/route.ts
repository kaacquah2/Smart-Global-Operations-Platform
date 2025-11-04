import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This route uses the service role key to create users via Admin API
// Only accessible from server-side

export async function POST(request: NextRequest) {
  try {
    // Verify this is coming from authenticated admin (in production, add proper auth check)
    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Use service role key for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create user using Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Auto-confirm email so they can login immediately
      user_metadata: {
        name: name,
      },
    })

    if (error) {
      console.error('Error creating auth user:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create auth user' },
        { status: 400 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'No user data returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      userId: data.user.id,
      email: data.user.email,
    })
  } catch (error) {
    console.error('Error in create-user route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

