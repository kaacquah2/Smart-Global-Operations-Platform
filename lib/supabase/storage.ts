import { createClient } from './client'

const supabase = createClient()

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_FILE_TYPES = {
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  spreadsheets: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  images: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'],
  archives: ['application/zip', 'application/x-rar-compressed'],
}

const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.png', '.jpg', '.jpeg', '.gif',
  '.zip', '.rar'
]

export interface UploadOptions {
  folder: string // e.g., 'purchase-requests', 'work-submissions'
  userId: string
  fileName?: string
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        url: '',
        path: '',
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      }
    }

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return {
        url: '',
        path: '',
        error: `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`
      }
    }

    // Generate unique file name
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileName = options.fileName || `${timestamp}-${randomString}-${file.name}`
    const filePath = `${options.folder}/${options.userId}/${fileName}`

    // Upload file
    const { data, error } = await supabase.storage
      .from('documents') // Create this bucket in Supabase Dashboard
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      return {
        url: '',
        path: '',
        error: error.message
      }
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return {
      url: urlData.publicUrl,
      path: filePath
    }
  } catch (error: any) {
    return {
      url: '',
      path: '',
      error: error.message || 'Failed to upload file'
    }
  }
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('documents')
      .remove([filePath])

    return !error
  } catch {
    return false
  }
}

/**
 * Get public URL for a file
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadFile(file, options))
  )
  return results
}

