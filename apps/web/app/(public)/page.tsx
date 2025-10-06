import Link from "next/link";
import { ArrowRight, Calendar, Users, TrendingUp, Dumbbell } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* CSS Self-Test Badge */}
      <div data-css-check className="fixed bottom-3 right-3 rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground shadow z-50">
        CSS OK
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-20 radial-gradient pointer-events-none" />
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="flex flex-col items-center text-center gap-6">
            <span className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground bg-card/50">
              Powered by TrainU
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl">
              Mentorship-as-a-Service for <span className="text-primary">Trainers</span>
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              AI-powered coaching agents, smart scheduling, and progress insights—so you can scale
              results without scaling hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Link 
                href="/directory" 
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
              >
                Explore Trainers
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/become-a-trainer" 
                className="inline-flex items-center justify-center rounded-xl border-2 border-border px-6 py-3 text-base font-medium hover:bg-accent hover:border-primary/30 transition-all"
              >
                Become a Trainer
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE STRIP */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { 
                icon: Calendar,
                title: "AI Coaching Agents", 
                subtitle: "Your style, your cues—scaled." 
              },
              { 
                icon: Users,
                title: "Smart Scheduling", 
                subtitle: "Reduce no-shows & idle hours." 
              },
              { 
                icon: TrendingUp,
                title: "Progress Insights", 
                subtitle: "Nudges, milestones, momentum." 
              },
              { 
                icon: Dumbbell,
                title: "Custom Programs", 
                subtitle: "Personalized training at scale." 
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
                  <Icon className="h-10 w-10 text-primary mb-4" />
                  <h3 className="font-semibold text-lg mb-2 text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.subtitle}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to lift ARR by 10–20%?
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Launch a microsite with TrainU embeds and keep your brand front-and-center.
          </p>
          <div className="mt-8">
            <Link 
              href="/book" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-base font-medium text-primary-foreground shadow-md hover:bg-primary/90 transition-all"
            >
              Book a Demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
