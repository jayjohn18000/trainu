"use client";

const FLAGS_KEY = 'trainu-feature-flags';

export interface FeatureFlags {
  COMMUNITY_ENABLED: boolean;
  AFFILIATE_ENABLED: boolean;
  CREATORS_ENABLED: boolean;
  GOALS_ENABLED: boolean;
  INBOX_ENABLED: boolean;
  ANALYTICS_ENABLED: boolean;
}

const defaultFlags: FeatureFlags = {
  COMMUNITY_ENABLED: true,
  AFFILIATE_ENABLED: true,
  CREATORS_ENABLED: true,
  GOALS_ENABLED: true,
  INBOX_ENABLED: true,
  ANALYTICS_ENABLED: true,
};

export function getFlags(): FeatureFlags {
  if (typeof window === 'undefined') return defaultFlags;
  
  try {
    const stored = localStorage.getItem(FLAGS_KEY);
    if (stored) {
      return { ...defaultFlags, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.warn('Failed to load feature flags:', e);
  }
  return defaultFlags;
}

export function setFlag(key: keyof FeatureFlags, value: boolean): void {
  if (typeof window === 'undefined') return;
  
  const flags = getFlags();
  flags[key] = value;
  localStorage.setItem(FLAGS_KEY, JSON.stringify(flags));
  window.dispatchEvent(new CustomEvent('flags-changed'));
}

export function resetFlags(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(FLAGS_KEY, JSON.stringify(defaultFlags));
  window.dispatchEvent(new CustomEvent('flags-changed'));
}

