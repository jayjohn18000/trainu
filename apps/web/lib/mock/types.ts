// ==================== CORE TYPES ====================

export type UserRole = 'owner' | 'trainer' | 'client' | 'gym_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isMember?: boolean;
}

// ==================== COMMUNITY ====================

export type PostType = 'announcement' | 'thread';

export interface Post {
  id: string;
  type: PostType;
  authorId: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  isPinned?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
}

export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string;
}

// ==================== EVENTS ====================

export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  capacity: number;
  ticketUrl: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
}

// ==================== GOALS & PROGRESS ====================

export interface Goal {
  id: string;
  userId: string;
  name: string;
  unit: string;
  target: number;
  isActive: boolean;
  createdAt: string;
}

export type CheckInType = 'completed' | 'partial' | 'missed';
export type RPELevel = 'hard' | 'right' | 'light';

export interface GoalEntry {
  id: string;
  goalId: string;
  userId: string;
  type: CheckInType;
  rpe?: RPELevel;
  notes?: string;
  date: string;
}

export interface Session {
  id: string;
  trainerId: string;
  clientId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  type: string;
}

export interface ClientProgress {
  userId: string;
  weeklyTarget: number;
  completedThisWeek: number;
  streak: number;
  lastCheckIn?: string;
}

// ==================== AI INBOX ====================

export type InboxTriggerType = 
  | 'welcome' 
  | 'streak_protect' 
  | 'pre_session' 
  | 'no_show_recovery' 
  | 'milestone';

export type InboxStatus = 'needs_review' | 'scheduled' | 'sent' | 'rejected';

export interface InboxDraft {
  id: string;
  triggerType: InboxTriggerType;
  targetUserId: string;
  subject: string;
  previewText: string;
  fullContent: string;
  status: InboxStatus;
  createdAt: string;
  scheduledFor?: string;
  sentAt?: string;
}

// ==================== ANALYTICS ====================

export interface MetricSnapshot {
  date: string;
  paidToBooked72h: number;
  showRate: number;
  newMembers: number;
  affiliateGMV: number;
  creatorROI: number;
}

export interface MetricsTiles {
  paidToBooked72h: number;
  showRate: number;
  newMembers: number;
  affiliateGMV: number;
  creatorROI: number;
}

export interface TrendData {
  date: string;
  value: number;
}
