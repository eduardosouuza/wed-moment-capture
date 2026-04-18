import * as z from "zod";

export const eventFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "A URL deve ter pelo menos 3 caracteres").regex(/^[a-z0-9-]+$/, "A URL deve conter apenas letras minúsculas, números e hifens"),
  event_type: z.enum(['wedding', 'birthday', 'corporate', 'party']),
  event_date: z.string().optional().nullable(),
  couple_name_1: z.string().optional().nullable(),
  couple_name_2: z.string().optional().nullable(),
  birthday_person_name: z.string().optional().nullable(),
  birthday_age: z.number().optional().nullable(),
  company_name: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  host_name: z.string().optional().nullable(),
  party_reason: z.string().optional().nullable(),
  theme_color: z.string(), // Allowing strings since there's a mismatch in types
  description: z.string().optional().nullable(),
  // QR Code
  qr_code_fg_color: z.string().default('#000000'),
  qr_code_bg_color: z.string().default('#FFFFFF'),
  qr_code_margin: z.boolean().default(false),
  qr_code_level: z.string().default('H'),
  qr_code_logo_url: z.string().optional().nullable(),
  qr_code_logo_size: z.number().default(24),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;
