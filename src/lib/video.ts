export type ParsedVideo = { embed: string; source: string; host: 'youtube' | 'rutube' | 'vk'; vertical: boolean };

// Accepts VK Видео, Rutube and YouTube links; returns null for anything else.
export function parseVideo(raw: string | null | undefined): ParsedVideo | null {
  if (!raw) return null;
  let u: URL;
  try { u = new URL(raw.trim()); } catch { return null; }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const h = u.hostname.replace(/^(www\.|m\.)/, '');
  const source = u.toString().replace(/^http:/, 'https:');
  if (h === 'youtube.com' || h === 'youtu.be' || h === 'youtube-nocookie.com') {
    let id: string | null = null; let vertical = false;
    if (h === 'youtu.be') id = u.pathname.slice(1).split('/')[0] ?? null;
    else if (u.pathname === '/watch') id = u.searchParams.get('v');
    else { const m = u.pathname.match(/^\/(shorts|embed|live)\/([\w-]+)/); if (m) { id = m[2]!; vertical = m[1] === 'shorts'; } }
    if (!id || !/^[\w-]{6,20}$/.test(id)) return null;
    return { embed: `https://www.youtube-nocookie.com/embed/${id}`, source, host: 'youtube', vertical };
  }
  if (h === 'rutube.ru') {
    const m = u.pathname.match(/^\/(video|shorts|play\/embed)\/(?:private\/)?([a-f0-9]{32})/);
    if (!m) return null;
    const p = u.searchParams.get('p');
    return { embed: `https://rutube.ru/play/embed/${m[2]}${p ? `?p=${encodeURIComponent(p)}` : ''}`, source, host: 'rutube', vertical: m[1] === 'shorts' };
  }
  if (h === 'vk.com' || h === 'vkvideo.ru' || h === 'vk.ru') {
    if (u.pathname === '/video_ext.php') { const oid = u.searchParams.get('oid'), id = u.searchParams.get('id'); if (!oid || !id) return null; return { embed: `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${id}${u.searchParams.get('hash') ? `&hash=${u.searchParams.get('hash')}` : ''}`, source, host: 'vk', vertical: false }; }
    const target = u.searchParams.get('z') ?? u.pathname;
    const m = target.match(/(video|clip)(-?\d+)_(\d+)/);
    if (!m) return null;
    return { embed: `https://vkvideo.ru/video_ext.php?oid=${m[2]}&id=${m[3]}`, source, host: 'vk', vertical: m[1] === 'clip' };
  }
  return null;
}

export const VIDEO_HOST_LABEL = { youtube: 'YouTube', rutube: 'Rutube', vk: 'VK Видео' } as const;
