"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, FileText, Loader2 } from "lucide-react"
import { uploadFile, type UploadOptions } from "@/lib/supabase/storage"
import { Progress } from "@/components/ui/progress"

interface FileUploadProps {
  folder: string
  userId: string
  onUploadComplete: (urls: string[]) => void
  maxFiles?: number
  maxSizeMB?: number
  accept?: string
}

interface FileWithProgress {
  file: File
  progress: number
  url?: string
  error?: string
}

export function FileUpload({
  folder,
  userId,
  onUploadComplete,
  maxFiles = 10,
  maxSizeMB = 50,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.zip,.rar"
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithProgress[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    // Check max files
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`)
      return
    }

    // Validate file sizes
    const oversizedFiles = selectedFiles.filter(
      file => file.size > maxSizeMB * 1024 * 1024
    )
    if (oversizedFiles.length > 0) {
      alert(`Some files exceed ${maxSizeMB}MB limit`)
      return
    }

    const newFiles: FileWithProgress[] = selectedFiles.map(file => ({
      file,
      progress: 0
    }))

    setFiles([...files, ...newFiles])
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) return

    setUploading(true)
    const uploadOptions: UploadOptions = { folder, userId }
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i]
      
      // Update progress
      setFiles(prev => {
        const updated = [...prev]
        updated[i] = { ...updated[i], progress: 10 }
        return updated
      })

      const result = await uploadFile(fileItem.file, uploadOptions)

      if (result.error) {
        setFiles(prev => {
          const updated = [...prev]
          updated[i] = { ...updated[i], error: result.error, progress: 0 }
          return updated
        })
      } else {
        uploadedUrls.push(result.url)
        setFiles(prev => {
          const updated = [...prev]
          updated[i] = { ...updated[i], url: result.url, progress: 100 }
          return updated
        })
      }
    }

    setUploading(false)
    
    if (uploadedUrls.length > 0) {
      onUploadComplete(uploadedUrls)
      // Keep files with errors, remove successful ones
      setFiles(prev => prev.filter(f => !f.url))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium mb-1">Drop files here or click to browse</p>
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, {maxSizeMB}MB per file. Supported: PDF, DOC, XLS, Images, ZIP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((fileItem, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 border rounded-lg"
            >
              <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(fileItem.file.size)}
                </p>
                {fileItem.progress > 0 && fileItem.progress < 100 && (
                  <Progress value={fileItem.progress} className="mt-2" />
                )}
                {fileItem.error && (
                  <p className="text-xs text-red-600 mt-1">{fileItem.error}</p>
                )}
                {fileItem.url && (
                  <p className="text-xs text-green-600 mt-1">Uploaded successfully</p>
                )}
              </div>
              {!uploading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}

          {/* Upload Button */}
          {!uploading && (
            <Button
              onClick={handleUpload}
              disabled={files.length === 0}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </Button>
          )}

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading files...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

