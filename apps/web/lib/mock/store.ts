"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import type {
  User, Post, Comment, Reaction, Event, EventRegistration,
  Goal, GoalEntry, Session, InboxDraft, ClientProgress, Purchase, Membership
} from './types';
import {
  seedUsers, seedPosts, seedComments, seedReactions, seedEvents,
  seedEventRegistrations, seedGoals, seedGoalEntries, seedSessions,
  seedInboxDrafts, seedClientProgress, seedPurchases, seedMemberships
} from './seed';

// ==================== STATE TYPES ====================

interface MockState {
  users: User[];
  posts: Post[];
  comments: Comment[];
  reactions: Reaction[];
  events: Event[];
  eventRegistrations: EventRegistration[];
  goals: Goal[];
  goalEntries: GoalEntry[];
  sessions: Session[];
  inboxDrafts: InboxDraft[];
  clientProgress: ClientProgress[];
  purchases: Purchase[];
  memberships: Membership[];
  currentUser: User | null;
}

type MockAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'ADD_REACTION'; payload: Reaction }
  | { type: 'REMOVE_REACTION'; payload: { postId: string; userId: string } }
  | { type: 'REGISTER_EVENT'; payload: EventRegistration }
  | { type: 'ADD_GOAL_ENTRY'; payload: GoalEntry }
  | { type: 'UPDATE_GOAL_ENTRY'; payload: GoalEntry }
  | { type: 'UPDATE_SESSION'; payload: Session }
  | { type: 'ADD_SESSION'; payload: Session }
  | { type: 'UPDATE_INBOX_DRAFT'; payload: InboxDraft }
  | { type: 'ADD_INBOX_DRAFT'; payload: InboxDraft }
  | { type: 'ADD_PURCHASE'; payload: Purchase }
  | { type: 'UPDATE_MEMBERSHIP'; payload: Membership }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_CLIENT_PROGRESS'; payload: ClientProgress }
  | { type: 'RESET_DATA' }
  | { type: 'LOAD_DATA'; payload: MockState };

// ==================== REDUCER ====================

const initialState: MockState = {
  users: [],
  posts: [],
  comments: [],
  reactions: [],
  events: [],
  eventRegistrations: [],
  goals: [],
  goalEntries: [],
  sessions: [],
  inboxDrafts: [],
  clientProgress: [],
  purchases: [],
  memberships: [],
  currentUser: null,
};

function mockReducer(state: MockState, action: MockAction): MockState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    
    case 'ADD_COMMENT':
      return { ...state, comments: [...state.comments, action.payload] };
    
    case 'ADD_REACTION':
      return {
        ...state,
        reactions: state.reactions.filter(
          r => !(r.postId === action.payload.postId && r.userId === action.payload.userId)
        ).concat(action.payload)
      };
    
    case 'REMOVE_REACTION':
      return {
        ...state,
        reactions: state.reactions.filter(
          r => !(r.postId === action.payload.postId && r.userId === action.payload.userId)
        )
      };
    
    case 'REGISTER_EVENT':
      return {
        ...state,
        eventRegistrations: state.eventRegistrations.filter(
          r => !(r.eventId === action.payload.eventId && r.userId === action.payload.userId)
        ).concat(action.payload)
      };
    
    case 'ADD_GOAL_ENTRY':
      return { ...state, goalEntries: [...state.goalEntries, action.payload] };
    
    case 'UPDATE_GOAL_ENTRY':
      return {
        ...state,
        goalEntries: state.goalEntries.map(entry =>
          entry.id === action.payload.id ? action.payload : entry
        )
      };
    
    case 'UPDATE_SESSION':
      return {
        ...state,
        sessions: state.sessions.map(session =>
          session.id === action.payload.id ? action.payload : session
        )
      };
    
    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };
    
    case 'UPDATE_INBOX_DRAFT':
      return {
        ...state,
        inboxDrafts: state.inboxDrafts.map(draft =>
          draft.id === action.payload.id ? action.payload : draft
        )
      };
    
    case 'ADD_INBOX_DRAFT':
      return { ...state, inboxDrafts: [...state.inboxDrafts, action.payload] };
    
    case 'ADD_PURCHASE':
      return { ...state, purchases: [...state.purchases, action.payload] };
    
    case 'UPDATE_MEMBERSHIP':
      return {
        ...state,
        memberships: state.memberships.some(m => m.id === action.payload.id)
          ? state.memberships.map(m => m.id === action.payload.id ? action.payload : m)
          : [...state.memberships, action.payload]
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u => u.id === action.payload.id ? action.payload : u),
        currentUser: state.currentUser?.id === action.payload.id ? action.payload : state.currentUser
      };
    
    case 'UPDATE_CLIENT_PROGRESS':
      return {
        ...state,
        clientProgress: state.clientProgress.some(cp => cp.userId === action.payload.userId)
          ? state.clientProgress.map(cp => cp.userId === action.payload.userId ? action.payload : cp)
          : [...state.clientProgress, action.payload]
      };
    
    case 'RESET_DATA':
      return {
        ...initialState,
        users: seedUsers,
        posts: seedPosts,
        comments: seedComments,
        reactions: seedReactions,
        events: seedEvents,
        eventRegistrations: seedEventRegistrations,
        goals: seedGoals,
        goalEntries: seedGoalEntries,
        sessions: seedSessions,
        inboxDrafts: seedInboxDrafts,
        clientProgress: seedClientProgress,
        purchases: seedPurchases,
        memberships: seedMemberships,
        currentUser: seedUsers[0], // Default to owner
      };
    
    case 'LOAD_DATA':
      return action.payload;
    
    default:
      return state;
  }
}

// ==================== CONTEXT ====================

const MockContext = createContext<{
  state: MockState;
  dispatch: React.Dispatch<MockAction>;
} | null>(null);

// ==================== PROVIDER ====================

export function MockProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mockReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('trainu-beta-mock-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsedData });
      } catch (error) {
        console.error('Failed to parse saved mock data:', error);
        dispatch({ type: 'RESET_DATA' });
      }
    } else {
      dispatch({ type: 'RESET_DATA' });
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('trainu-beta-mock-data', JSON.stringify(state));
  }, [state]);

  return React.createElement(
    MockContext.Provider,
    { value: { state, dispatch } },
    children
  );
}

// ==================== HOOK ====================

export function useMockStore() {
  const context = useContext(MockContext);
  if (!context) {
    throw new Error('useMockStore must be used within a MockProvider');
  }
  return context;
}

// ==================== HELPER FUNCTIONS ====================

export function resetMockData() {
  localStorage.removeItem('trainu-beta-mock-data');
  window.location.reload();
}
