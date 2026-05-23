import { useFormContext, useWatch } from 'react-hook-form';
import { EventFormValues } from '@/lib/validations/event';
import { getTheme } from '@/lib/themes';
import type { ThemeColor } from '@/lib/themes';
import { Camera, Heart, Sparkles, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const EVENT_TITLES: Record<string, string> = {
  wedding: 'Photobooth do Casamento',
  birthday: 'Photobooth do Aniversário',
  corporate: 'Photobooth Corporativo',
  party: 'Photobooth da Festa',
};

export function EventThemePreview() {
  const form = useFormContext<EventFormValues>();
  const themeColor = useWatch({ control: form.control, name: 'theme_color' }) as ThemeColor;
  const eventType = useWatch({ control: form.control, name: 'event_type' });
  const customMessage = useWatch({ control: form.control, name: 'custom_message' });

  const theme = getTheme(themeColor || 'rose');
  const displayTitle = EVENT_TITLES[eventType] || 'Photobooth do Evento';
  const shortMessage = customMessage && customMessage.length > 60
    ? customMessage.slice(0, 57) + '…'
    : customMessage;

  return (
    <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518] h-fit lg:sticky lg:top-24">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
            <Eye className="w-5 h-5 text-[#E85A70]" />
          </div>
          <div>
            <CardTitle className="font-display text-xl">Preview ao Vivo</CardTitle>
            <CardDescription>Como convidados vão ver o evento</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col items-center">
        {/* Phone frame */}
        <div className="relative w-[200px] flex-shrink-0">
          <div
            className="rounded-[2rem] border-[5px] border-[#1c1c1e] overflow-hidden relative"
            style={{ boxShadow: '0 20px 50px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)' }}
          >
            {/* Dynamic island */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[38%] h-[14px] bg-[#1c1c1e] rounded-full z-10" />

            {/* Screen */}
            <div
              className="pt-8 pb-5 px-3 min-h-[370px]"
              style={{ background: theme.light }}
            >
              {/* Header icons */}
              <div className="flex items-center justify-center gap-1.5 mb-2">
                <Sparkles className="w-3 h-3 animate-pulse" style={{ color: theme.primary }} />
                <Heart className="w-3.5 h-3.5" style={{ color: theme.primary }} />
                <Sparkles className="w-3 h-3 animate-pulse" style={{ color: theme.primary }} />
              </div>

              {/* Event title */}
              <h3
                className="text-center font-display font-semibold leading-snug mb-0.5"
                style={{ color: theme.primary, fontSize: '11px' }}
              >
                {displayTitle}
              </h3>
              <p
                className="text-center font-light mb-1"
                style={{ color: theme.primary, fontSize: '8px' }}
              >
                Capture momentos mágicos conosco
              </p>

              {/* Gradient divider */}
              <div
                className="w-10 h-px mx-auto mb-3"
                style={{ background: `linear-gradient(to right, transparent, ${theme.secondary}, transparent)` }}
              />

              {/* Custom message */}
              {shortMessage && (
                <div
                  className="mx-1 mb-3 px-2 py-1.5 rounded-xl text-center italic"
                  style={{
                    border: `1px solid ${theme.accent}`,
                    color: theme.primary,
                    background: 'rgba(255,255,255,0.7)',
                    fontSize: '7.5px',
                    lineHeight: 1.4,
                  }}
                >
                  &ldquo;{shortMessage}&rdquo;
                </div>
              )}

              {/* Camera button */}
              <div className="mx-1 mb-3">
                <div
                  className="py-2 rounded-xl flex items-center justify-center gap-1.5"
                  style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.primaryHover})` }}
                >
                  <Camera className="w-2.5 h-2.5 text-white" />
                  <span className="text-white font-medium" style={{ fontSize: '8px' }}>
                    Criar Foto ou Vídeo
                  </span>
                </div>
              </div>

              {/* Gallery label */}
              <p
                className="text-center font-display font-semibold mb-2"
                style={{ color: theme.primary, fontSize: '8.5px' }}
              >
                Galeria de Memórias
              </p>

              {/* Gallery placeholder grid */}
              <div className="grid grid-cols-3 gap-1 mx-0.5">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-md"
                    style={{
                      background: i % 2 === 0
                        ? `linear-gradient(135deg, ${theme.accent}, ${theme.light})`
                        : `linear-gradient(135deg, ${theme.light}, white)`,
                      border: `1px solid ${theme.accent}`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Theme badge */}
        <div className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 dark:bg-white/5 border border-[#ede7e4] dark:border-white/10">
          <div className="w-3 h-3 rounded-full" style={{ background: theme.primary }} />
          <span className="text-xs font-semibold text-gray-500">{theme.name}</span>
        </div>
      </CardContent>
    </Card>
  );
}
