"use client";

import { Button } from "@trainu/ui";
import { MapPin, Star, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Trainer } from "../../../../lib/server/queries";

interface TrainerProfileClientProps {
  trainer: Trainer;
}

export default function TrainerProfileClient({ trainer }: TrainerProfileClientProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Link href="/directory" className="inline-block mb-6">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Button>
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-start gap-6">
            <div className="aspect-square w-32 h-32 bg-secondary rounded-xl overflow-hidden">
              <img
                src={trainer.avatar_url || trainer.image || "/placeholder-trainer.jpg"}
                alt={trainer.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{trainer.name}</h1>
                {trainer.verified && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <p className="text-xl text-muted-foreground mb-3">{trainer.title}</p>
              
              <div className="flex items-center gap-1 text-muted-foreground mb-3">
                <MapPin className="h-4 w-4" />
                <span>{trainer.city && trainer.state ? `${trainer.city}, ${trainer.state}` : trainer.location}</span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                  <span className="font-semibold">{trainer.rating || "N/A"}</span>
                </div>
                <span className="text-muted-foreground">
                  {trainer.clients || 0} clients
                </span>
                <span className="text-muted-foreground">
                  {trainer.sessions || 0} sessions
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {(trainer.specialties || []).map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h2 className="text-xl font-bold mb-4 text-foreground">About</h2>
            <p className="text-muted-foreground leading-relaxed">
              {trainer.bio || "No bio available for this trainer."}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{trainer.rating || "N/A"}</div>
              <div className="text-sm text-muted-foreground">Rating</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{trainer.clients || 0}</div>
              <div className="text-sm text-muted-foreground">Clients</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{trainer.sessions || 0}</div>
              <div className="text-sm text-muted-foreground">Sessions</div>
            </div>
            <div className="bg-card p-4 rounded-lg border border-border text-center">
              <div className="text-2xl font-bold text-foreground">{(trainer.specialties || []).length}</div>
              <div className="text-sm text-muted-foreground">Specialties</div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Book Session */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-4 text-foreground">Book a Session</h3>
            <p className="text-muted-foreground mb-4">
              Ready to start your fitness journey with {trainer.name}?
            </p>
            <Button className="w-full" size="lg">
              Book Session
            </Button>
          </div>

          {/* Contact Info */}
          <div className="bg-card p-6 rounded-xl border border-border">
            <h3 className="text-lg font-bold mb-4 text-foreground">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{trainer.city && trainer.state ? `${trainer.city}, ${trainer.state}` : trainer.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>{trainer.rating || "N/A"} rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
