"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Users, Search, MapPin, Calendar, MessageCircle, UserPlus } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";

export default function CommunityPeoplePage() {
  const { state } = useMockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const currentUser = state.currentUser;

  // Filter users based on search and role
  const filteredUsers = state.users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    const notCurrentUser = user.id !== currentUser?.id;
    
    return matchesSearch && matchesRole && notCurrentUser;
  });

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      trainer: { label: "Trainer", variant: "default" as const },
      client: { label: "Client", variant: "secondary" as const },
      owner: { label: "Owner", variant: "outline" as const },
      gym_admin: { label: "Gym Admin", variant: "outline" as const },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "secondary" as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">People</h1>
          <p className="text-muted-foreground">Connect with the TrainU community</p>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["all", "trainer", "client", "owner", "gym_admin"].map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role === "all" ? "All" : role.replace("_", " ")}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* People Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="text-center space-y-4">
              <Avatar className="h-20 w-20 mx-auto">
                <AvatarImage src={user.avatarUrl || '/lovable/placeholder.svg'} />
                <AvatarFallback className="text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex justify-center">
                  {getRoleBadge(user.role)}
                </div>
              </div>

              {/* Mock stats for demonstration */}
              <div className="grid grid-cols-2 gap-4 text-center text-sm">
                <div>
                  <div className="font-semibold text-primary">
                    {user.role === 'trainer' ? Math.floor(Math.random() * 50) + 10 : Math.floor(Math.random() * 30) + 5}
                  </div>
                  <div className="text-muted-foreground">
                    {user.role === 'trainer' ? 'Clients' : 'Sessions'}
                  </div>
                </div>
                <div>
                  <div className="font-semibold text-primary">
                    {Math.floor(Math.random() * 100) + 80}%
                  </div>
                  <div className="text-muted-foreground">Rating</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No people found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedRole !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No other community members found."}
          </p>
        </Card>
      )}

      {/* Stats Summary */}
      <Card className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-primary">
              {state.users.filter(u => u.role === 'trainer').length}
            </div>
            <div className="text-sm text-muted-foreground">Trainers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {state.users.filter(u => u.role === 'client').length}
            </div>
            <div className="text-sm text-muted-foreground">Clients</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {state.users.filter(u => u.role === 'owner').length}
            </div>
            <div className="text-sm text-muted-foreground">Owners</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-primary">
              {state.users.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Members</div>
          </div>
        </div>
      </Card>

      {/* Beta Link */}
      <div className="mt-8 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground text-center">
          This is the updated People page. For the latest features, check out{" "}
          <Link href="/beta/community" className="text-primary hover:underline">
            Beta Community
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

