"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Heart, MessageCircle, Share, Image as ImageIcon } from "lucide-react";
import { useMockStore } from "@/lib/mock/store";
import { createPost, addComment, addReaction, removeReaction } from "@/lib/mock/api";

export default function BetaCommunity() {
  const { state, dispatch } = useMockStore();
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<'thread' | 'announcement'>('thread');
  const [commentContent, setCommentContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const currentUser = state.currentUser;
  const isMember = currentUser?.isMember ?? false;

  // Sort posts: announcements first (pinned), then by date
  const sortedPosts = [...state.posts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !currentUser) return;

    const newPost = await createPost({
      type: newPostType,
      authorId: currentUser.id,
      content: newPostContent,
    });

    dispatch({ type: 'ADD_POST', payload: newPost });
    setNewPostContent("");
  };

  const handleAddComment = async (postId: string) => {
    if (!commentContent.trim() || !currentUser) return;

    const newComment = await addComment({
      postId,
      authorId: currentUser.id,
      content: commentContent,
    });

    dispatch({ type: 'ADD_COMMENT', payload: newComment });
    setCommentContent("");
    setReplyingTo(null);
  };

  const handleToggleReaction = async (postId: string, emoji: string) => {
    if (!currentUser) return;

    const existingReaction = state.reactions.find(
      r => r.postId === postId && r.userId === currentUser.id
    );

    if (existingReaction) {
      await removeReaction(postId, currentUser.id);
      dispatch({ type: 'REMOVE_REACTION', payload: { postId, userId: currentUser.id } });
    } else {
      const newReaction = await addReaction({
        postId,
        userId: currentUser.id,
        emoji,
      });
      dispatch({ type: 'ADD_REACTION', payload: newReaction });
    }
  };

  const getUserName = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getUserAvatar = (userId: string) => {
    const user = state.users.find(u => u.id === userId);
    return user?.avatarUrl || '/lovable/placeholder.svg';
  };

  const getPostReactions = (postId: string) => {
    const reactions = state.reactions.filter(r => r.postId === postId);
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return reactionCounts;
  };

  const getPostComments = (postId: string) => {
    return state.comments.filter(c => c.postId === postId);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Community</h1>
        <p className="text-muted-foreground">Connect with trainers and clients</p>
      </div>

      {/* Membership Gating */}
      {!isMember && (
        <Card className="p-6 bg-warning-muted border-warning">
          <div className="flex items-center gap-2 text-warning">
            <Pin className="h-5 w-5" />
            <span className="font-medium">Read-only Mode</span>
          </div>
          <p className="text-warning mt-2">
            Become a member to post and interact with the community.
          </p>
        </Card>
      )}

      {/* Post Composer */}
      {isMember && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={newPostType === 'thread' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewPostType('thread')}
              >
                Thread
              </Button>
              <Button
                variant={newPostType === 'announcement' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setNewPostType('announcement')}
              >
                Announcement
              </Button>
            </div>
            <Textarea
              placeholder="What's on your mind?"
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
              <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                Post
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Feed */}
      <div className="space-y-6">
        {sortedPosts.map((post) => {
          const authorName = getUserName(post.authorId);
          const authorAvatar = getUserAvatar(post.authorId);
          const reactions = getPostReactions(post.id);
          const comments = getPostComments(post.id);

          return (
            <Card key={post.id} className="p-6">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{authorName}</span>
                    <Badge variant={post.type === 'announcement' ? 'default' : 'secondary'}>
                      {post.type}
                    </Badge>
                    {post.isPinned && (
                      <Badge variant="outline" className="gap-1">
                        <Pin className="h-3 w-3" />
                        Pinned
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-foreground">{post.content}</p>
                  
                  {post.imageUrl && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt="Post image" 
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-4">
                    {Object.entries(reactions).map(([emoji, count]) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleToggleReaction(post.id, emoji)}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleReaction(post.id, '❤️')}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {comments.length}
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Comments */}
                  {comments.length > 0 && (
                    <div className="space-y-3 pt-3 border-t">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getUserAvatar(comment.authorId)} />
                            <AvatarFallback>{getUserName(comment.authorId).charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{getUserName(comment.authorId)}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-foreground">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Input */}
                  {replyingTo === post.id && isMember && (
                    <div className="pt-3 border-t">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a comment..."
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentContent.trim()}
                        >
                          Comment
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
