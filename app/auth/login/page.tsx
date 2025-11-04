"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Eye, EyeOff, Mail, Lock, Layers, ArrowRight, CheckCircle } from "lucide-react"
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("")
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false)
  const [forgotPasswordError, setForgotPasswordError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(email, password)
      // Redirect will be handled by dashboard page based on role
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotPasswordLoading(true)
    setForgotPasswordError("")
    setForgotPasswordSuccess(false)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit password reset request")
      }

      setForgotPasswordSuccess(true)
      setTimeout(() => {
        setForgotPasswordOpen(false)
        setForgotPasswordEmail("")
        setForgotPasswordSuccess(false)
      }, 3000)
    } catch (err) {
      setForgotPasswordError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setForgotPasswordLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Layers className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to your {APP_NAME} account</p>
          <p className="text-xs text-muted-foreground mt-1">{APP_FULL_NAME}</p>
        </div>

        {/* Login Card */}
        <Card className="border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <button 
                    type="button" 
                    className="text-xs text-accent hover:underline"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}

              {/* Login Button */}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"} {!loading && <ArrowRight className="h-4 w-4" />}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Company Login</span>
                </div>
              </div>

              {/* Demo Credentials Info */}
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground">Demo Credentials:</p>
                <p>Admin: admin@sgoap.com / admin123</p>
                <p>Employee: employee@sgoap.com / password123</p>
                <p>Head: head@sgoap.com / password123</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
          <p className="mt-2">
            © {new Date().getFullYear()} {APP_NAME} - {APP_FULL_NAME}
          </p>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Forgot Password?</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll notify an administrator to reset your password.
            </DialogDescription>
          </DialogHeader>
          {forgotPasswordSuccess ? (
            <div className="py-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Request Submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your password reset request has been sent to administrators. They will process it and send you a new password via email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="forgot-email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@company.com"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {forgotPasswordError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {forgotPasswordError}
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotPasswordOpen(false)
                    setForgotPasswordEmail("")
                    setForgotPasswordError("")
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={forgotPasswordLoading}>
                  {forgotPasswordLoading ? "Submitting..." : "Submit Request"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
