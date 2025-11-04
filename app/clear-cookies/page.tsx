"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default function ClearCookiesPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"idle" | "clearing" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    // Auto-clear cookies on page load
    clearCookies()
  }, [])

  const clearCookies = async () => {
    setStatus("clearing")
    setMessage("Clearing cookies...")

    try {
      // Clear Supabase session
      const supabase = createClient()
      await supabase.auth.signOut()

      // Clear all cookies via JavaScript (client-side)
      // Get all cookies
      const cookies = document.cookie.split(";")

      // Delete each cookie
      cookies.forEach((cookie) => {
        const eqPos = cookie.indexOf("=")
        const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
        
        // Delete cookie for current path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
        
        // Delete cookie for root path
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`
        
        // Delete cookie without domain (for localhost)
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
      })

      // Clear localStorage and sessionStorage
      localStorage.clear()
      sessionStorage.clear()

      setStatus("success")
      setMessage("Cookies cleared successfully! Redirecting to login...")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (error) {
      setStatus("error")
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to clear cookies. Please clear them manually in your browser settings."
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Clear Cookies</CardTitle>
          <CardDescription>
            This will clear all cookies and session data to fix HTTP 431 errors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{message}</p>
            </div>
          )}

          {status === "clearing" && (
            <div className="text-center py-4">
              <div className="mb-4 h-8 w-8 rounded-full bg-accent/20 mx-auto animate-spin"></div>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          )}

          {status === "idle" && (
            <Button onClick={clearCookies} className="w-full">
              Clear All Cookies
            </Button>
          )}

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              If this doesn't work, please clear cookies manually in your browser:
              <br />
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+Shift+Delete</kbd> (Windows) or{" "}
              <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Cmd+Shift+Delete</kbd> (Mac)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

