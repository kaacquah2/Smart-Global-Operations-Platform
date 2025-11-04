"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Layers, Users, Zap, BarChart3, Building2, ArrowRight } from "lucide-react"
import { APP_NAME, APP_FULL_NAME } from "@/lib/constants"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)

  const handleComplete = () => {
    localStorage.setItem("onboarding_complete", "true")
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">{APP_NAME}</span>
            </div>
            <div className="text-sm text-muted-foreground">Step {step} of 4</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {step === 1 && (
          <Card className="border-border/50">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
                    <Building2 className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">Welcome to SGOAP</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Let's set up your organization and get your team ready to scale globally with intelligent operations
                  management.
                </p>
                <Button onClick={() => setStep(2)} className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-border/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Set Up Your Team</h2>
              <div className="space-y-4">
                {[
                  "Alice Johnson - Manager",
                  "Bob Smith - Operations Lead",
                  "Carol Williams - Analyst",
                  "David Brown - Coordinator",
                ].map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-semibold">
                      {member.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{member}</p>
                    </div>
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-4">
                  Pre-populated sample team members. You can customize in settings.
                </p>
              </div>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-border/50">
            <CardContent className="pt-8 pb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6">Choose Your Features</h2>
              <div className="space-y-3">
                {[
                  { icon: BarChart3, title: "Advanced Analytics", desc: "Track KPIs and performance" },
                  { icon: Users, title: "Team Collaboration", desc: "Real-time task coordination" },
                  { icon: Zap, title: "Workflow Automation", desc: "Automate repetitive tasks" },
                  { icon: Building2, title: "Multi-Branch Support", desc: "Manage global operations" },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 rounded-lg border-2 border-accent/50 bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer"
                  >
                    <feature.icon className="h-6 w-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{feature.title}</p>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </div>
                    <Check className="h-5 w-5 text-green-500" />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button onClick={() => setStep(4)} className="flex-1 gap-2">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card className="border-border/50">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-500/10">
                    <Check className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">You're All Set!</h2>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Your organization is ready. Let's dive into the dashboard and start managing your global operations
                  with SGOAP.
                </p>
                <Button onClick={handleComplete} size="lg" className="gap-2">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
