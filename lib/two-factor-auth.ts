/**
 * Two-Factor Authentication (2FA) Utilities
 * Provides TOTP-based 2FA functionality for admin accounts
 */

import speakeasy from 'speakeasy'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'

export interface TwoFactorSetup {
  secret: string
  qrCodeUrl: string
  backupCodes: string[]
}

export interface Verify2FAResult {
  valid: boolean
  backupCodeUsed?: boolean
}

/**
 * Generate 2FA secret and QR code for user
 * @param userId - User ID
 * @param userEmail - User email (for QR code label)
 * @param issuer - Application name
 * @returns Setup object with secret, QR code URL, and backup codes
 */
export async function setup2FA(
  userId: string,
  userEmail: string,
  issuer: string = 'SGOAP'
): Promise<TwoFactorSetup> {
  // Generate secret
  const secret = speakeasy.generateSecret({
    name: `${issuer} (${userEmail})`,
    issuer: issuer,
    length: 32,
  })

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)

  // Generate backup codes (10 codes, 8 characters each)
  const backupCodes = Array.from({ length: 10 }, () =>
    generateBackupCode()
  )

  // Store secret and backup codes in database
  const supabase = await createClient()
  
  await supabase
    .from('user_2fa')
    .upsert({
      user_id: userId,
      secret: secret.base32!,
      enabled: false, // Not enabled until verified
      backup_codes: backupCodes,
      updated_at: new Date().toISOString(),
    })

  return {
    secret: secret.base32!,
    qrCodeUrl,
    backupCodes,
  }
}

/**
 * Verify 2FA token
 * @param userId - User ID
 * @param token - TOTP token from authenticator app
 * @param backupCode - Backup code (alternative to token)
 * @returns Verification result
 */
export async function verify2FA(
  userId: string,
  token?: string,
  backupCode?: string
): Promise<Verify2FAResult> {
  const supabase = await createClient()

  // Get user's 2FA settings
  const { data: user2FA, error } = await supabase
    .from('user_2fa')
    .select('secret, backup_codes, enabled')
    .eq('user_id', userId)
    .single()

  if (error || !user2FA) {
    return { valid: false }
  }

  if (!user2FA.enabled) {
    return { valid: false }
  }

  // Verify backup code if provided
  if (backupCode) {
    const backupCodes = user2FA.backup_codes || []
    const index = backupCodes.indexOf(backupCode)
    
    if (index !== -1) {
      // Remove used backup code
      const updatedCodes = backupCodes.filter((_: string, i: number) => i !== index)
      await supabase
        .from('user_2fa')
        .update({
          backup_codes: updatedCodes,
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return { valid: true, backupCodeUsed: true }
    }
    
    return { valid: false }
  }

  // Verify TOTP token
  if (token) {
    const verified = speakeasy.totp.verify({
      secret: user2FA.secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time steps of tolerance
    })

    if (verified) {
      // Update last used timestamp
      await supabase
        .from('user_2fa')
        .update({
          last_used_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      return { valid: true }
    }
  }

  return { valid: false }
}

/**
 * Enable 2FA for user (after initial verification)
 * @param userId - User ID
 * @param verificationToken - Token to verify setup
 * @returns Success status
 */
export async function enable2FA(userId: string, verificationToken: string): Promise<boolean> {
  // First verify the token
  const verified = await verify2FA(userId, verificationToken)
  
  if (!verified.valid) {
    return false
  }

  // Enable 2FA
  const supabase = await createClient()
  const { error } = await supabase
    .from('user_2fa')
    .update({
      enabled: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return !error
}

/**
 * Disable 2FA for user
 * @param userId - User ID
 * @returns Success status
 */
export async function disable2FA(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('user_2fa')
    .update({
      enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return !error
}

/**
 * Check if user has 2FA enabled
 * @param userId - User ID
 * @returns True if 2FA is enabled
 */
export async function is2FAEnabled(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('user_2fa')
    .select('enabled')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return false
  }

  return data.enabled === true
}

/**
 * Generate a random backup code
 * @returns 8-character alphanumeric code
 */
function generateBackupCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding ambiguous characters
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Regenerate backup codes for user
 * @param userId - User ID
 * @returns New backup codes
 */
export async function regenerateBackupCodes(userId: string): Promise<string[]> {
  const backupCodes = Array.from({ length: 10 }, () => generateBackupCode())

  const supabase = await createClient()
  
  await supabase
    .from('user_2fa')
    .update({
      backup_codes: backupCodes,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return backupCodes
}

