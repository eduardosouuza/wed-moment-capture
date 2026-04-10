import { describe, it, expect } from 'vitest';
import type { Event, Media, Profile, CreateMedia } from '@/types/database';

describe('Database Types', () => {
  it('Event type should include trial fields', () => {
    const event: Partial<Event> = {
      is_trial: true,
      photo_count: 5,
      photo_limit: 10,
      trial_expires_at: '2025-12-31T23:59:59Z',
    };

    expect(event.is_trial).toBe(true);
    expect(event.photo_count).toBe(5);
    expect(event.photo_limit).toBe(10);
    expect(event.trial_expires_at).toBeDefined();
  });

  it('CreateMedia requires only essential fields', () => {
    const media: CreateMedia = {
      event_id: 'test-event-id',
      file_path: 'photos/test.jpg',
      media_type: 'photo',
    };

    expect(media.event_id).toBe('test-event-id');
    expect(media.file_path).toBe('photos/test.jpg');
    expect(media.media_type).toBe('photo');
    // Optional fields should not be required
    expect((media as any).likes).toBeUndefined();
    expect((media as any).views).toBeUndefined();
  });

  it('Profile type has required fields', () => {
    const profile: Partial<Profile> = {
      email: 'test@example.com',
      full_name: 'Test User',
      role: 'user',
      plan: 'free',
    };

    expect(profile.email).toBe('test@example.com');
    expect(profile.role).toBe('user');
  });
});
