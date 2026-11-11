import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VIDEO_HOST_LABEL, type ParsedVideo } from '@/lib/video';

// Private/blocked videos can't be detected from the iframe, so the source link is always offered.
export function VideoPlayer({ video, title }: { video: ParsedVideo; title: string }) {
  return <div className={video.vertical ? 'mx-auto w-full max-w-[320px]' : 'w-full'}>
    <div className={`${video.vertical ? 'aspect-[9/16]' : 'aspect-video'} overflow-hidden rounded-2xl bg-surface`}>
      <iframe src={video.embed} title={title} className="h-full w-full" loading="lazy" allowFullScreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock" referrerPolicy="strict-origin-when-cross-origin" />
    </div>
    <p className="mt-2 text-xs text-muted-foreground">Если видео не воспроизводится, откройте его на сайте источника.</p>
    <Button asChild variant="outline" size="sm" className="mt-2"><a href={video.source} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" />Смотреть на {VIDEO_HOST_LABEL[video.host]}</a></Button>
  </div>;
}
