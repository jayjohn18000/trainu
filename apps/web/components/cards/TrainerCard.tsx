"use client";

import Link from "next/link";
import { Button } from "@trainu/ui";
import { Badge } from "../ui/badge";
import { MapPin, Star, CheckCircle2 } from "lucide-react";
import { Trainer } from "../../lib/server/queries";

interface TrainerCardProps {
  trainer: Trainer;
}

export default function TrainerCard({ trainer }: TrainerCardProps) {
  return (
    <div className="metric-card hover:card-elevated transition-all" data-testid="trainer-card">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 bg-secondary rounded-full overflow-hidden flex-shrink-0">
          <img
            src={trainer.avatar_url || trainer.image || "/placeholder-trainer.jpg"}
            alt={trainer.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-foreground truncate">{trainer.name}</h3>
            {trainer.verified && (
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-1">{trainer.title}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{trainer.city && trainer.state ? `${trainer.city}, ${trainer.state}` : trainer.location}</span>
        </div>

        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
          <span className="text-sm font-medium">{trainer.rating || "N/A"}</span>
          <span className="text-sm text-muted-foreground">
            ({trainer.clients || 0} clients)
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(trainer.specialties || []).slice(0, 3).map((specialty) => (
            <Badge key={specialty} variant="secondary">
              {specialty}
            </Badge>
          ))}
        </div>

        <Link href={`/trainers/${trainer.slug}`}>
          <Button className="w-full">View Profile</Button>
        </Link>
      </div>
    </div>
  );
}
