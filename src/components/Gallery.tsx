import React, { useState, useEffect } from 'react';
import { X, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  data: string;
  timestamp: number;
  likes?: number;
}

const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  
  useEffect(() => {
    const fetchMedia = async () => {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Erro ao buscar mídias:', error);
        return;
      }
      
      const mediaItems = data.map(item => ({
        id: item.id,
        type: item.media_type,
        data: supabase.storage.from('media-bucket').getPublicUrl(item.file_path).data.publicUrl,
        timestamp: new Date(item.uploaded_at).getTime()
      }));
      
      setMedia(mediaItems);
    };
    
    fetchMedia();
  }, []);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

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

  const downloadMedia = async (media: MediaItem) => {
    try {
      const response = await fetch(media.data);
      if (!response.ok) throw new Error('Falha ao buscar mídia');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `photobooth-${media.type}-${new Date(media.timestamp).toISOString()}${media.type === 'photo' ? '.png' : '.mp4'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erro ao baixar mídia:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (media.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-olive-100 to-sage-100 rounded-full flex items-center justify-center">
          <Heart className="w-16 h-16 text-olive-400" />
        </div>
        <h3 className="text-xl font-display font-semibold text-olive-800 mb-2">
          Galeria de Memórias
        </h3>
        <p className="text-olive-600 max-w-sm mx-auto">
          As fotos e vídeos capturados aparecerão aqui para todos os convidados verem
        </p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-display font-semibold text-olive-800 mb-2">
          Galeria de Memórias
        </h2>
        <p className="text-olive-600">
          {media.length} {media.length === 1 ? 'momento capturado' : 'momentos capturados'}
        </p>
      </div>

      {/* Grid da Galeria */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className="relative aspect-square group cursor-pointer rounded-lg overflow-hidden bg-gray-100 hover:scale-105 transition-all duration-300 romantic-glow"
            onClick={() => setSelectedMedia(item)}
          >
            {item.type === 'photo' ? (
              <img
                src={item.data}
                alt="Momento capturado"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.data}
                className="w-full h-full object-cover"
                muted
              />
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="text-white text-center">
                <p className="text-xs font-medium">
                  {item.type === 'photo' ? '📸' : '🎥'}
                </p>
                <p className="text-xs">{formatDate(item.timestamp)}</p>
              </div>
            </div>

            {/* Like Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLike(item.id);
              }}
              className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 hover:bg-white transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  likedItems.has(item.id)
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-600'
                }`}
              />
            </button>

            {/* Video indicator */}
            {item.type === 'video' && (
              <div className="absolute bottom-2 left-2 bg-black/70 rounded px-2 py-1">
                <span className="text-white text-xs">▶️</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div 
            className="relative max-w-4xl max-h-full w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Content */}
            <div className="bg-white rounded-lg overflow-hidden relative">
              {/* Close Button */}
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
                <video
                  src={selectedMedia.data}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
              )}
              
              {/* Media Info */}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Capturado em {formatDate(selectedMedia.timestamp)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handleLike(selectedMedia.id)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        likedItems.has(selectedMedia.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-gray-600'
                      }`}
                    />
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
