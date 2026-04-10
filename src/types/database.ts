// Tipos gerados baseados no schema do Supabase

export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'basic' | 'basico' | 'standard' | 'premium';
export type EventType = 'wedding' | 'birthday' | 'corporate' | 'party';
export type ThemeColor = 'purple' | 'blue' | 'pink' | 'green' | 'orange' | 'red';
export type MediaType = 'photo' | 'video';
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    role: UserRole;
    plan: PlanType;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface Event {
    id: string;
    user_id: string;

    // Informações básicas
    name: string;
    slug: string;
    event_type: EventType;
    event_date: string | null;
    description: string | null;

    // Personalização
    couple_name_1: string | null;
    couple_name_2: string | null;
    theme_color: ThemeColor;
    custom_message: string | null;
    logo_url: string | null;

    // Configurações
    max_photos: number;
    max_videos: number;
    max_video_duration: number;
    photo_sequence_count: number;
    countdown_seconds: number;
    is_active: boolean;
    requires_password: boolean;
    password_hash: string | null;

    // Trial system
    is_trial: boolean;
    photo_count: number;
    photo_limit: number;
    trial_expires_at: string | null;

    // Plano e pagamento
    plan: PlanType;
    payment_status: PaymentStatus;
    amount_paid: number | null;
    payment_id: string | null;
    paid_at: string | null;
    subscription_id: string; // Obrigatório - evento deve ter subscription paga

    // Timestamps
    created_at: string;
    updated_at: string;
    starts_at: string | null;
    ends_at: string | null;
}

export interface Media {
    id: string;
    event_id: string;
    file_path: string;
    file_size: number | null;
    media_type: MediaType;

    // Engajamento
    likes: number;
    views: number;
    is_featured: boolean;

    // Moderação
    is_approved: boolean;
    moderation_status: ModerationStatus;

    uploaded_at: string;
}

export interface Analytics {
    id: string;
    event_id: string;
    metric_type: string;
    metadata: Record<string, any> | null;
    device_info: Record<string, any> | null;
    created_at: string;
}

// Tipos para criação (sem campos auto-gerados, defaults são opcionais)
export type CreateProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type CreateEvent = Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>> & { name: string; slug: string; user_id: string };
export type CreateMedia = Partial<Omit<Media, 'id' | 'uploaded_at'>> & { event_id: string; file_path: string; media_type: MediaType };
export type CreateAnalytics = Omit<Analytics, 'id' | 'created_at'>;

// Tipos para update (todos os campos opcionais)
export type UpdateProfile = Partial<Omit<Profile, 'id' | 'created_at'>>;
export type UpdateEvent = Partial<Omit<Event, 'id' | 'user_id' | 'created_at'>>;
export type UpdateMedia = Partial<Omit<Media, 'id' | 'event_id' | 'uploaded_at'>>;

// Tipo para entrada de pagamento (subscriptions + eventos pagos)
export interface PaymentEntry {
    id: string;
    user_id: string;
    plan_type: string;
    amount: number;
    status: 'active' | 'pending' | 'canceled' | 'expired';
    payment_gateway: string;
    created_at: string;
}

// Tipo para linha da tabela subscriptions no Supabase
export interface SubscriptionRow {
    id: string;
    user_id: string;
    plan_type: string;
    amount: number;
    status: 'active' | 'pending' | 'canceled' | 'expired';
    payment_gateway: string;
    created_at: string;
}

// Database types para Supabase
export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: CreateProfile;
                Update: UpdateProfile;
            };
            events: {
                Row: Event;
                Insert: CreateEvent;
                Update: UpdateEvent;
            };
            media: {
                Row: Media;
                Insert: CreateMedia;
                Update: UpdateMedia;
            };
            analytics: {
                Row: Analytics;
                Insert: CreateAnalytics;
                Update: Partial<Analytics>;
            };
            pending_subscriptions: {
                Row: Record<string, unknown>;
                Insert: Record<string, unknown>;
                Update: Record<string, unknown>;
            };
        };
    };
}
