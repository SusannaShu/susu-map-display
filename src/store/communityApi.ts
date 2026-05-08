/**
 * Mock API layer for the display version.
 * Returns mock data directly -- no backend required.
 */

import { mockPins, mockStories } from '../data/mockData';
import type { MapPin, MockStory } from '../data/mockData';

// No backend URL needed -- everything is local mock data
export const API_BASE_URL = '';

/**
 * Get all mock posts, optionally filtered by layer.
 */
export function getMockPosts(layer?: string): MapPin[] {
  if (!layer || layer === 'all') return mockPins;
  return mockPins.filter((p) => p.layer === layer);
}

/**
 * Get mock stories, optionally filtered by linked post.
 */
export function getMockStories(postId?: string): MockStory[] {
  if (!postId) return mockStories;
  return mockStories.filter((s) => s.linkedPostId === postId);
}

/**
 * Get a single mock post by ID.
 */
export function getMockPost(id: string): MapPin | undefined {
  return mockPins.find((p) => p.id === id);
}
