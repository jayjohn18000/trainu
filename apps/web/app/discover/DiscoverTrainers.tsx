"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Star, MapPin, MessageCircle, Calendar } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";

interface Trainer {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  bio: string;
  avatarUrl?: string;
  responseTime: string;
  clientsTrained: number;
  yearsExperience: number;
  sessions: number;
  averageRating: number;
  certifications: Array<{
    name: string;
    organization: string;
    year: number;
  }>;
  availability: {
    days: string[];
    hours: string[];
  };
}

export function DiscoverTrainers() {
  const { user } = useAuthStore();
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [searchQuery, trainers]);

  const loadTrainers = async () => {
    // Mock data - replace with actual API call
    const mockTrainers: Trainer[] = [
      {
        id: "1",
        name: "Jordan Kim",
        location: "Chicago, IL",
        rating: 5,
        reviewCount: 156,
        specialties: ["Powerlifting", "Olympic Lifting", "Strength"],
        bio: "National-level powerlifter. Specializing in barbell training and competition prep for strength athletes.",
        avatarUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face",
        responseTime: "Within 1 hour",
        clientsTrained: 85,
        yearsExperience: 12,
        sessions: 3200,
        averageRating: 5,
        certifications: [
          { name: "USA Powerlifting Coach", organization: "USA Powerlifting", year: 2015 },
          { name: "USAW Level 1 Sports Performance Coach", organization: "USA Weightlifting", year: 2017 }
        ],
        availability: {
          days: ["Monday", "Wednesday", "Friday", "Saturday"],
          hours: ["5:00 AM - 12:00 PM", "3:00 PM - 7:00 PM"]
        }
      },
      {
        id: "2",
        name: "Alex Carter",
        location: "Chicago, IL",
        rating: 4.9,
        reviewCount: 127,
        specialties: ["Strength Training", "Mobility", "Athletic Performance"],
        bio: "Former collegiate athlete with 8+ years experience. I focus on sustainable strength building and injury prevention through mobility work.",
        avatarUrl: "https://images.unsplash.com/photo-1594824388855-889c4fd4d8b9?w=150&h=150&fit=crop&crop=face",
        responseTime: "Within 2 hours",
        clientsTrained: 65,
        yearsExperience: 8,
        sessions: 2100,
        averageRating: 4.9,
        certifications: [
          { name: "CSCS", organization: "NSCA", year: 2016 }
        ],
        availability: {
          days: ["Tuesday", "Thursday", "Saturday", "Sunday"],
          hours: ["6:00 AM - 2:00 PM"]
        }
      },
      {
        id: "3",
        name: "Morgan Lee",
        location: "Chicago, IL",
        rating: 4.9,
        reviewCount: 203,
        specialties: ["CrossFit", "Endurance", "Group Training"],
        bio: "CrossFit Level 2 coach. Building resilient athletes through varied functional fitness programming.",
        avatarUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        responseTime: "Within 30 minutes",
        clientsTrained: 120,
        yearsExperience: 6,
        sessions: 2800,
        averageRating: 4.9,
        certifications: [
          { name: "CrossFit Level 2", organization: "CrossFit", year: 2018 }
        ],
        availability: {
          days: ["Monday", "Wednesday", "Friday"],
          hours: ["5:30 AM - 9:00 AM", "4:00 PM - 8:00 PM"]
        }
      }
    ];

    setTrainers(mockTrainers);
  };

  const filterTrainers = () => {
    if (!searchQuery.trim()) {
      setFilteredTrainers(trainers);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = trainers.filter(
      (trainer) =>
        trainer.name.toLowerCase().includes(query) ||
        trainer.specialties.some((specialty) =>
          specialty.toLowerCase().includes(query)
        ) ||
        trainer.bio.toLowerCase().includes(query) ||
        trainer.location.toLowerCase().includes(query)
    );

    setFilteredTrainers(filtered);
  };

  const handleViewProfile = (trainer: Trainer) => {
    toast({
      title: "Viewing Profile",
      description: `Opening ${trainer.name}'s profile...`
    });
  };

  const handleMessage = (trainer: Trainer) => {
    toast({
      title: "Send Message",
      description: `Starting conversation with ${trainer.name}...`
    });
  };

  const handleBookNow = (trainer: Trainer) => {
    toast({
      title: "Book Session",
      description: `Opening booking calendar for ${trainer.name}...`
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Discover Trainers</h1>
        <p className="text-muted-foreground">
          Find the perfect trainer for your fitness goals
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, specialty, bio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredTrainers.length} trainers
      </p>

      {/* Trainers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="p-6 space-y-4">
              {/* Trainer Header */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={trainer.avatarUrl} />
                  <AvatarFallback>
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{trainer.name}</h3>
                    <div className="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {trainer.location}
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{trainer.rating}</span>
                    <span className="text-muted-foreground">({trainer.reviewCount})</span>
                  </div>
                </div>
              </div>

              {/* Specialties */}
              <div className="flex flex-wrap gap-1">
                {trainer.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>

              {/* Bio */}
              <p className="text-sm text-muted-foreground line-clamp-3">
                {trainer.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{trainer.clientsTrained}+</div>
                  <div className="text-xs text-muted-foreground">Clients</div>
                </div>
                <div className="text-center p-2 bg-muted rounded">
                  <div className="font-semibold">{trainer.yearsExperience}</div>
                  <div className="text-xs text-muted-foreground">Years Exp</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleMessage(trainer)}
                >
                  <MessageCircle className="h-4 w-4" />
                  Message
                </Button>
                <Button
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => handleBookNow(trainer)}
                >
                  <Calendar className="h-4 w-4" />
                  Book Now
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredTrainers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            No trainers found matching your search criteria.
          </div>
        </div>
      )}
    </div>
  );
}
