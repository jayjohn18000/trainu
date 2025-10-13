"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquare, Heart, Image as ImageIcon, Pin } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  type: "thread" | "announcement";
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  reactions: number;
  comments: number;
}

interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
}

export function CommunityFeed() {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Map<string, Comment[]>>(new Map());
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    // Mock data - replace with actual API call
    const mockPosts: Post[] = [
      {
        id: "1",
        type: "announcement",
        authorId: "admin-1",
        authorName: "Alex Johnson",
        authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        content: "Welcome to our new community platform! Share your wins, ask questions, and connect with fellow members. 🎉",
        createdAt: "2024-10-01T10:00:00Z",
        reactions: 12,
        comments: 5
      },
      {
        id: "2",
        type: "thread",
        authorId: "user-1",
        authorName: "Emily Davis",
        authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        content: "Question for the group: What are your favorite pre-workout meals?",
        createdAt: "2024-10-06T14:30:00Z",
        reactions: 8,
        comments: 12
      },
      {
        id: "3",
        type: "thread",
        authorId: "user-2",
        authorName: "Mike Rodriguez",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        content: "Just hit a new PR on deadlifts! 405lbs 💪 Feeling stronger every week!",
        createdAt: "2024-10-05T16:45:00Z",
        reactions: 15,
        comments: 7
      }
    ];

    setPosts(mockPosts);
  };

  const handleCreatePost = async () => {
    if (!user || !newPostContent.trim()) return;
    
    const isPrivileged = user.role === 'trainer' || user.role === 'gym_admin';
    if (!user.isMember && !isPrivileged) {
      toast({
        title: "Membership required",
        description: "You need to be a member to post in the community.",
        variant: "destructive",
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      type: (isAnnouncement && user.role === 'gym_admin') ? 'announcement' : 'thread',
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      content: newPostContent,
      imageUrl: newPostImage || undefined,
      createdAt: new Date().toISOString(),
      reactions: 0,
      comments: 0
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setNewPostImage("");
    setIsAnnouncement(false);
    setShowComposer(false);
    
    toast({
      title: "Posted!",
      description: "Your post has been shared with the community.",
    });
  };

  const handleReaction = async (postId: string) => {
    if (!user) return;
    
    // Mock reaction toggle
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, reactions: post.reactions + 1 }
        : post
    ));
    
    toast({
      title: "Reaction added",
      description: "Thanks for engaging with the community!"
    });
  };

  const handleComment = async (postId: string, content: string) => {
    if (!user || !content.trim()) return;
    
    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      content,
      createdAt: new Date().toISOString()
    };

    setComments(prev => {
      const newComments = new Map(prev);
      const existingComments = newComments.get(postId) || [];
      newComments.set(postId, [...existingComments, newComment]);
      return newComments;
    });

    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    ));
  };

  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  const canPost = user && (user.isMember || user.role === 'trainer' || user.role === 'gym_admin');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Community</h1>
          <p className="text-muted-foreground">Connect with fellow members</p>
        </div>
        {canPost && (
          <Dialog open={showComposer} onOpenChange={setShowComposer}>
            <DialogTrigger asChild>
              <Button>New Post</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Post</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={4}
                />
                <Input
                  placeholder="Image URL (optional)"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                />
                {user?.role === 'gym_admin' && (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isAnnouncement}
                      onChange={(e) => setIsAnnouncement(e.target.checked)}
                      className="rounded"
                    />
                    Post as announcement
                  </label>
                )}
                <Button onClick={handleCreatePost} className="w-full">
                  Post
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Membership Notice */}
      {!canPost && (
        <Card className="p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
          <p className="text-sm text-amber-900 dark:text-amber-100">
            Membership required for posting. You can read posts but need to be a member to participate.
          </p>
        </Card>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => {
          const postComments = comments.get(post.id) || [];
          const isExpanded = expandedPosts.has(post.id);

          return (
            <Card key={post.id} className="p-6">
              <div className="space-y-4">
                {/* Post Header */}
                <div className="flex items-start gap-3">
                  <Avatar>
                    <AvatarImage src={post.authorAvatar} />
                    <AvatarFallback>{post.authorName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{post.authorName}</span>
                      {post.type === 'announcement' && (
                        <Badge variant="secondary" className="gap-1">
                          <Pin className="h-3 w-3" />
                          Announcement
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
                
                {/* Post Image */}
                {post.imageUrl && (
                  <img 
                    src={post.imageUrl} 
                    alt="Post image" 
                    className="rounded-lg max-h-96 object-cover w-full"
                  />
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction(post.id)}
                    className="gap-1"
                  >
                    <Heart className="h-4 w-4" />
                    {post.reactions > 0 && post.reactions}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePostExpansion(post.id)}
                    className="gap-1"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {post.comments > 0 && post.comments}
                  </Button>
                </div>

                {/* Comments Section */}
                {isExpanded && (
                  <div className="space-y-3 pt-3 border-t">
                    {postComments.map(comment => (
                      <div key={comment.id} className="flex gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorAvatar} />
                          <AvatarFallback>
                            {comment.authorName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <p className="text-sm font-medium">{comment.authorName}</p>
                          <p className="text-sm text-foreground">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                    
                    {canPost && (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment(post.id, e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to start a conversation!</p>
        </div>
      )}
    </div>
  );
}
