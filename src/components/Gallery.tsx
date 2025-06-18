
import React, { useState } from 'react';
import { X, Download, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  data: string;
  timestamp: number;
  likes?: number;
}

interface GalleryProps {
  media: MediaItem[];
}

const Gallery: React.FC<GalleryProps> = ({ media }) => {
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

  const downloadMedia = (media: MediaItem) => {
    const link = document.createElement('a');
    link.href = media.data;
    link.download = `photobooth-${media.type}-${new Date(media.timestamp).toISOString()}`;
    link.click();
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
        <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-olive-100 to-cream-100 rounded-full flex items-center justify-center">
          <Heart className="w-16 h-16 text-olive-400" />
        </div>
        <h3 className="text-xl font-serif text-olive-800 mb-2">
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
        <h2 className="text-3xl font-serif text-olive-800 mb-2">
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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full">
            {/* Close Button */}
            <Button
              onClick={() => setSelectedMedia(null)}
              variant="ghost"
              size="sm"
              className="absolute -top-12 right-0 text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Media Content */}
            <div className="bg-white rounded-lg overflow-hidden">
              {selectedMedia.type === 'photo' ? (
                <img
                  src={selectedMedia.data}
                  alt="Momento capturado"
                  className="w-full h-auto max-h-[70vh] object-contain"
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
                  <p className="text-sm text-gray-600">
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
                    <span className="text-sm">
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
                    <span className="text-sm">Baixar</span>
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
