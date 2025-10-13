"use client";

import { sleep } from './utils';
import type {
  User, Post, Comment, Reaction, Event, EventRegistration,
  Goal, GoalEntry, Session, InboxDraft, ClientProgress
} from './types';

// Mock API functions with Promise-based latency
const mockDelay = () => sleep(200 + Math.random() * 300);

// ==================== USER API ====================

export async function getUser(id: string): Promise<User | null> {
  await mockDelay();
  // This will be handled by the store
  return null;
}

export async function getCurrentUser(): Promise<User | null> {
  await mockDelay();
  // This will be handled by the store
  return null;
}

// ==================== COMMUNITY API ====================

export async function getPosts(): Promise<Post[]> {
  await mockDelay();
  // This will be handled by the store
  return [];
}

export async function createPost(post: Omit<Post, 'id' | 'createdAt'>): Promise<Post> {
  await mockDelay();
  const newPost: Post = {
    ...post,
    id: `post-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newPost;
}

export async function addComment(comment: Omit<Comment, 'id' | 'createdAt'>): Promise<Comment> {
  await mockDelay();
  const newComment: Comment = {
    ...comment,
    id: `comment-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newComment;
}

export async function addReaction(reaction: Omit<Reaction, 'id'>): Promise<Reaction> {
  await mockDelay();
  const newReaction: Reaction = {
    ...reaction,
    id: `reaction-${Date.now()}`,
  };
  return newReaction;
}

export async function removeReaction(postId: string, userId: string): Promise<void> {
  await mockDelay();
  // This will be handled by the store
}

// ==================== EVENTS API ====================

export async function getEvents(): Promise<Event[]> {
  await mockDelay();
  // This will be handled by the store
  return [];
}

export async function getEvent(id: string): Promise<Event | null> {
  await mockDelay();
  // This will be handled by the store
  return null;
}

export async function registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
  await mockDelay();
  const registration: EventRegistration = {
    id: `reg-${Date.now()}`,
    eventId,
    userId,
    registeredAt: new Date().toISOString(),
  };
  return registration;
}

export async function isRegisteredForEvent(eventId: string, userId: string): Promise<boolean> {
  await mockDelay();
  // This will be handled by the store
  return false;
}

// ==================== GOALS & PROGRESS API ====================

export async function getGoals(userId: string): Promise<Goal[]> {
  await mockDelay();
  // This will be handled by the store
  return [];
}

export async function createGoalEntry(entry: Omit<GoalEntry, 'id'>): Promise<GoalEntry> {
  await mockDelay();
  const newEntry: GoalEntry = {
    ...entry,
    id: `entry-${Date.now()}`,
  };
  return newEntry;
}

export async function updateGoalEntry(entry: GoalEntry): Promise<GoalEntry> {
  await mockDelay();
  return entry;
}

export async function getClientProgress(userId: string): Promise<ClientProgress | null> {
  await mockDelay();
  // This will be handled by the store
  return null;
}

// ==================== SESSIONS API ====================

export async function getNextSession(userId: string): Promise<Session | null> {
  await mockDelay();
  // This will be handled by the store
  return null;
}

export async function updateSession(session: Session): Promise<Session> {
  await mockDelay();
  return session;
}

// ==================== INBOX API ====================

export async function getInboxDrafts(status?: string): Promise<InboxDraft[]> {
  await mockDelay();
  // This will be handled by the store
  return [];
}

export async function updateInboxDraft(draft: InboxDraft): Promise<InboxDraft> {
  await mockDelay();
  return draft;
}

