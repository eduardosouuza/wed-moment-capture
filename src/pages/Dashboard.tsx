import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useToast } from '@/hooks/use-toast';
import { EventCard } from '@/components/EventCard';
import {
    LogOut,
    Plus,
    Calendar,
    Shield,
    RefreshCw,
    Sparkles,
} from 'lucide-react';
import type { Event } from '@/types/database';

const PLAN_LIMITS: Record<string, { events: number; photos: number; label: string }> = {
    basico: { events: 1, photos: 100, label: 'Básico' },
    standard: { events: 1, photos: Infinity, label: 'Standard' },
    premium: { events: Infinity, photos: Infinity, label: 'Premium' },
};

export default function Dashboard() {
    const { user, profile, signOut, isAdmin } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<Event[]>([]);
    const [mediaCount, setMediaCount] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchEvents = useCallback(async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const safeData = (data as Event[]) || [];
            setEvents(safeData);

            if (safeData.length > 0) {
                const counts: Record<string, number> = {};
                const results = await Promise.all(
                    safeData.map(event =>
                        supabase
                            .from('media')
                            .select('*', { count: 'exact', head: true })
                            .eq('event_id', event.id)
                    )
                );
                safeData.forEach((event, i) => {
                    counts[event.id] = results[i].count || 0;
                });
                setMediaCount(counts);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao buscar eventos:', msg);
            toast({ title: 'Erro ao carregar eventos', description: 'Tente recarregar a página.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const copyToClipboard = async (eventSlug: string, eventId: string) => {
        const url = `${window.location.origin}/e/${eventSlug}`;
        try {
            await navigator.clipboard.writeText(url);
        } catch {
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
        }
        setCopiedId(eventId);
        toast({ title: 'Link copiado!' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const downloadQRCode = (eventSlug: string) => {
        const svg = document.querySelector(`#qr-${eventSlug}`) as SVGSVGElement | null;
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${eventSlug}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({ title: 'QR Code baixado!' });
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-[#ede7e4] border-t-[#E85A70] rounded-full animate-spin" />
                    <span className="text-sm text-gray-400 font-medium">Carregando...</span>
                </div>
            </div>
        );
    }

    const currentPlan = profile?.plan || 'basico';
    const limits = PLAN_LIMITS[currentPlan] || PLAN_LIMITS.basico;
    const totalPhotos = Object.values(mediaCount).reduce((a, b) => a + b, 0);
    const planLabel = PLAN_LIMITS[currentPlan]?.label || 'Básico';

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-[#ede7e4] sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
                    <div className="flex items-center justify-between">
                        <Logo size="md" variant="dark" />

                        <div className="flex items-center gap-2">
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/admin')}
                                    className="text-[#E85A70] hover:text-[#d94f65] hover:bg-[#FDF2F4] text-sm font-semibold"
                                >
                                    <Shield className="w-4 h-4 sm:mr-1.5" />
                                    <span className="hidden sm:inline">Admin</span>
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchEvents()}
                                className="text-gray-400 hover:text-gray-600 hover:bg-[#F8F9FA]"
                                title="Atualizar"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <div className="w-px h-5 bg-[#ede7e4] mx-1" />
                            <div className="hidden sm:block text-right mr-1">
                                <p className="text-sm font-semibold text-[#1c1c1e] leading-tight">
                                    {profile?.full_name || 'Minha Conta'}
                                </p>
                                <p className="text-xs text-gray-400">{profile?.email}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSignOut}
                                className="text-gray-400 hover:text-gray-600 hover:bg-[#F8F9FA]"
                                title="Sair"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page title + action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="font-display text-2xl font-extrabold text-[#1c1c1e]">
                            Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'} 👋
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            <span className="font-semibold text-[#1c1c1e]">{events.length}</span> {events.length === 1 ? 'evento' : 'eventos'}
                            {' · '}
                            <span className="font-semibold text-[#1c1c1e]">{totalPhotos}</span> {totalPhotos === 1 ? 'mídia' : 'mídias'}
                            {' · '}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FDF2F4] border border-[#fbdde2] text-[10px] font-bold text-[#E85A70] uppercase tracking-wide">
                                {planLabel}
                            </span>
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/events/new')}
                        className="btn-rose px-5 rounded-xl text-sm font-bold shadow-sm"
                        disabled={limits.events !== Infinity && events.length >= limits.events}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Evento
                    </Button>
                </div>

                {/* Empty state */}
                {events.length === 0 ? (
                    <div className="bento-card text-center py-20 px-6">
                        <div className="w-16 h-16 bg-[#FDF2F4] border border-[#fbdde2] rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <Calendar className="w-7 h-7 text-[#E85A70]" />
                        </div>
                        <h3 className="font-display text-lg font-extrabold text-[#1c1c1e] mb-2">
                            Crie seu primeiro evento
                        </h3>
                        <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                            Configure em minutos e compartilhe o QR Code com seus convidados
                        </p>
                        <Button
                            onClick={() => navigate('/events/new')}
                            className="btn-rose px-6 rounded-xl text-sm font-bold"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Evento
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {events.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                mediaCount={mediaCount[event.id] || 0}
                                copiedId={copiedId}
                                onCopyLink={copyToClipboard}
                                onDownloadQR={downloadQRCode}
                                formatDate={formatDate}
                            />
                        ))}
                    </div>
                )}

                {/* Upgrade banner */}
                {currentPlan === 'basico' && (
                    <div className="mt-8 rounded-3xl bg-[#1c1c1e] p-7 sm:p-8 text-white relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#E85A70]/10 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[#E85A70]/5 blur-2xl pointer-events-none" />
                        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                            <div>
                                <div className="inline-flex items-center gap-1.5 bg-[#E85A70]/20 border border-[#E85A70]/30 rounded-full px-3 py-1 text-xs font-bold text-[#E85A70] mb-3 uppercase tracking-wide">
                                    <Sparkles className="w-3 h-3" />
                                    Upgrade disponível
                                </div>
                                <h3 className="font-display text-xl font-extrabold mb-1.5">
                                    Desbloqueie mais recursos
                                </h3>
                                <p className="text-gray-400 text-sm max-w-md">
                                    Mais eventos, fotos ilimitadas, sem marca d'água e suporte prioritário.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => navigate('/plans')}
                                className="bg-white text-[#1c1c1e] hover:bg-gray-100 rounded-xl shadow-lg flex-shrink-0 font-bold text-sm"
                            >
                                Ver Planos
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
