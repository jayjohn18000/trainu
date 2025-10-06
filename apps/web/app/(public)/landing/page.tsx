"use client";

import { Button } from "@trainu/ui";
import { useRouter } from "next/navigation";
import { Dumbbell, Calendar, Users, TrendingUp, ArrowRight } from "lucide-react";

export default function Landing() {
  const router = useRouter();

  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Book sessions, manage availability, and sync with your calendar",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Connect with trainers, join groups, and share your journey",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Log workouts, track metrics, and visualize your growth",
    },
    {
      icon: Dumbbell,
      title: "Custom Programs",
      description: "Get personalized training programs from certified trainers",
    },
  ];

  return (
    <div className="min-h-screen hero-gradient">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 sm:pt-20 pb-12 sm:pb-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
            <span className="text-primary">Train</span>
            <span className="text-foreground">U</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect with certified trainers. Track your progress. Achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" onClick={() => router.push("/directory")} className="gap-2 px-8 py-3 text-base w-full sm:w-auto btn-primary">
              Find a Trainer
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/dashboard/client")} className="px-8 py-3 text-base w-full sm:w-auto btn-outline">
              View Demo Dashboard
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mt-16 sm:mt-20">
          {features.map((feature) => (
            <div key={feature.title} className="feature-card">
              <feature.icon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mb-4 sm:mb-6" />
              <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 sm:mt-20 text-center bg-card p-8 sm:p-12 rounded-xl border border-border">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground">Ready to start your journey?</h2>
          <p className="text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Join thousands of clients and trainers using TrainU to achieve their fitness goals
          </p>
          <Button size="lg" onClick={() => router.push("/directory")} className="gap-2 px-8 py-3 text-base btn-primary">
            Discover Trainers
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
