import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper function to clean up Supabase cookies
function clearSupabaseCookies(response: NextResponse) {
  const allCookies = response.cookies.getAll()
  allCookies.forEach(({ name }) => {
    // Clear any Supabase-related cookies
    if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
      response.cookies.delete(name)
    }
  })
}

// Helper function to filter and clean cookies proactively
function getCleanCookies(cookies: { name: string; value: string }[]) {
  // Filter out cookies that are too large (>4KB) or too many
  const MAX_COOKIE_SIZE = 4000 // 4KB
  const MAX_COOKIES = 15 // Limit total cookies
  
  const validCookies = cookies
    .filter(({ value }) => value.length <= MAX_COOKIE_SIZE)
    .slice(0, MAX_COOKIES)
  
  // Prioritize Supabase auth cookies - keep the most recent ones
  const supabaseCookies = validCookies.filter(({ name }) => 
    name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')
  )
  const otherCookies = validCookies.filter(({ name }) => 
    !name.startsWith('sb-') && !name.includes('supabase') && !name.includes('auth-token')
  )
  
  // Keep up to 5 Supabase cookies (should be enough) + other cookies
  return [
    ...supabaseCookies.slice(-5), // Keep most recent 5 Supabase cookies
    ...otherCookies.slice(0, MAX_COOKIES - 5)
  ]
}

export async function middleware(request: NextRequest) {
  // First, check if we have too many cookies and clean them proactively
  const allCookies = request.cookies.getAll()
  const totalCookieSize = allCookies.reduce((sum, cookie) => sum + cookie.value.length, 0)
  const MAX_TOTAL_HEADER_SIZE = 8000 // 8KB total header size limit
  
  // If headers are getting too large, clean up cookies before processing
  if (allCookies.length > 20 || totalCookieSize > MAX_TOTAL_HEADER_SIZE) {
    const response = NextResponse.next({ request })
    // Clear old Supabase cookies, keep only the most recent ones
    const cleanCookies = getCleanCookies(allCookies)
    
    // Clear all Supabase cookies first
    allCookies.forEach(({ name }) => {
      if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
        response.cookies.delete(name)
      }
    })
    
    return response
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            // Return cleaned cookies to prevent header size issues
            const cookies = request.cookies.getAll()
            return getCleanCookies(cookies)
          },
          setAll(cookiesToSet) {
            // Filter and limit cookie size to prevent HTTP 431
            const filteredCookies = cookiesToSet
              .filter(({ value }) => value.length <= 4000) // Max 4KB per cookie
              .slice(0, 10) // Limit total new cookies
            
            // Create new response
            supabaseResponse = NextResponse.next({
              request,
            })
            
            // Only set the filtered cookies
            filteredCookies.forEach(({ name, value, options }) => {
              supabaseResponse.cookies.set(name, value, {
                ...options,
                httpOnly: options?.httpOnly ?? true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
                maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days default
              })
            })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Protect routes that require authentication
    // Allow access to auth routes, clear-cookies page, and home page without auth
    const publicPaths = ['/auth', '/clear-cookies', '/']
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
    )
    
    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
  } catch (error) {
    // If there's any error (especially 431), clear all cookies and redirect
    console.error('Middleware error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    const is431Error = errorMessage.includes('431') || 
                      errorMessage.includes('header') ||
                      errorMessage.includes('too large') ||
                      errorMessage.includes('cookie')
    
    // Clear cookies on 431 errors or cookie-related errors
    if (is431Error) {
      // Redirect to clear-cookies page so user can manually clear cookies
      // This page doesn't require auth and will help them recover
      const response = NextResponse.redirect(new URL('/clear-cookies', request.url))
      // Try to clear cookies in the response too
      clearSupabaseCookies(response)
      
      // Also clear common cookie patterns
      const allCookieNames = request.cookies.getAll().map(c => c.name)
      allCookieNames.forEach(name => {
        if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth')) {
          response.cookies.delete(name)
        }
      })
      
      return response
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

