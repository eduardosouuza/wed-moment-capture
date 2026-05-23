import { describe, it, expect } from 'vitest';
import type { Event, Media, Profile, CreateMedia } from '@/types/database';

describe('Database Types', () => {
  it('Event type should include payment fields', () => {
    const event: Partial<Event> = {
      plan: 'basico',
      payment_status: 'paid',
      max_photos: 30,
      max_videos: 0,
    };

    expect(event.plan).toBe('basico');
    expect(event.payment_status).toBe('paid');
    expect(event.max_photos).toBe(30);
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
      plan: 'basico',
    };

    expect(profile.email).toBe('test@example.com');
    expect(profile.role).toBe('user');
  });
});
