import type {
  User, Post, Comment, Reaction, Event, EventRegistration,
  Goal, GoalEntry, Session, InboxDraft, MetricSnapshot
} from './types';

const now = new Date();
const today = now.toISOString().split('T')[0];

// ==================== USERS ====================
export const seedUsers: User[] = [
  {
    id: 'user-owner-1',
    name: 'Alex Johnson',
    email: 'alex@trainu.app',
    role: 'owner',
    avatarUrl: '/lovable/placeholder.svg',
    isMember: true,
  },
  {
    id: 'user-trainer-1',
    name: 'Sarah Chen',
    email: 'sarah@trainu.app',
    role: 'trainer',
    avatarUrl: '/lovable/placeholder.svg',
    isMember: true,
  },
  {
    id: 'user-client-1',
    name: 'Mike Rodriguez',
    email: 'mike@trainu.app',
    role: 'client',
    avatarUrl: '/lovable/placeholder.svg',
    isMember: true,
  },
  {
    id: 'user-client-2',
    name: 'Emily Davis',
    email: 'emily@trainu.app',
    role: 'client',
    avatarUrl: '/lovable/placeholder.svg',
    isMember: true,
  },
  {
    id: 'user-client-3',
    name: 'James Wilson',
    email: 'james@trainu.app',
    role: 'client',
    avatarUrl: '/lovable/placeholder.svg',
    isMember: false,
  },
];

// ==================== COMMUNITY ====================
export const seedPosts: Post[] = [
  {
    id: 'post-1',
    type: 'announcement',
    authorId: 'user-owner-1',
    content: 'Welcome to TrainU Beta! This is a preview of our new interface. Please provide feedback on your experience.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isPinned: true,
  },
  {
    id: 'post-2',
    type: 'thread',
    authorId: 'user-trainer-1',
    content: 'Just finished an amazing session with Mike! His progress has been incredible this month. Keep up the great work! 💪',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    type: 'thread',
    authorId: 'user-client-1',
    content: 'Looking for workout partners for weekend hikes. Anyone interested in joining me this Saturday?',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedComments: Comment[] = [
  {
    id: 'comment-1',
    postId: 'post-2',
    authorId: 'user-client-1',
    content: 'Thank you Sarah! Couldn\'t have done it without your guidance.',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'comment-2',
    postId: 'post-3',
    authorId: 'user-client-2',
    content: 'I\'d love to join! What time were you thinking?',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedReactions: Reaction[] = [
  { id: 'reaction-1', postId: 'post-2', userId: 'user-client-1', emoji: '💪' },
  { id: 'reaction-2', postId: 'post-2', userId: 'user-client-2', emoji: '🔥' },
  { id: 'reaction-3', postId: 'post-3', userId: 'user-trainer-1', emoji: '👍' },
];

// ==================== EVENTS ====================
export const seedEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Summer Fitness Challenge',
    description: 'Join us for a 30-day fitness challenge to kick off the summer season!',
    date: '2024-07-15',
    time: '09:00',
    location: 'Central Park',
    price: 25,
    capacity: 50,
    ticketUrl: 'https://example.com/tickets',
  },
  {
    id: 'event-2',
    title: 'Nutrition Workshop',
    description: 'Learn about meal planning and nutrition strategies for optimal performance.',
    date: '2024-07-22',
    time: '18:00',
    location: 'Online',
    price: 15,
    capacity: 100,
    ticketUrl: 'https://example.com/workshop',
  },
];

export const seedEventRegistrations: EventRegistration[] = [
  {
    id: 'reg-1',
    eventId: 'event-1',
    userId: 'user-client-1',
    registeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== GOALS & PROGRESS ====================
export const seedGoals: Goal[] = [
  {
    id: 'goal-1',
    userId: 'user-client-1',
    name: 'Workout Consistency',
    unit: 'sessions',
    target: 4,
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'goal-2',
    userId: 'user-client-2',
    name: 'Weight Loss',
    unit: 'lbs',
    target: 10,
    isActive: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const seedGoalEntries: GoalEntry[] = [
  {
    id: 'entry-1',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'completed',
    rpe: 'hard',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'entry-2',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'completed',
    rpe: 'right',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'entry-3',
    goalId: 'goal-1',
    userId: 'user-client-1',
    type: 'partial',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
];

export const seedSessions: Session[] = [
  {
    id: 'session-1',
    trainerId: 'user-trainer-1',
    clientId: 'user-client-1',
    date: today,
    time: '10:00',
    status: 'scheduled',
    type: 'Personal Training',
  },
  {
    id: 'session-2',
    trainerId: 'user-trainer-1',
    clientId: 'user-client-2',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '14:00',
    status: 'scheduled',
    type: 'Group Class',
  },
];

// ==================== AI INBOX ====================
export const seedInboxDrafts: InboxDraft[] = [
  {
    id: 'draft-1',
    triggerType: 'welcome',
    targetUserId: 'user-client-3',
    subject: 'Welcome to TrainU!',
    previewText: 'Welcome to TrainU! We\'re excited to have you on board...',
    fullContent: 'Welcome to TrainU! We\'re excited to have you on board. Your journey to better fitness starts now!',
    status: 'needs_review',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft-2',
    triggerType: 'streak_protect',
    targetUserId: 'user-client-1',
    subject: 'Keep your streak alive!',
    previewText: 'You\'re on a great streak! Don\'t let it slip...',
    fullContent: 'You\'re on a great streak! Don\'t let it slip. Schedule your next session today!',
    status: 'needs_review',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'draft-3',
    triggerType: 'pre_session',
    targetUserId: 'user-client-1',
    subject: 'Your session is tomorrow!',
    previewText: 'Reminder: Your session with Sarah is tomorrow at 10:00 AM...',
    fullContent: 'Reminder: Your session with Sarah is tomorrow at 10:00 AM. Please arrive 10 minutes early!',
    status: 'scheduled',
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    scheduledFor: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
  },
];

// ==================== METRICS ====================
export const seedMetrics: MetricSnapshot[] = [
  {
    date: '2024-06-01',
    paidToBooked72h: 85,
    showRate: 92,
    newMembers: 12,
    affiliateGMV: 2400,
    creatorROI: 3.2,
  },
  {
    date: '2024-06-02',
    paidToBooked72h: 87,
    showRate: 89,
    newMembers: 8,
    affiliateGMV: 1800,
    creatorROI: 2.8,
  },
  // Add more historical data as needed
];

// ==================== CLIENT PROGRESS ====================
export const seedClientProgress: ClientProgress[] = [
  {
    userId: 'user-client-1',
    weeklyTarget: 4,
    completedThisWeek: 3,
    streak: 2,
    lastCheckIn: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'user-client-2',
    weeklyTarget: 3,
    completedThisWeek: 3,
    streak: 4,
    lastCheckIn: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    userId: 'user-client-3',
    weeklyTarget: 3,
    completedThisWeek: 1,
    streak: 0,
    lastCheckIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
