"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { registerForEvent, isRegisteredForEvent } from "@/lib/mock/api";

export default function BetaEvents() {
  const { state, dispatch } = useMockStore();
  const [registering, setRegistering] = useState<string | null>(null);

  const currentUser = state.currentUser;

  const handleRegisterForEvent = async (eventId: string) => {
    if (!currentUser) return;

    setRegistering(eventId);
    
    try {
      const registration = await registerForEvent(eventId, currentUser.id);
      dispatch({ type: 'REGISTER_EVENT', payload: registration });
    } catch (error) {
      console.error('Failed to register for event:', error);
    } finally {
      setRegistering(null);
    }
  };

  const isRegistered = (eventId: string) => {
    if (!currentUser) return false;
    return state.eventRegistrations.some(
      reg => reg.eventId === eventId && reg.userId === currentUser.id
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Events</h1>
        <p className="text-muted-foreground">Discover and join upcoming fitness events</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {state.events.map((event) => {
          const registered = isRegistered(event.id);
          const isRegistering = registering === event.id;

          return (
            <Card key={event.id} className="overflow-hidden">
              {event.imageUrl && (
                <div className="h-48 bg-muted">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold">{event.title}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatTime(event.time)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {event.capacity} spots available
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="text-2xl font-bold text-primary">
                    ${event.price}
                  </div>
                  
                  {registered ? (
                    <Badge variant="default" className="gap-1">
                      <Calendar className="h-3 w-3" />
                      Registered
                    </Badge>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRegisterForEvent(event.id)}
                        disabled={isRegistering}
                        className="gap-1"
                      >
                        {isRegistering ? 'Registering...' : 'Buy Ticket'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(event.ticketUrl, '_blank')}
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {state.events.length === 0 && (
        <Card className="p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
          <p className="text-muted-foreground">
            Check back later for upcoming fitness events and workshops.
          </p>
        </Card>
      )}
    </div>
  );
}
