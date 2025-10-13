"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Calendar, MapPin, Users } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  spots: number;
  price: number;
  imageUrl: string;
  category: string;
}

export function CommunityEvents() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    // Mock data - replace with actual API call
    const mockEvents: Event[] = [
      {
        id: "1",
        title: "Summer Strength Challenge",
        description: "Join us for our annual strength challenge! Test your 1RM on the big 3 lifts.",
        date: "2024-10-20",
        time: "10:00 AM",
        location: "Main Gym",
        spots: 50,
        price: 25,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop",
        category: "Competition"
      },
      {
        id: "2",
        title: "Nutrition Workshop with Dr. Smith",
        description: "Learn the fundamentals of sports nutrition and meal planning for optimal performance.",
        date: "2024-10-27",
        time: "6:00 PM",
        location: "Conference Room A",
        spots: 30,
        price: 15,
        imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=200&fit=crop",
        category: "Workshop"
      }
    ];

    setEvents(mockEvents);
  };

  const handleBuyTicket = (event: Event) => {
    toast({
      title: "Buy Ticket",
      description: `Redirecting to purchase ${event.title} ticket...`
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Community Events</h1>
        <p className="text-muted-foreground">
          Join us for workshops, challenges, and social gatherings
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map(event => (
          <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="relative">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-48 object-cover"
              />
              <Badge className="absolute top-3 left-3 bg-black/70 text-white">
                {event.category}
              </Badge>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-muted-foreground line-clamp-3">
                  {event.description}
                </p>
              </div>

              {/* Event Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(event.date)} at {event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{event.spots} spots available</span>
                </div>
              </div>

              {/* Price and Action */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-2xl font-bold">${event.price}</div>
                <Button 
                  onClick={() => handleBuyTicket(event)}
                  className="gap-2"
                >
                  Buy Ticket
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">Check back soon for upcoming community events!</p>
        </div>
      )}
    </div>
  );
}
