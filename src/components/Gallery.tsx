import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, Download, Heart, Tv, Share2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import Slideshow from './Slideshow';

const ITEMS_PER_PAGE = 20;
const REACTIONS = ['❤️', '🔥', '😍', '😂'] as const;

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  data: string;
  timestamp: number;
}

interface RealtimePayload {
  id: string;
  media_type: string;
  file_path: string;
  uploaded_at: string;
}

interface GalleryProps {
  eventId?: string;
  eventName?: string;
  moderationEnabled?: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ eventId, eventName, moderationEnabled = false }) => {
  const [fetchedMedia, setFetchedMedia] = useState<MediaItem[]>([]);
  const [realtimeMedia, setRealtimeMedia] = useState<MediaItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<string | null>(null);

  // Reactions persisted in localStorage per event
  const [reactions, setReactions] = useState<Record<string, string>>(() => {
    if (!eventId) return {};
    try { return JSON.parse(localStorage.getItem(`lume-rx-${eventId}`) ?? '{}'); }
    catch { return {}; }
  });

  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false); // prevents concurrent loads

  const media = [...realtimeMedia, ...fetchedMedia];

  // Close reaction picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const close = () => setPickerOpen(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [pickerOpen]);

  const handleReaction = (mediaId: string, emoji: string) => {
    setReactions(prev => {
      const next = { ...prev };
      if (next[mediaId] === emoji) { delete next[mediaId]; } else { next[mediaId] = emoji; }
      if (eventId) {
        try { localStorage.setItem(`lume-rx-${eventId}`, JSON.stringify(next)); } catch { /* quota */ }
      }
      return next;
    });
    setPickerOpen(null);
  };

  const toMediaItem = (item: RealtimePayload): MediaItem => ({
    id: item.id,
    type: item.media_type as 'photo' | 'video',
    data: supabase.storage.from('media-bucket').getPublicUrl(item.file_path).data.publicUrl,
    timestamp: new Date(item.uploaded_at).getTime(),
  });

  const fetchMedia = useCallback(async (offset: number, append: boolean) => {
    let query = supabase
      .from('media')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .range(offset, offset + ITEMS_PER_PAGE - 1);

    if (eventId) query = query.eq('event_id', eventId);
    if (moderationEnabled) query = query.eq('is_approved', true);

    const { data, error } = await query;
    if (error) { console.error('Erro ao buscar mídias:', error); return; }

    const items = (data as RealtimePayload[]).map(toMediaItem);
    if (append) { setFetchedMedia(prev => [...prev, ...items]); }
    else { setFetchedMedia(items); }
    setHasMore(data.length === ITEMS_PER_PAGE);
  }, [eventId, moderationEnabled]);

  useEffect(() => {
    fetchMedia(0, false);

    const channel = supabase
      .channel(`gallery-${eventId ?? 'global'}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'media',
        ...(eventId ? { filter: `event_id=eq.${eventId}` } : {}),
      }, (payload) => {
        const newItem = toMediaItem(payload.new as RealtimePayload);
        setRealtimeMedia(prev => [newItem, ...prev]);
        toast('📸 Nova foto adicionada!', {
          description: 'Um convidado acabou de capturar um momento.',
          duration: 3000,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId, fetchMedia]);

  // Infinite scroll via IntersectionObserver
  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoadingMore(true);
    await fetchMedia(fetchedMedia.length, true);
    setLoadingMore(false);
    loadingRef.current = false;
  }, [hasMore, fetchMedia, fetchedMedia.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const loadMoreRef = { current: loadMore };
    loadMoreRef.current = loadMore;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreRef.current(); },
      { rootMargin: '300px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const downloadMedia = async (item: MediaItem) => {
    try {
      const response = await fetch(item.data);
      if (!response.ok) throw new Error('Falha ao buscar mídia');
      const blob = await response.blob();
      const ext = item.type === 'photo' ? '.png' : '.mp4';
      const fileName = `photobooth-${item.type}-${new Date(item.timestamp).toISOString()}${ext}`;
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try { await navigator.share({ files: [file], title: 'Momento Capturado' }); return; } catch { /* fallback */ }
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = fileName;
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro ao baixar mídia:', err instanceof Error ? err.message : err);
    }
  };

  const shareMedia = async (item: MediaItem) => {
    if (!navigator.share) {
      // Fallback: copy URL to clipboard
      try { await navigator.clipboard.writeText(item.data); toast('Link copiado!'); } catch { /* noop */ }
      return;
    }
    try {
      await navigator.share({ title: 'Momento capturado ✨', url: item.data });
    } catch { /* user cancelled */ }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (media.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(to bottom right, var(--theme-light, #F5F3FF), var(--theme-accent, #DDD6FE))` }}>
          <Heart className="w-16 h-16" style={{ color: 'var(--theme-secondary, #C084FC)' }} />
        </div>
        <h3 className="text-xl font-display font-semibold mb-2" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          Galeria de Memórias
        </h3>
        <p className="max-w-sm mx-auto" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          As fotos e vídeos capturados aparecerão aqui para todos os convidados verem
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-display font-semibold mb-2" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          Galeria de Memórias
        </h2>
        <p style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          {media.length} {media.length === 1 ? 'momento capturado' : 'momentos capturados'}
        </p>

        <button
          onClick={() => setShowSlideshow(true)}
          title="Apresentar no Telão"
          className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg opacity-30 hover:opacity-80 transition-opacity duration-200"
          style={{ color: 'var(--theme-primary, #8B5CF6)', border: '1px solid var(--theme-accent, #DDD6FE)' }}
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Telão</span>
        </button>
      </div>

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden bg-gray-100 hover:scale-105 transition-all duration-300 romantic-glow"
            onClick={() => setSelectedMedia(item)}
          >
            {item.type === 'photo' ? (
              <img src={item.data} alt="Momento capturado" className="w-full h-full object-cover" />
            ) : (
              <video src={item.data} className="w-full h-full object-cover" muted />
            )}

            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-xs font-medium">{item.type === 'photo' ? '📸' : '🎥'}</p>
                <p className="text-xs">{formatDate(item.timestamp)}</p>
              </div>
            </div>

            {/* Reaction button */}
            <div className="absolute top-2 right-2" onClick={e => e.stopPropagation()}>
              {pickerOpen === item.id ? (
                <div className="flex gap-0.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg px-1.5 py-1">
                  {REACTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(item.id, emoji)}
                      className={`w-7 h-7 text-sm flex items-center justify-center rounded-full transition-all hover:bg-gray-100 ${reactions[item.id] === emoji ? 'bg-gray-100 scale-110' : ''}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => setPickerOpen(item.id)}
                  className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm text-sm"
                >
                  {reactions[item.id] ?? '🤍'}
                </button>
              )}
            </div>

            {item.type === 'video' && (
              <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1">
                <span className="text-white text-xs">▶️</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Infinite scroll: spinner + sentinel */}
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-6">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--theme-secondary, #C084FC)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--theme-secondary, #C084FC)' }}>
            Carregando mais...
          </span>
        </div>
      )}
      {/* Invisible sentinel triggers next load */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}

      {showSlideshow && (
        <Slideshow media={media} eventName={eventName} onClose={() => setShowSlideshow(false)} />
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-2xl overflow-hidden">
              <Button
                onClick={() => setSelectedMedia(null)}
                variant="ghost" size="sm"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 z-20 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </Button>

              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.data} alt="Momento capturado"
                  className="w-full h-auto max-h-[70vh] object-contain cursor-pointer"
                  onClick={() => setSelectedMedia(null)}
                />
              ) : (
                <video src={selectedMedia.data} controls autoPlay className="w-full h-auto max-h-[70vh] object-contain" />
              )}

              <div className="px-5 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-500 font-medium">
                  {formatDate(selectedMedia.timestamp)}
                </p>

                <div className="flex items-center gap-1">
                  {/* Reactions */}
                  <div className="flex items-center gap-0.5 mr-2">
                    {REACTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(selectedMedia.id, emoji)}
                        className={`w-9 h-9 text-lg flex items-center justify-center rounded-xl transition-all ${reactions[selectedMedia.id] === emoji ? 'bg-gray-100 scale-110' : 'hover:bg-gray-50'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Share */}
                  {(navigator.share || navigator.clipboard) && (
                    <Button
                      onClick={() => shareMedia(selectedMedia)}
                      variant="ghost" size="sm"
                      className="flex items-center gap-1.5 text-gray-600"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">Compartilhar</span>
                    </Button>
                  )}

                  {/* Download */}
                  <Button
                    onClick={() => downloadMedia(selectedMedia)}
                    variant="ghost" size="sm"
                    className="flex items-center gap-1.5 text-gray-600"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">Baixar</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
