import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Wifi } from 'lucide-react';

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  data: string;
  timestamp: number;
}

interface SlideshowProps {
  media: MediaItem[];
  eventName?: string;
  onClose: () => void;
}

const SLIDE_DURATION = 6000;

const Slideshow: React.FC<SlideshowProps> = ({ media, eventName, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevLengthRef = useRef(media.length);

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(clock);
  }, []);

  const transitionTo = useCallback((index: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setFade(true);
    }, 350);
  }, []);

  const next = useCallback(() => {
    if (media.length <= 1) return;
    transitionTo((currentIndex + 1) % media.length);
  }, [currentIndex, media.length, transitionTo]);

  const prev = useCallback(() => {
    if (media.length <= 1) return;
    transitionTo((currentIndex - 1 + media.length) % media.length);
  }, [currentIndex, media.length, transitionTo]);

  // Auto-advance
  useEffect(() => {
    if (media.length <= 1) return;
    timerRef.current = setTimeout(next, SLIDE_DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentIndex, media.length, next]);

  // Show newest photo when a new one arrives
  useEffect(() => {
    if (media.length > prevLengthRef.current) {
      transitionTo(0);
    }
    prevLengthRef.current = media.length;
  }, [media.length, transitionTo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, next, prev]);

  const currentItem = media[currentIndex];
  const MAX_DOTS = 15;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <span className="flex items-center gap-1.5 text-sm font-medium text-green-400">
            <Wifi className="w-4 h-4" />
            Ao Vivo
          </span>
          {eventName && (
            <span className="text-white/60 text-sm">{eventName}</span>
          )}
        </div>
        <div className="flex items-center gap-5 pointer-events-auto">
          <span className="text-white/70 text-xl font-mono tabular-nums">{formatTime(currentTime)}</span>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white/90 transition-colors rounded-full p-1"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Media area */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {media.length === 0 ? (
          <div className="text-center">
            <p className="text-white/30 text-2xl font-light mb-2">Aguardando fotos...</p>
            <p className="text-white/20 text-sm">As fotos capturadas aparecerão aqui</p>
          </div>
        ) : (
          <>
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.35s ease' }}
            >
              {currentItem?.type === 'photo' ? (
                <img
                  key={currentItem.id}
                  src={currentItem.data}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: 'calc(100vh - 100px)' }}
                />
              ) : (
                <video
                  key={currentItem.id}
                  src={currentItem.data}
                  autoPlay
                  muted
                  loop
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: 'calc(100vh - 100px)' }}
                />
              )}
            </div>

            {/* Navigation arrows */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-3 text-white/20 hover:text-white/70 transition-colors p-2"
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 text-white/20 hover:text-white/70 transition-colors p-2"
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              </>
            )}
          </>
        )}
      </div>

      {/* Progress dots */}
      {media.length > 1 && (
        <div className="absolute bottom-5 left-0 right-0 flex justify-center items-center gap-1.5">
          {media.slice(0, MAX_DOTS).map((_, i) => (
            <button
              key={i}
              onClick={() => transitionTo(i)}
              className="rounded-full transition-all duration-300 ease-out"
              style={{
                width: i === currentIndex ? 22 : 7,
                height: 7,
                background: i === currentIndex ? 'white' : 'rgba(255,255,255,0.25)',
              }}
            />
          ))}
          {media.length > MAX_DOTS && (
            <span className="text-white/30 text-xs ml-1 tabular-nums">
              +{media.length - MAX_DOTS}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default Slideshow;
