import { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calcTimeLeft(dateStr: string): TimeLeft | null {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d, 0, 0, 0); // midnight local time
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000)  / 60_000),
    seconds: Math.floor((diff % 60_000)     / 1_000),
  };
}

interface EventCountdownProps {
  eventDate: string;
  onExpired: () => void;
}

export function EventCountdown({ eventDate, onExpired }: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calcTimeLeft(eventDate));

  const tick = useCallback(() => {
    const tl = calcTimeLeft(eventDate);
    setTimeLeft(tl);
    if (!tl) onExpired();
  }, [eventDate, onExpired]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  if (!timeLeft) return null;

  const units = [
    { value: timeLeft.days,    label: timeLeft.days    === 1 ? 'dia'    : 'dias',  show: timeLeft.days > 0 },
    { value: timeLeft.hours,   label: timeLeft.hours   === 1 ? 'hora'   : 'horas', show: true },
    { value: timeLeft.minutes, label: 'min',                                        show: true },
    { value: timeLeft.seconds, label: 'seg',                                        show: true },
  ].filter(u => u.show);

  return (
    <div className="px-6 mb-12">
      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4 animate-pulse" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
            O evento começa em
          </p>
        </div>

        {/* Digits */}
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {units.map(({ value, label }, i) => (
            <div key={label} className="flex items-start gap-2 sm:gap-3">
              {i > 0 && (
                <span
                  className="text-2xl font-extrabold mt-1 select-none"
                  style={{ color: 'var(--theme-secondary, #C084FC)' }}
                >
                  :
                </span>
              )}
              <div className="flex flex-col items-center">
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-display font-extrabold text-white shadow-lg transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, var(--theme-primary, #8B5CF6), var(--theme-primary-hover, #7C3AED))`,
                    boxShadow: '0 6px 20px rgba(0,0,0,0.18)',
                  }}
                >
                  {String(value).padStart(2, '0')}
                </div>
                <span
                  className="text-[10px] sm:text-xs mt-1.5 font-semibold tracking-wide uppercase"
                  style={{ color: 'var(--theme-secondary, #C084FC)' }}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Subtitle */}
        <div
          className="mt-6 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-center"
          style={{
            background: 'rgba(255,255,255,0.6)',
            borderColor: 'var(--theme-accent, #DDD6FE)',
          }}
        >
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
          <p className="text-xs font-medium" style={{ color: 'var(--theme-primary, #8B5CF6)' }}>
            A câmera estará disponível quando o evento começar ✨
          </p>
        </div>
      </div>
    </div>
  );
}
