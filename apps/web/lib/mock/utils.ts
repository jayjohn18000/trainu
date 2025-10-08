// Utility functions for mock data

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomDelay = () => sleep(200 + Math.random() * 300);

export const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const formatDate = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

export const formatTime = (date: string | Date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
};
