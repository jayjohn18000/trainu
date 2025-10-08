"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { UsersRound, Search, Plus, Calendar, Trophy, Target, MessageCircle, UserPlus } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

// Mock groups data since it's not in the store yet
const mockGroups = [
  {
    id: "group-1",
    name: "Morning Warriors",
    description: "Early bird fitness enthusiasts who start their day with intense workouts",
    memberCount: 24,
    maxMembers: 30,
    category: "Morning Workouts",
    isPrivate: false,
    createdBy: "user-trainer-1",
    createdAt: "2024-01-15",
    challenges: 3,
    discussions: 12,
    avatar: "/lovable/placeholder.svg",
  },
  {
    id: "group-2", 
    name: "Strength Builders",
    description: "Focus on progressive strength training and muscle building techniques",
    memberCount: 18,
    maxMembers: 25,
    category: "Strength Training",
    isPrivate: false,
    createdBy: "user-trainer-2",
    createdAt: "2024-02-01",
    challenges: 2,
    discussions: 8,
    avatar: "/lovable/placeholder.svg",
  },
  {
    id: "group-3",
    name: "Yoga Flow Community",
    description: "Mindful movement and flexibility for all levels",
    memberCount: 32,
    maxMembers: 40,
    category: "Yoga & Flexibility",
    isPrivate: false,
    createdBy: "user-client-1",
    createdAt: "2024-01-20",
    challenges: 1,
    discussions: 15,
    avatar: "/lovable/placeholder.svg",
  },
  {
    id: "group-4",
    name: "Marathon Runners",
    description: "Training for endurance events and long-distance running",
    memberCount: 15,
    maxMembers: 20,
    category: "Endurance",
    isPrivate: true,
    createdBy: "user-trainer-3",
    createdAt: "2024-02-10",
    challenges: 4,
    discussions: 6,
    avatar: "/lovable/placeholder.svg",
  },
];

export default function CommunityGroupsPage() {
  const { state } = useMockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showPrivate, setShowPrivate] = useState(true);

  const currentUser = state.currentUser;

  // Get unique categories
  const categories = ["all", ...Array.from(new Set(mockGroups.map(g => g.category)))];

  // Filter groups
  const filteredGroups = mockGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || group.category === selectedCategory;
    const matchesVisibility = showPrivate || !group.isPrivate;
    
    return matchesSearch && matchesCategory && matchesVisibility;
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getUserName = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UsersRound className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Groups</h1>
          <p className="text-muted-foreground">Join fitness groups and challenges</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === "all" ? "All Categories" : category}
              </Button>
            ))}
            <Button
              variant={showPrivate ? "default" : "outline"}
              size="sm"
              onClick={() => setShowPrivate(!showPrivate)}
            >
              {showPrivate ? "Show All" : "Public Only"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={group.avatar} />
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(group.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <p className="text-sm text-muted-foreground">{group.category}</p>
                  </div>
                </div>
                {group.isPrivate && (
                  <Badge variant="outline" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-primary">{group.memberCount}</div>
                  <div className="text-muted-foreground">Members</div>
                </div>
                <div>
                  <div className="font-semibold text-primary">{group.challenges}</div>
                  <div className="text-muted-foreground">Challenges</div>
                </div>
                <div>
                  <div className="font-semibold text-primary">{group.discussions}</div>
                  <div className="text-muted-foreground">Discussions</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Membership</span>
                  <span>{group.memberCount}/{group.maxMembers}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${Math.round((group.memberCount / group.maxMembers) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-muted-foreground">
                  Created by {getUserName(group.createdBy)}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && (
        <Card className="p-12 text-center">
          <UsersRound className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No groups found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== "all"
              ? "Try adjusting your search or filter criteria."
              : "No groups available yet."}
          </p>
        </Card>
      )}

      {/* Featured Challenges */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Featured Challenges</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">30-Day Fitness Challenge</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Complete 30 minutes of exercise every day for a month
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">47 participants</span>
              <Button size="sm">Join Challenge</Button>
            </div>
          </div>
          <div className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Weekly Group Workouts</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Join our weekly group training sessions every Saturday
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">23 participants</span>
              <Button size="sm">Join Challenge</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Beta Link */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          This is the updated Groups page. For the latest features, check out{" "}
          <Link href="/beta/community" className="text-primary hover:underline">
            Beta Community
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

