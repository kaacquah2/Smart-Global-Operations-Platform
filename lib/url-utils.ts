/**
 * URL utilities for Vercel deployment
 * Automatically detects the correct URL based on environment
 */

/**
 * Get the application URL dynamically
 * Supports:
 * - Vercel deployment (production/preview)
 * - Local development
 * - Custom domain configuration
 */
export function getAppUrl(): string {
  // 1. Check for explicit NEXT_PUBLIC_APP_URL (highest priority)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. Check for Vercel's VERCEL_URL (for preview deployments)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Check for Vercel's production URL environment variable
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }

  // 4. Check for runtime Vercel URL (server-side only)
  if (typeof window === 'undefined' && process.env.VERCEL) {
    // In Vercel, we can construct URL from headers
    // This is handled by getAppUrlFromRequest in server contexts
  }

  // 5. Fallback to localhost for development
  return process.env.NODE_ENV === 'production' 
    ? 'https://smart-global-operations-platform.vercel.app' // Fallback production URL
    : 'http://localhost:3000'
}

/**
 * Get the application URL from a Next.js request (server-side)
 * Useful for API routes and server components
 */
export function getAppUrlFromRequest(request?: { headers: Headers | Record<string, string | string[]> }): string {
  // 1. Check for explicit NEXT_PUBLIC_APP_URL (highest priority)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. Check for Vercel's VERCEL_URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 3. Try to construct from request headers (server-side only)
  if (request?.headers) {
    const headers = request.headers instanceof Headers 
      ? request.headers 
      : new Headers(
          Object.entries(request.headers).reduce((acc, [key, value]) => {
            acc[key] = Array.isArray(value) ? value[0] : value
            return acc
          }, {} as Record<string, string>)
        )

    const host = headers.get('host')
    const protocol = headers.get('x-forwarded-proto') || 'https'
    
    if (host) {
      // Skip localhost in production
      if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
        return `${protocol}://${host}`
      }
    }
  }

  // 4. Fallback to getAppUrl()
  return getAppUrl()
}

/**
 * Get login URL with proper path
 */
export function getLoginUrl(request?: { headers: Headers | Record<string, string | string[]> }): string {
  const baseUrl = request ? getAppUrlFromRequest(request) : getAppUrl()
  return `${baseUrl}/auth/login`
}

/**
 * Get callback URL for OAuth/redirects
 */
export function getCallbackUrl(path: string = '/auth/callback', request?: { headers: Headers | Record<string, string | string[]> }): string {
  const baseUrl = request ? getAppUrlFromRequest(request) : getAppUrl()
  return `${baseUrl}${path}`
}

