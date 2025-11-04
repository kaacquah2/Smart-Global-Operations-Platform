/**
 * Environment variable validation utility
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  RESEND_API_KEY?: string
  FROM_EMAIL?: string
  NEXT_PUBLIC_APP_URL?: string
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const optionalEnvVars: (keyof EnvConfig)[] = [
  'RESEND_API_KEY',
  'FROM_EMAIL',
  'NEXT_PUBLIC_APP_URL',
]

export interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

/**
 * Validate environment variables
 * @returns Validation result with missing vars and warnings
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required variables
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  // Check optional but recommended variables
  optionalEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  })

  // Validate format of specific variables
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
    } catch {
      warnings.push('NEXT_PUBLIC_SUPABASE_URL appears to be invalid (not a valid URL)')
    }
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length < 100) {
    warnings.push('NEXT_PUBLIC_SUPABASE_ANON_KEY appears to be invalid (too short)')
  }

  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length < 100) {
    warnings.push('SUPABASE_SERVICE_ROLE_KEY appears to be invalid (too short)')
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Validate environment variables and throw if invalid
 * Call this in API routes or server-side code
 */
export function requireEnv(): EnvConfig {
  const validation = validateEnv()

  if (!validation.isValid) {
    throw new Error(
      `Missing required environment variables: ${validation.missing.join(', ')}\n` +
        `Please check your .env.local file.`
    )
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  }
}

/**
 * Log environment validation warnings (non-blocking)
 * Use this in development to warn about missing optional vars
 */
export function logEnvWarnings(): void {
  if (process.env.NODE_ENV === 'production') {
    return // Don't log in production
  }

  const validation = validateEnv()

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Environment variable warnings:')
    validation.warnings.forEach((warning) => {
      console.warn(`   - ${warning}`)
    })
  }

  if (validation.missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    validation.missing.forEach((missing) => {
      console.error(`   - ${missing}`)
    })
    console.error('\nPlease check your .env.local file.\n')
  }
}

// Auto-validate on import (non-blocking)
if (typeof window === 'undefined') {
  // Server-side only
  logEnvWarnings()
}

