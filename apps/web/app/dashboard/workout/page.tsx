"use client";

import { Dumbbell } from "lucide-react";

export default function WorkoutPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Dumbbell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Workouts</h1>
          <p className="text-muted-foreground">Your training programs and sessions</p>
        </div>
      </div>

      <div className="metric-card p-8 text-center space-y-4">
        <p className="text-lg text-muted-foreground">
          Workout library is under construction
        </p>
        <p className="text-sm text-muted-foreground">
          Coming soon: Program templates, workout logging, exercise library.
        </p>
        <p className="text-xs text-muted-foreground mt-6">
          Track: <code className="bg-muted px-2 py-1 rounded">PF-404-workout</code>
        </p>
      </div>
    </div>
  );
}

