"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Heart, Pin, Plus } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store/useAuthStore";

type Post = {
  id: string;
  type: "announcement" | "thread";
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isPinned?: boolean;
  likes: number;
  comments: number;
};

// Mock data - replace with actual API call
const mockPosts: Post[] = [
  {
    id: "1",
    type: "announcement",
    authorId: "trainer-1",
    authorName: "Sarah Chen",
    authorAvatar: "https://i.pravatar.cc/150?img=1",
    content: "🎉 New workout program launching next week! Get ready to level up your training.",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
    likes: 24,
    comments: 5,
  },
  {
    id: "2",
    type: "thread",
    authorId: "client-1",
    authorName: "Mike Johnson",
    authorAvatar: "https://i.pravatar.cc/150?img=12",
    content: "Just hit a new PR on deadlifts! 💪 Thanks to all the trainers for the amazing support.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 18,
    comments: 3,
  },
];

export default function CommunityPage() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast.error("Post content cannot be empty");
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      type: "thread",
      authorId: user?.id || "demo-user",
      authorName: user?.name || "Demo User",
      authorAvatar: user?.avatarUrl,
      content: newPostContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    setShowComposer(false);
    toast.success("Post created successfully!");
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
    toast.success("Post liked!");
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Connect with trainers and fellow athletes</p>
        </div>
        <Dialog open={showComposer} onOpenChange={setShowComposer}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="What's on your mind?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={5}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowComposer(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>Post</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No posts yet"
          description="Be the first to share something with the community"
          action={{
            label: "Create Post",
            onClick: () => setShowComposer(true),
          }}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>
                      {post.authorName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{post.authorName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTimeAgo(post.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.isPinned && (
                    <Badge variant="secondary" className="gap-1">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                  {post.type === "announcement" && (
                    <Badge>Announcement</Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt="Post content"
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleLike(post.id)}
                >
                  <Heart className="h-4 w-4" />
                  {post.likes > 0 && <span>{post.likes}</span>}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {post.comments > 0 && <span>{post.comments}</span>}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