export async function createInboxDraft(draft: Omit<InboxDraft, 'id' | 'createdAt'>): Promise<InboxDraft> {
  await mockDelay();
  const newDraft: InboxDraft = {
    ...draft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return newDraft;
}

export async function generateSampleDrafts(): Promise<InboxDraft[]> {
  await mockDelay();
  const sampleDrafts: Omit<InboxDraft, 'id' | 'createdAt'>[] = [
    {
      triggerType: 'milestone',
      targetUserId: 'user-client-1',
      subject: 'Congratulations on your milestone!',
      previewText: 'Amazing work on reaching your fitness milestone...',
      fullContent: 'Amazing work on reaching your fitness milestone! Keep up the great progress!',
      status: 'needs_review',
    },
    {
      triggerType: 'no_show_recovery',
      targetUserId: 'user-client-2',
      subject: 'We missed you today',
      previewText: 'We noticed you missed your session today...',
      fullContent: 'We noticed you missed your session today. No worries - let\'s reschedule and get back on track!',
      status: 'needs_review',
    },
  ];
  
  return sampleDrafts.map(draft => ({
    ...draft,
    id: `draft-${Date.now()}-${Math.random()}`,
    createdAt: new Date().toISOString(),
  }));
}

// ==================== MOCK ACTIONS ====================

export interface MockPurchaseParams {
  userId: string;
  productName: string;
  amount: number;
  source?: 'whop' | 'stripe' | 'affiliate';
  isAffiliate?: boolean;
}

export interface MockBookParams {
  userId: string;
  trainerId: string;
  date: string;
  time: string;
  type: string;
}

export interface MockAttendParams {
  sessionId: string;
}

export interface AffiliatePurchaseRow {
  userId: string;
  productName: string;
  amount: number;
  date: string;
}

export async function mockPurchase(params: MockPurchaseParams) {
  await mockDelay();
  
  const purchase = {
    id: `purchase-${Date.now()}`,
    userId: params.userId,
    productId: `product-${Date.now()}`,
    productName: params.productName,
    amount: params.amount,
    source: params.source || 'whop',
    status: 'paid' as const,
    purchasedAt: new Date().toISOString(),
    isAffiliate: params.isAffiliate || false,
  };

  // Also create/update membership
  const membership = {
    id: `membership-${params.userId}`,
    userId: params.userId,
    active: true,
    startedAt: new Date().toISOString(),
  };

  // Generate Welcome draft
  const welcomeDraft: Omit<InboxDraft, 'id' | 'createdAt'> = {
    triggerType: 'welcome',
    targetUserId: params.userId,
    subject: 'Welcome to TrainU!',
    previewText: `Welcome! We're excited to have you on board...`,
    fullContent: `Welcome to TrainU! We're excited to have you on board. Your journey to better fitness starts now! You've purchased: ${params.productName}`,
    status: 'needs_review',
  };

  const draft = {
    ...welcomeDraft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  return { purchase, membership, draft };
}

export async function mockBook(params: MockBookParams) {
  await mockDelay();
  
  const session = {
    id: `session-${Date.now()}`,
    trainerId: params.trainerId,
    clientId: params.userId,
    date: params.date,
    time: params.time,
    status: 'booked' as const,
    type: params.type,
  };

  // Generate Pre-session draft (24h before)
  const preSessionDate = new Date(params.date);
  preSessionDate.setHours(preSessionDate.getHours() - 24);
  
  const preSessionDraft: Omit<InboxDraft, 'id' | 'createdAt'> = {
    triggerType: 'pre_session',
    targetUserId: params.userId,
    subject: 'Your session is coming up!',
    previewText: `Reminder: Your ${params.type} session is tomorrow...`,
    fullContent: `Reminder: Your ${params.type} session is scheduled for ${params.date} at ${params.time}. Please arrive 10 minutes early!`,
    status: 'needs_review',
    scheduledFor: preSessionDate.toISOString(),
  };

  const draft = {
    ...preSessionDraft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  return { session, draft };
}

export async function mockAttend(params: MockAttendParams) {
  await mockDelay();
  
  return {
    sessionId: params.sessionId,
    status: 'completed' as const,
    completedAt: new Date().toISOString(),
  };
}

export async function mockNoShow(params: MockAttendParams) {
  await mockDelay();
  
  // Generate No-show recovery draft
  const recoveryDraft: Omit<InboxDraft, 'id' | 'createdAt'> = {
    triggerType: 'no_show_recovery',
    targetUserId: 'temp', // Will be filled by caller
    subject: 'We missed you today',
    previewText: 'We noticed you missed your session today...',
    fullContent: 'We noticed you missed your session today. No worries - life happens! Let\'s reschedule and get back on track.',
    status: 'needs_review',
  };

  const draft = {
    ...recoveryDraft,
    id: `draft-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  return {
    sessionId: params.sessionId,
    status: 'no_show' as const,
    draft,
  };
}

export async function mockAffiliateCsvImport(rows: AffiliatePurchaseRow[]) {
  await mockDelay();
  
  const purchases = rows.map((row, idx) => ({
    id: `purchase-affiliate-${Date.now()}-${idx}`,
    userId: row.userId,
    productId: `product-affiliate-${Date.now()}-${idx}`,
    productName: row.productName,
    amount: row.amount,
    source: 'affiliate' as const,
    status: 'paid' as const,
    purchasedAt: row.date,
    isAffiliate: true,
  }));

  return purchases;
}