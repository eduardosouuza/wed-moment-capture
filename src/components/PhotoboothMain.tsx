
import React, { useState } from 'react';
import { Camera as CameraIcon, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Camera from './Camera';
import Gallery from './Gallery';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  data: string;
  timestamp: number;
}

const PhotoboothMain: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [mediaGallery, setMediaGallery] = useState<MediaItem[]>([]);

  const handleMediaCapture = (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => {
    const newMediaItem: MediaItem = {
      id: `${mediaData.timestamp}-${Math.random()}`,
      type: mediaData.type,
      data: mediaData.data,
      timestamp: mediaData.timestamp
    };
    
    setMediaGallery(prev => [newMediaItem, ...prev]);
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-background to-olive-50">
      {/* Header Romântico */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 text-olive-500 animate-pulse" />
          <Heart className="w-8 h-8 text-olive-600 animate-float" />
          <Sparkles className="w-6 h-6 text-olive-500 animate-pulse" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-serif text-olive-800 mb-3 tracking-tight">
          Photobooth do Casamento
        </h1>
        
        <p className="text-lg text-olive-600 mb-2 font-light">
          Capture momentos mágicos conosco
        </p>
        
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-olive-300 to-transparent mx-auto"></div>
      </div>

      {/* Botão Principal de Captura */}
      <div className="px-6 mb-12">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => setShowCamera(true)}
            className="w-full h-16 bg-gradient-to-r from-olive-500 to-olive-600 hover:from-olive-600 hover:to-olive-700 text-white rounded-2xl font-serif text-lg tracking-wide shadow-2xl hover:shadow-olive-500/25 transition-all duration-500 animate-scale-in romantic-glow"
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            Criar Foto ou Vídeo
          </Button>
          
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-olive-600">
              📸 Até 3 fotos sequenciais ou 🎥 vídeo de 15 segundos
            </p>
            <p className="text-xs text-olive-500">
              Suas criações aparecerão na galeria abaixo ✨
            </p>
          </div>
        </div>
      </div>

      {/* Galeria */}
      <div className="px-4 max-w-6xl mx-auto">
        <Gallery media={mediaGallery} />
      </div>

      {/* Rodapé Romântico */}
      <footer className="mt-16 py-8 text-center px-4 border-t border-olive-200/50">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Heart className="w-4 h-4 text-olive-500" />
          <span className="text-olive-700 font-serif text-sm">
            Ana & João • 15 de Dezembro, 2024
          </span>
          <Heart className="w-4 h-4 text-olive-500" />
        </div>
        
        <p className="text-xs text-olive-500 max-w-xs mx-auto leading-relaxed">
          Obrigado por compartilhar este momento especial conosco. 
          Cada foto é uma lembrança eterna do nosso amor.
        </p>
        
        <div className="mt-4 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Sparkles 
              key={i} 
              className="w-3 h-3 text-olive-300 animate-pulse" 
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </footer>

      {/* Componente da Câmera */}
      {showCamera && (
        <Camera
          onCapture={handleMediaCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default PhotoboothMain;
