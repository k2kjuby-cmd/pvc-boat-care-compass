import { describe, it, expect } from 'vitest';
import { parseVideo } from './video';
describe('parseVideo', () => {
  it('youtube watch', () => expect(parseVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')?.embed).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'));
  it('youtube shorts is vertical', () => expect(parseVideo('https://youtube.com/shorts/dQw4w9WgXcQ')?.vertical).toBe(true));
  it('rutube video', () => expect(parseVideo('https://rutube.ru/video/0123456789abcdef0123456789abcdef/')?.embed).toBe('https://rutube.ru/play/embed/0123456789abcdef0123456789abcdef'));
  it('vk video', () => expect(parseVideo('https://vkvideo.ru/video-123_456')?.embed).toBe('https://vkvideo.ru/video_ext.php?oid=-123&id=456'));
  it('vk clip is vertical', () => expect(parseVideo('https://vk.com/clip-1_2')?.vertical).toBe(true));
  it('other hosts rejected', () => expect(parseVideo('https://example.com/v.mp4')).toBeNull());
  it('empty hidden', () => expect(parseVideo('')).toBeNull());
});
