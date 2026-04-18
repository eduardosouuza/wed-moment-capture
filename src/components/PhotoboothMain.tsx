import React, { useState } from 'react';
import { Camera as CameraIcon, Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CameraWithLayout from './CameraWithLayout';
import Gallery from './Gallery';
import type { Event } from '@/types/database';

interface PhotoboothMainProps {
  event: Event;
}

const PhotoboothMain: React.FC<PhotoboothMainProps> = ({ event }) => {
  const [showCamera, setShowCamera] = useState(false);

  // Extract event data
  let displayName = event.name || 'Photobooth';
  let subtitleNames = '';

  if (event.event_type === 'wedding') {
    displayName = 'Photobooth do Casamento';
    const n1 = event.couple_name_1 || '';
    const n2 = event.couple_name_2 || '';
    subtitleNames = n1 && n2 ? `${n1} & ${n2}` : (n1 || n2 || event.name || '');
  } else if (event.event_type === 'birthday') {
    displayName = `Photobooth do(a) ${event.birthday_person_name || 'Aniversariante'}`;
    subtitleNames = event.birthday_person_name || event.name || '';
  } else if (event.event_type === 'corporate') {
    displayName = `Photobooth da ${event.company_name || 'Empresa'}`;
    subtitleNames = event.company_name || event.name || '';
  } else if (event.event_type === 'party') {
    displayName = `Photobooth do(a) ${event.host_name || 'Anfitrião'}`;
    subtitleNames = event.host_name || event.name || '';
  } else {
    subtitleNames = event.name || '';
  }

  const name1 = event.couple_name_1 || '';
  const name2 = event.couple_name_2 || '';
  
  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const handleMediaCapture = (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => {
    // A galeria atualiza automaticamente via polling (Gallery.tsx)
    setShowCamera(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-light, #F5F3FF)' }}>
      {/* Header Romântico */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="inline-flex items-center justify-center space-x-2 mb-4">
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
          <Heart className="w-8 h-8 animate-float" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-semibold mb-3 tracking-tight" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          {displayName}
        </h1>

        <p className="text-lg mb-2 font-light" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
          Capture momentos mágicos conosco
        </p>

        <div className="w-24 h-px mx-auto" style={{ background: `linear-gradient(to right, transparent, var(--theme-secondary, #C084FC), transparent)` }}></div>
      </div>

      {/* Botão Principal de Captura */}
      <div className="px-6 mb-12">
        <div className="max-w-md mx-auto">
          <Button
            onClick={() => setShowCamera(true)}
            className="w-full h-16 text-white rounded-2xl font-display font-medium text-lg tracking-wide shadow-2xl transition-all duration-500 animate-scale-in romantic-glow"
            style={{ background: `linear-gradient(to right, var(--theme-primary, #8B5CF6), var(--theme-primary-hover, #7C3AED))` }}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            Criar Foto ou Vídeo
          </Button>

          <div className="text-center mt-4 space-y-2">
            <p className="text-sm font-medium" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
              📸 Countdown 5s + 3 fotos sequenciais ou 🎥 vídeo de 15 segundos
            </p>
            <p className="text-xs" style={{ color: 'var(--theme-secondary, #C084FC)' }}>
              Suas criações aparecerão na galeria abaixo ✨
            </p>
          </div>
        </div>
      </div>

      {/* Galeria */}
      <div className="px-4 max-w-6xl mx-auto">
        <Gallery eventId={event.id} />
      </div>

      {/* Rodapé Romântico */}
      <footer className="mt-16 py-8 text-center px-4" style={{ borderTop: '1px solid var(--theme-accent, #DDD6FE)' }}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Heart className="w-4 h-4" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
          <span className="font-display font-medium text-sm" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
            {subtitleNames} • {eventDate}
          </span>
          <Heart className="w-4 h-4" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
        </div>

        <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--theme-secondary, #C084FC)' }}>
          Obrigado por compartilhar este momento especial conosco.
          Cada foto é uma lembrança eterna.
        </p>

        <div className="mt-4 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <Sparkles
              key={i}
              className="w-3 h-3 animate-pulse"
              style={{ color: 'var(--theme-accent, #DDD6FE)', animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </footer>

      {/* Componente da Câmera */}
      {showCamera && (
        <CameraWithLayout
          onCapture={handleMediaCapture}
          onClose={() => setShowCamera(false)}
          eventId={event.id}
          coupleName1={event.event_type === 'wedding' ? name1 : subtitleNames}
          coupleName2={event.event_type === 'wedding' ? name2 : ''}
          eventDate={eventDate}
          eventName={event.name}
          isTrial={event.is_trial}
          photoLimit={event.photo_limit}
          photoCount={event.photo_count}
        />
      )}
    </div>
  );
};

export default PhotoboothMain;
