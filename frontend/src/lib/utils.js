// utils.js — Utility functions used across the entire app
// clsx merges class names conditionally
// twMerge resolves Tailwind class conflicts intelligently
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// cn() is the standard utility used in every modern React project.
// Usage: cn('base-class', condition && 'conditional-class', 'another-class')
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format relative time — "2 minutes ago", "just now", etc.
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Generate a random hex color for user cursors in the editor
export function randomColor() {
  const colors = [
    '#6366F1', '#8B5CF6', '#10B981', '#F59E0B',
    '#EF4444', '#3B82F6', '#EC4899', '#14B8A6',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Get user initials from full name
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Debounce — delay a function call until typing stops
// Used for autosave: don't save on every keystroke, wait 500ms of silence
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}