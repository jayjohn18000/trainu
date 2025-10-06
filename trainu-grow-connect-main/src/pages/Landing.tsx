import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, Bot, Calendar, BarChart3 } from "lucide-react";

export default function Landing() {
  const router = useRouter();

  return (
    <main className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20 radial-gradient pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center text-center gap-6">
            <span className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
              Powered by TrainU
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Mentorship-as-a-Service for <span className="text-primary">Trainers</span>
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              AI-powered coaching agents, smart scheduling, and progress insights—so you can scale
              results without scaling hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" onClick={() => router.push("/directory")} className="gap-2">
                Explore Trainers
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push("/discover")}>
                Become a Trainer
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { 
              icon: Bot, 
              t: "AI Coaching Agents", 
              s: "Your style, your cues—scaled." 
            },
            { 
              icon: Calendar, 
              t: "Smart Scheduling", 
              s: "Reduce no-shows & idle hours." 
            },
            { 
              icon: BarChart3, 
              t: "Progress Insights", 
              s: "Nudges, milestones, momentum." 
            },
          ].map((card) => (
            <div key={card.t} className="rounded-2xl border bg-card p-6 shadow-sm">
              <card.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-2">{card.t}</h3>
              <p className="text-sm text-muted-foreground">{card.s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-semibold">Ready to lift ARR by 10–20%?</h2>
          <p className="mt-2 text-muted-foreground">
            Launch a microsite with TrainU embeds and keep your brand front-and-center.
          </p>
          <div className="mt-6">
            <Button size="lg" onClick={() => router.push("/discover")} className="gap-2">
              Book a Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CSS Self-Test Badge */}
      <div data-css-check className="fixed bottom-3 right-3 rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground shadow">
        CSS OK
      </div>
    </main>
  );
}
