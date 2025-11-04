"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, Plus, X } from "lucide-react"
import Link from "next/link"

export default function SubmitWorkPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    files: [] as string[],
    deadline: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      const fileNames = Array.from(files).map((f) => f.name)
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...fileNames],
      }))
    }
  }

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      setTimeout(() => {
        setFormData({ title: "", description: "", files: [], deadline: "" })
        setSubmitted(false)
      }, 2000)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-2">
            <Link href="/employee/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Submit Your Work</h1>
          <p className="text-muted-foreground">Upload and submit your completed projects and deliverables</p>
        </div>

        {submitted && (
          <Card className="mb-6 border-accent bg-accent/10 p-4">
            <p className="text-sm text-accent font-medium">
              ✓ Work submitted successfully! Your manager will review it shortly.
            </p>
          </Card>
        )}

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Work Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Q1 Sales Analysis Report"
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your work, key findings, and deliverables..."
                rows={5}
                required
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Upload Files</label>
              <div className="rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center hover:border-accent transition-colors">
                <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="mb-2 text-sm text-foreground font-medium">Drop files here or click to browse</p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports: PDF, XLSX, DOCX, PNG, JPG (Max 50MB per file)
                </p>
                <input type="file" multiple onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button type="button" variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Plus className="h-4 w-4" />
                    Choose Files
                  </Button>
                </label>
              </div>

              {/* File List */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-border bg-card/50 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-accent" />
                        <span className="text-sm text-foreground">{file}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-border bg-card px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <p className="mt-1 text-xs text-muted-foreground">Leave empty if no specific deadline</p>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isSubmitting || !formData.title} className="flex-1 gap-2">
                {isSubmitting ? "Submitting..." : "Submit Work"}
              </Button>
              <Link href="/employee/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 border-border bg-card/50 p-6">
          <h3 className="mb-3 font-semibold text-foreground">What happens next?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-accent">1.</span>
              <span>Your manager will receive a notification about your submission</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">2.</span>
              <span>They will review and provide feedback within 2-3 business days</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent">3.</span>
              <span>You'll get notified with their decision and any comments</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}
