/**
 * Type declarations for speakeasy and qrcode
 * These are needed until proper type definitions are installed
 */

declare module 'speakeasy' {
  export interface GenerateSecretOptions {
    name: string
    issuer: string
    length?: number
  }

  export interface GenerateSecretResult {
    base32: string | null
    otpauth_url: string | null
  }

  export interface VerifyOptions {
    secret: string
    encoding: string
    token: string
    window?: number
  }

  export function generateSecret(options: GenerateSecretOptions): GenerateSecretResult
  export const totp: {
    verify(options: VerifyOptions): boolean
  }
}

declare module 'qrcode' {
  export function toDataURL(text: string): Promise<string>
}

declare module '@vercel/speed-insights/react' {
  export function SpeedInsights(): JSX.Element | null
}

declare module '@vercel/speed-insights/next' {
  export function SpeedInsights(): JSX.Element | null
}

