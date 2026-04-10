import React, { useState, useEffect, useCallback } from 'react';
import { X, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

const ITEMS_PER_PAGE = 20;

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
}

const Gallery: React.FC<GalleryProps> = ({ eventId }) => {
  const [fetchedMedia, setFetchedMedia] = useState<MediaItem[]>([]);
  const [realtimeMedia, setRealtimeMedia] = useState<MediaItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  const media = [...realtimeMedia, ...fetchedMedia];

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

    if (eventId) {
      query = query.eq('event_id', eventId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar mídias:', error);
      return;
    }

    const items = (data as RealtimePayload[]).map(toMediaItem);

    if (append) {
      setFetchedMedia(prev => [...prev, ...items]);
    } else {
      setFetchedMedia(items);
    }
    setHasMore(data.length === ITEMS_PER_PAGE);
  }, [eventId]);

  useEffect(() => {
    fetchMedia(0, false);

    const channel = supabase
      .channel(`gallery-${eventId ?? 'global'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'media',
          ...(eventId ? { filter: `event_id=eq.${eventId}` } : {}),
        },
        (payload) => {
          const newItem = payload.new as RealtimePayload;
          setRealtimeMedia(prev => [toMediaItem(newItem), ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, fetchMedia]);

  const loadMore = async () => {
    setLoadingMore(true);
    await fetchMedia(fetchedMedia.length, true);
    setLoadingMore(false);
  };

  const handleLike = (mediaId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  const downloadMedia = async (item: MediaItem) => {
    try {
      const response = await fetch(item.data);
      if (!response.ok) throw new Error('Falha ao buscar mídia');
      const blob = await response.blob();
      const ext = item.type === 'photo' ? '.png' : '.mp4';
      const fileName = `photobooth-${item.type}-${new Date(item.timestamp).toISOString()}${ext}`;
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Momento Capturado' });
          return;
        } catch {
          // fallback para download tradicional
        }
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro ao baixar mídia:', msg);
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  if (media.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div
          className="w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{ background: `linear-gradient(to bottom right, var(--theme-light, #F5F3FF), var(--theme-accent, #DDD6FE))` }}
        >
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
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-semibold mb-2" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          Galeria de Memórias
        </h2>
        <p style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          {media.length} {media.length === 1 ? 'momento capturado' : 'momentos capturados'}
        </p>
      </div>

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

            <button
              onClick={(e) => { e.stopPropagation(); handleLike(item.id); }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors"
            >
              <Heart className={`w-4 h-4 ${likedItems.has(item.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
            </button>

            {item.type === 'video' && (
              <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1">
                <span className="text-white text-xs">▶️</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Botão "Carregar mais" */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={loadMore}
            disabled={loadingMore}
            variant="outline"
            className="px-8 py-2"
            style={{ borderColor: 'var(--theme-primary, #8B5CF6)', color: 'var(--theme-primary, #8B5CF6)' }}
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </Button>
        </div>
      )}

      {/* Lightbox */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div className="relative max-w-4xl max-h-full w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-lg overflow-hidden relative">
              <Button
                onClick={() => setSelectedMedia(null)}
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 z-20 rounded-full p-2"
              >
                <X className="w-6 h-6" />
              </Button>

              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.data}
                  alt="Momento capturado"
                  className="w-full h-auto max-h-[70vh] object-contain cursor-pointer"
                  onClick={() => setSelectedMedia(null)}
                />
              ) : (
                <video src={selectedMedia.data} controls autoPlay className="w-full h-auto max-h-[70vh] object-contain" />
              )}

              <div className="p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600 font-medium">
                  Capturado em {formatDate(selectedMedia.timestamp)}
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleLike(selectedMedia.id)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Heart className={`w-4 h-4 ${likedItems.has(selectedMedia.id) ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                    <span className="text-sm font-medium">
                      {likedItems.has(selectedMedia.id) ? 'Curtido' : 'Curtir'}
                    </span>
                  </Button>
                  <Button
                    onClick={() => downloadMedia(selectedMedia)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Baixar</span>
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
