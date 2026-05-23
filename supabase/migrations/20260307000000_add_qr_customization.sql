-- Migration to add QR Code customization fields to events table
ALTER TABLE events
ADD COLUMN IF NOT EXISTS qr_code_fg_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS qr_code_bg_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS qr_code_margin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_code_level TEXT DEFAULT 'H',
ADD COLUMN IF NOT EXISTS qr_code_logo_url TEXT,
ADD COLUMN IF NOT EXISTS qr_code_logo_size INTEGER DEFAULT 24;

-- Update existing rows to have defaults if not set (though DEFAULT takes care of new rows)
UPDATE events SET 
  qr_code_fg_color = COALESCE(qr_code_fg_color, '#000000'),
  qr_code_bg_color = COALESCE(qr_code_bg_color, '#FFFFFF'),
  qr_code_margin = COALESCE(qr_code_margin, false),
  qr_code_level = COALESCE(qr_code_level, 'H'),
  qr_code_logo_size = COALESCE(qr_code_logo_size, 24)
WHERE qr_code_fg_color IS NULL;
