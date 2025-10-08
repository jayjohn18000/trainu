"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useMockStore } from "@/lib/mock/store";
import { registerForEvent } from "@/lib/mock/api";
import type { Event } from "@/lib/mock/types";

export default function EventDetail() {
  const params = useParams();
  const { state, dispatch } = useMockStore();
  const [event, setEvent] = useState<Event | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const eventId = params.id as string;
    const foundEvent = state.events.find(e => e.id === eventId);
    setEvent(foundEvent || null);
  }, [params.id, state.events]);

  const currentUser = state.currentUser;

  const isRegistered = () => {
    if (!currentUser || !event) return false;
    return state.eventRegistrations.some(
      reg => reg.eventId === event.id && reg.userId === currentUser.id
    );
  };

  const handleRegister = async () => {
    if (!currentUser || !event) return;

    setRegistering(true);
    try {
      const registration = await registerForEvent(event.id, currentUser.id);
      dispatch({ type: 'REGISTER_EVENT', payload: registration });
    } catch (error) {
      console.error('Failed to register for event:', error);
    } finally {
      setRegistering(false);
    }
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

  if (!event) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/beta/events">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
          </Link>
        </div>
        <Card className="p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
        </Card>
      </div>
    );
  }

  const registered = isRegistered();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/beta/events">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Image */}
          {event.imageUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img 
                src={event.imageUrl} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Event Details */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{event.title}</h1>
                <p className="text-muted-foreground text-lg mt-2">
                  {event.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(event.time)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Capacity</p>
                    <p className="text-sm text-muted-foreground">
                      {event.capacity} spots available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration Card */}
          <Card className="p-6 sticky top-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  ${event.price}
                </div>
                <p className="text-sm text-muted-foreground">per ticket</p>
              </div>

              {registered ? (
                <div className="text-center space-y-4">
                  <Badge variant="default" className="gap-1">
                    <Calendar className="h-3 w-3" />
                    You're Registered!
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a confirmation email with event details.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={handleRegister}
                    disabled={registering}
                    className="w-full"
                    size="lg"
                  >
                    {registering ? 'Registering...' : 'Register for Event'}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(event.ticketUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Buy External Ticket
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  By registering, you agree to our terms of service and event policies.
                </p>
              </div>
            </div>
          </Card>

          {/* Event Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Event Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event Type:</span>
                <span>Workshop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>2 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Skill Level:</span>
                <span>All levels</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Equipment:</span>
                <span>Provided</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
