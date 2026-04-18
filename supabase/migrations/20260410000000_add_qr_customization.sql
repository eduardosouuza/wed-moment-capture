-- Migration: Add QR Code customization columns to events table
-- Date: 2026-04-10

ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS qr_code_fg_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS qr_code_bg_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS qr_code_margin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_code_level TEXT DEFAULT 'H',
ADD COLUMN IF NOT EXISTS qr_code_logo_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_logo_size INTEGER DEFAULT 24;

-- Comentários para documentação no banco
COMMENT ON COLUMN public.events.qr_code_fg_color IS 'Cor principal (foreground) do QRCode do evento';
COMMENT ON COLUMN public.events.qr_code_bg_color IS 'Cor de fundo (background) do QRCode do evento';
COMMENT ON COLUMN public.events.qr_code_margin IS 'Se deve incluir margem de respiro no QRCode';
COMMENT ON COLUMN public.events.qr_code_level IS 'Nível de correção de erro (L, M, Q, H)';
COMMENT ON COLUMN public.events.qr_code_logo_url IS 'URL de um logo opcional para o centro do QRCode';
COMMENT ON COLUMN public.events.qr_code_logo_size IS 'Tamanho em pixels do logo centralizado';
