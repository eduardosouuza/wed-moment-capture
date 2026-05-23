import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Event } from '@/types/database';

interface QRCodeFrameModalProps {
  event: Event;
  onClose: () => void;
}

const EVENT_META: Record<string, { icon: string; headline: string; cta: string }> = {
  wedding: {
    icon: '💍',
    headline: 'Registre este momento',
    cta: 'Escaneie e deixe sua foto no álbum do casal',
  },
  birthday: {
    icon: '🎂',
    headline: 'Faça parte da festa!',
    cta: 'Escaneie e registre sua foto no aniversário',
  },
  corporate: {
    icon: '📸',
    headline: 'Capture sua participação',
    cta: 'Escaneie e registre sua foto no evento',
  },
  party: {
    icon: '🎉',
    headline: 'A festa é sua!',
    cta: 'Escaneie e registre seu momento especial',
  },
};

const FRAME_W = 320;
const FRAME_H = 490;
const OUTER = 10;
const INNER = 17;
const CORNER = 32;

function FrameSVG() {
  const w = FRAME_W;
  const h = FRAME_H;
  const o = OUTER;
  const i = INNER;
  const c = CORNER;
  const rose = '#E85A70';
  const grayBorder = '#d1d5db';
  const midX = w / 2;
  const midY = h / 2;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', display: 'block' }}
    >
      {/* Outer border */}
      <rect x={o} y={o} width={w - o * 2} height={h - o * 2} stroke={grayBorder} strokeWidth="0.75" />
      {/* Inner border */}
      <rect x={i} y={i} width={w - i * 2} height={h - i * 2} stroke={grayBorder} strokeWidth="0.5" />

      {/* Corner ornaments — rose */}
      <polyline points={`${o},${o + c}  ${o},${o}  ${o + c},${o}`} stroke={rose} strokeWidth="2.5" fill="none" strokeLinecap="square" />
      <polyline points={`${w - o - c},${o}  ${w - o},${o}  ${w - o},${o + c}`} stroke={rose} strokeWidth="2.5" fill="none" strokeLinecap="square" />
      <polyline points={`${o},${h - o - c}  ${o},${h - o}  ${o + c},${h - o}`} stroke={rose} strokeWidth="2.5" fill="none" strokeLinecap="square" />
      <polyline points={`${w - o - c},${h - o}  ${w - o},${h - o}  ${w - o},${h - o - c}`} stroke={rose} strokeWidth="2.5" fill="none" strokeLinecap="square" />

      {/* Corner dots */}
      <circle cx={o} cy={o} r={3} fill={rose} />
      <circle cx={w - o} cy={o} r={3} fill={rose} />
      <circle cx={o} cy={h - o} r={3} fill={rose} />
      <circle cx={w - o} cy={h - o} r={3} fill={rose} />

      {/* Mid-border accent ticks */}
      <line x1={midX - 7} y1={o} x2={midX + 7} y2={o} stroke={rose} strokeWidth="1.5" />
      <circle cx={midX} cy={o} r={2} fill={rose} />
      <line x1={midX - 7} y1={h - o} x2={midX + 7} y2={h - o} stroke={rose} strokeWidth="1.5" />
      <circle cx={midX} cy={h - o} r={2} fill={rose} />
      <line x1={o} y1={midY - 7} x2={o} y2={midY + 7} stroke={rose} strokeWidth="1.5" />
      <circle cx={o} cy={midY} r={2} fill={rose} />
      <line x1={w - o} y1={midY - 7} x2={w - o} y2={midY + 7} stroke={rose} strokeWidth="1.5" />
      <circle cx={w - o} cy={midY} r={2} fill={rose} />
    </svg>
  );
}

