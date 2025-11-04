"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { ArrowRight, BarChart3, Globe, Zap, TrendingUp, Layers, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants"

export default function Home() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()

  useEffect(() => {
    if (isLoggedIn) {
      router.push("/dashboard")
    }
  }, [isLoggedIn, router])

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
            </div>
            <Link href="/auth/login">
              <Button className="gap-2">
                Login <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="border-b border-border px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-block rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent">
            {APP_FULL_NAME}
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            Control Your Global Operations in Real-Time
          </h1>
          <p className="mb-8 text-xl text-muted-foreground">
            Monitor branches, manage tasks, analyze performance, and predict outcomes with AI-powered insights. Built
            for enterprises that scale globally.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-foreground">Game-Changing Features</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Global Branch Management",
                desc: "Monitor and manage operations across all your branches in one unified dashboard.",
              },
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                desc: "Deep dive into performance metrics with real-time data visualization and trends.",
              },
              {
                icon: Zap,
                title: "Real-Time Collaboration",
                desc: "Instant task assignments, live updates, and cross-team coordination.",
              },
              {
                icon: TrendingUp,
                title: "Performance Insights",
                desc: "Track KPIs, productivity metrics, and operational efficiency in real-time.",
              },
              {
                icon: Brain,
                title: "AI Predictions",
                desc: "Predictive analytics to forecast performance and identify opportunities early.",
              },
              {
                icon: Layers,
                title: "Enterprise Security",
                desc: "Role-based access control with enterprise-grade security infrastructure.",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group rounded-lg border border-border bg-card/50 p-6 transition-all hover:bg-card hover:shadow-lg"
              >
                <feature.icon className="mb-4 h-8 w-8 text-accent" />
                <h3 className="mb-2 font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-primary/5 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-foreground">Ready to Transform Your Operations?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join enterprises worldwide using {APP_NAME} to scale operations globally.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Launch Dashboard <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-foreground">{APP_NAME}</p>
                <p className="text-xs text-muted-foreground">{APP_FULL_NAME}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