export function QRCodeFrameModal({ event, onClose }: QRCodeFrameModalProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const eventUrl = `${window.location.origin}/e/${event.slug}`;
  const meta = EVENT_META[event.event_type] ?? {
    icon: '📸',
    headline: 'Capture o momento',
    cta: 'Escaneie e registre sua foto',
  };

  let displayName = event.name;
  if (event.event_type === 'wedding' && event.couple_name_1 && event.couple_name_2) {
    displayName = `${event.couple_name_1} & ${event.couple_name_2}`;
  } else if (event.event_type === 'birthday' && event.birthday_person_name) {
    displayName = event.birthday_person_name;
  } else if (event.event_type === 'corporate' && event.company_name) {
    displayName = event.company_name;
  } else if (event.event_type === 'party' && event.host_name) {
    displayName = event.host_name;
  }

  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const handlePrint = () => {
    const el = frameRef.current;
    if (!el) return;

    const html = el.outerHTML;
    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8"/>
  <title>${event.name} — Moldura QR Code</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%; min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: white; font-family: 'Inter', sans-serif;
    }
    @media print {
      @page { size: A4 portrait; margin: 1.5cm; }
      html, body { background: white; }
    }
  </style>
</head>
<body>
  ${html}
  <script>
    window.addEventListener('load', function() {
      setTimeout(function() { window.print(); }, 600);
      window.addEventListener('afterprint', function() { window.close(); });
    });
  <\/script>
</body>
</html>`);
    win.document.close();
  };

  const frameStyle: React.CSSProperties = {
    width: `${FRAME_W}px`,
    height: `${FRAME_H}px`,
    background: 'white',
    position: 'relative',
    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
    flexShrink: 0,
  };

  const contentStyle: React.CSSProperties = {
    position: 'absolute',
    inset: `${INNER + 10}px ${INNER + 8}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    gap: '0px',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <span className="text-sm font-semibold text-gray-800">Moldura para Mesa</span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 flex items-center justify-center py-6 px-4 overflow-auto" style={{ maxHeight: '70vh' }}>
          <div ref={frameRef} style={frameStyle}>
            <FrameSVG />

            {/* Subtle rose gradient accent lines inside inner border */}
            <div style={{
              position: 'absolute',
              top: INNER + 1,
              left: INNER + 6,
              right: INNER + 6,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(232,90,112,0.35), transparent)',
            }} />
            <div style={{
              position: 'absolute',
              bottom: INNER + 1,
              left: INNER + 6,
              right: INNER + 6,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(232,90,112,0.35), transparent)',
            }} />

            <div style={contentStyle}>
              {/* Icon in rose-accented circular badge */}
              <div style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FDF2F4, #fff9fa)',
                border: '1.5px solid rgba(232,90,112,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 2px 12px rgba(232,90,112,0.15)',
                marginBottom: '10px',
              }}>
                {meta.icon}
              </div>

              {/* Event name */}
              <h2 style={{
                fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
                fontSize: '22px',
                fontWeight: 700,
                color: '#111827',
                lineHeight: 1.25,
                marginBottom: '5px',
              }}>
                {displayName}
              </h2>

              {/* Date */}
              {eventDate && (
                <p style={{
                  fontSize: '10px',
                  color: '#9ca3af',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  marginBottom: '0px',
                }}>
                  {eventDate}
                </p>
              )}

              {/* Ornamental divider — rose diamond with fading lines */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', margin: '14px 0' }}>
                <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, transparent, #e5e7eb)' }} />
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" transform="rotate(45 8 8)" stroke="#E85A70" strokeWidth="1" fill="none" />
                  <circle cx="8" cy="8" r="2.5" fill="#E85A70" fillOpacity="0.7" />
                </svg>
                <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, #e5e7eb, transparent)' }} />
              </div>

              {/* QR Code with rose corner brackets */}
              <div style={{
                position: 'relative',
                padding: '14px',
                background: 'white',
                border: '0.5px solid rgba(232,90,112,0.12)',
                boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
                marginBottom: '14px',
                display: 'inline-flex',
              }}>
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: 4, left: 4, width: 10, height: 10, borderTop: '2px solid #E85A70', borderLeft: '2px solid #E85A70' }} />
                <div style={{ position: 'absolute', top: 4, right: 4, width: 10, height: 10, borderTop: '2px solid #E85A70', borderRight: '2px solid #E85A70' }} />
                <div style={{ position: 'absolute', bottom: 4, left: 4, width: 10, height: 10, borderBottom: '2px solid #E85A70', borderLeft: '2px solid #E85A70' }} />
                <div style={{ position: 'absolute', bottom: 4, right: 4, width: 10, height: 10, borderBottom: '2px solid #E85A70', borderRight: '2px solid #E85A70' }} />

                <QRCodeSVG
                  value={eventUrl}
                  size={160}
                  fgColor={event.qr_code_fg_color || '#111827'}
                  bgColor="#ffffff"
                  includeMargin={false}
                  level={(event.qr_code_level as 'L' | 'M' | 'Q' | 'H') || 'H'}
                  imageSettings={event.qr_code_logo_url ? {
                    src: event.qr_code_logo_url,
                    height: event.qr_code_logo_size || 28,
                    width: event.qr_code_logo_size || 28,
                    excavate: true,
                  } : undefined}
                />
              </div>

              {/* Headline in rose */}
              <p style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#E85A70',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}>
                {meta.headline}
              </p>

              {/* CTA */}
              <p style={{
                fontSize: '11px',
                color: '#6b7280',
                lineHeight: 1.5,
                marginBottom: '12px',
              }}>
                {meta.cta}
              </p>

              {/* Bottom ornamental divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', marginBottom: '8px' }}>
                <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, transparent, #e5e7eb)' }} />
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1.5" y="1.5" width="13" height="13" transform="rotate(45 8 8)" stroke="#E85A70" strokeWidth="1" fill="none" />
                  <circle cx="8" cy="8" r="2.5" fill="#E85A70" fillOpacity="0.7" />
                </svg>
                <div style={{ flex: 1, height: '0.5px', background: 'linear-gradient(90deg, #e5e7eb, transparent)' }} />
              </div>

              {/* URL */}
              <p style={{
                fontSize: '8.5px',
                color: '#9ca3af',
                fontFamily: "'Courier New', 'Courier', monospace",
                wordBreak: 'break-all',
                lineHeight: 1.4,
                marginBottom: '6px',
              }}>
                {eventUrl}
              </p>

              {/* Branding */}
              <p style={{
                fontSize: '8px',
                color: '#E85A70',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.6,
              }}>
                lume photobooth
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-gray-100 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-[#E85A70] hover:bg-[#d94f65] transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}
