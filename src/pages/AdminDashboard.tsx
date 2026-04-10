import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft,
    Users,
    Calendar,
    TrendingUp,
    DollarSign,
    Shield,
    RefreshCw,
    Image as ImageIcon,
} from 'lucide-react';
import type { Profile, Event, PaymentEntry, SubscriptionRow } from '@/types/database';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsTable } from '@/components/admin/EventsTable';
import { PaymentsTable } from '@/components/admin/PaymentsTable';

const PLAN_PRICES: Record<string, number> = {
    basico: 29.90,
    standard: 49.90,
    premium: 99.90,
};

interface DashboardStats {
    totalUsers: number;
    totalEvents: number;
    activeEvents: number;
    freeUsers: number;
    basicUsers: number;
    premiumUsers: number;
    totalRevenue: number;
    totalMediaCount: number;
    totalSubscriptions: number;
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [subscriptions, setSubscriptions] = useState<PaymentEntry[]>([]);
    const [mediaCount, setMediaCount] = useState<Record<string, number>>({});
    const [stats, setStats] = useState<DashboardStats>({
        totalUsers: 0, totalEvents: 0, activeEvents: 0,
        freeUsers: 0, basicUsers: 0, premiumUsers: 0,
        totalRevenue: 0, totalMediaCount: 0, totalSubscriptions: 0,
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            const { data: usersData, error: usersError } = await supabase
                .from('profiles').select('*').order('created_at', { ascending: false });
            if (usersError) throw usersError;

            const { data: eventsData, error: eventsError } = await supabase
                .from('events').select('*').order('created_at', { ascending: false });
            if (eventsError) throw eventsError;

            const safeUsers = (usersData as Profile[]) || [];
            const safeEvents = (eventsData as Event[]) || [];

            setUsers(safeUsers);
            setEvents(safeEvents);

            if (safeEvents.length > 0) {
                const counts: Record<string, number> = {};
                let totalMedia = 0;
                const results = await Promise.all(
                    safeEvents.map(event =>
                        supabase.from('media').select('*', { count: 'exact', head: true }).eq('event_id', event.id)
                    )
                );
                safeEvents.forEach((event, i) => {
                    const c = results[i].count || 0;
                    counts[event.id] = c;
                    totalMedia += c;
                });
                setMediaCount(counts);
                setStats(prev => ({ ...prev, totalMediaCount: totalMedia }));
            }

            const freeUsers = safeUsers.filter(u => u.plan === 'free').length;
            const basicUsers = safeUsers.filter(u => ['basic', 'basico'].includes(u.plan || '')).length;
            const premiumUsers = safeUsers.filter(u => u.plan === 'premium').length;
            const standardUsers = safeUsers.filter(u => u.plan === 'standard').length;
            const activeEvents = safeEvents.filter(e => e.is_active).length;

            let revenue = 0;
            let subsData: SubscriptionRow[] = [];
            const subscribedUserIds = new Set<string>();

            try {
                const { data: subs } = await supabase
                    .from('subscriptions').select('*').order('created_at', { ascending: false });
                subsData = (subs as SubscriptionRow[]) || [];
                revenue = subsData
                    .filter(s => s.status === 'active')
                    .reduce((sum, sub) => {
                        subscribedUserIds.add(sub.user_id);
                        return sum + (Number(sub.amount) || 0);
                    }, 0);
            } catch { /* tabela não existe */ }

            const paidEvents = safeEvents.filter(e => e.payment_status === 'paid');
            const paidEventEntries: PaymentEntry[] = paidEvents
                .filter(e => !subscribedUserIds.has(e.user_id))
                .map(e => ({
                    id: `event-${e.id}`, plan_type: e.plan || 'free',
                    amount: PLAN_PRICES[e.plan || ''] || 0, status: 'active' as const,
                    payment_gateway: 'evento', created_at: e.created_at, user_id: e.user_id,
                }));

            const subsEntries: PaymentEntry[] = subsData.map(s => ({
                id: s.id, user_id: s.user_id, plan_type: s.plan_type,
                amount: s.amount, status: s.status, payment_gateway: s.payment_gateway, created_at: s.created_at,
            }));

            const allPayments = [...subsEntries, ...paidEventEntries]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setSubscriptions(allPayments);

            const paidEventsWithoutSub = safeEvents.filter(e =>
                e.payment_status === 'paid' && !subscribedUserIds.has(e.user_id)
            );
            revenue += paidEventsWithoutSub.reduce((sum, event) => sum + (PLAN_PRICES[event.plan || ''] || 0), 0);

            setStats(prev => ({
                ...prev, totalUsers: safeUsers.length, totalEvents: safeEvents.length, activeEvents,
                freeUsers, basicUsers: basicUsers + standardUsers, premiumUsers,
                totalRevenue: revenue, totalSubscriptions: subsData.length,
            }));
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao buscar dados:', msg);
            toast({ title: 'Erro ao carregar dados', description: 'Não foi possível carregar os dados do painel.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleDeleteEvent = async (eventId: string, eventName: string) => {
        if (!window.confirm(`Excluir o evento "${eventName}"? Esta ação não pode ser desfeita.`)) return;
        setActionLoading(eventId);
        try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            setEvents(prev => prev.filter(e => e.id !== eventId));
            setStats(prev => ({ ...prev, totalEvents: prev.totalEvents - 1 }));
            toast({ title: 'Evento excluído', description: `"${eventName}" foi excluído com sucesso.` });
        } catch {
            toast({ title: 'Erro ao excluir', description: 'Não foi possível excluir o evento.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleEventStatus = async (eventId: string, currentStatus: boolean) => {
        setActionLoading(eventId);
        try {
            const { error } = await (supabase.from('events') as any).update({ is_active: !currentStatus }).eq('id', eventId);
            if (error) throw error;
            setEvents(prev => prev.map(e => e.id === eventId ? { ...e, is_active: !currentStatus } : e));
            setStats(prev => ({
                ...prev,
                activeEvents: currentStatus ? prev.activeEvents - 1 : prev.activeEvents + 1,
            }));
            toast({ title: currentStatus ? 'Evento desativado' : 'Evento ativado' });
        } catch (err: unknown) {
            toast({ title: 'Erro ao atualizar', description: 'Não foi possível atualizar o status.', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-2 border-[#ede7e4] border-t-[#E85A70] rounded-full animate-spin" />
                    <span className="text-sm text-gray-400 font-medium">Carregando painel...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-[#1c1c1e] text-white sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#E85A70]/20 border border-[#E85A70]/30 flex items-center justify-center">
                                <Shield className="w-4 h-4 text-[#E85A70]" />
                            </div>
                            <div>
                                <h1 className="font-display text-lg font-extrabold">Painel Administrativo</h1>
                                <p className="text-gray-400 text-xs">Visão geral da plataforma</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => fetchData()}
                                className="text-gray-400 hover:text-white hover:bg-white/10"
                                title="Atualizar"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white hover:bg-white/10 text-sm font-medium"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <StatCard
                        label="Total Usuários"
                        value={stats.totalUsers}
                        sub={`${stats.freeUsers} grátis · ${stats.basicUsers} pagos · ${stats.premiumUsers} premium`}
                        icon={Users}
                        color="#3B82F6"
                    />
                    <StatCard
                        label="Total Eventos"
                        value={stats.totalEvents}
                        sub={`${stats.activeEvents} ativos`}
                        icon={Calendar}
                        color="#10B981"
                    />
                    <StatCard
                        label="Total Mídias"
                        value={stats.totalMediaCount}
                        sub="Fotos e vídeos"
                        icon={ImageIcon}
                        color="#F59E0B"
                    />
                    <StatCard
                        label="Conversão"
                        value={`${stats.totalUsers > 0 ? Math.round(((stats.basicUsers + stats.premiumUsers) / stats.totalUsers) * 100) : 0}%`}
                        sub={`${stats.basicUsers + stats.premiumUsers} pagantes`}
                        icon={TrendingUp}
                        color="#E85A70"
                    />
                    <StatCard
                        label="Receita Total"
                        value={`R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        sub="Eventos pagos"
                        icon={DollarSign}
                        color="#8B5CF6"
                    />
                </div>

                <UsersTable users={users} formatDate={formatDate} />
                <EventsTable
                    events={events}
                    mediaCount={mediaCount}
                    actionLoading={actionLoading}
                    formatDate={formatDate}
                    onToggleStatus={handleToggleEventStatus}
                    onDelete={handleDeleteEvent}
                    onEdit={(id) => navigate(`/events/${id}/edit`)}
                />
                <PaymentsTable subscriptions={subscriptions} formatDate={formatDate} />
            </main>
        </div>
    );
}

function StatCard({
    label, value, sub, icon: Icon, color,
}: {
    label: string;
    value: string | number;
    sub: string;
    icon: typeof Users;
    color: string;
}) {
    return (
        <div className="bento-card p-5">
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-400 truncate mb-1">{label}</p>
                    <p className="font-display text-2xl font-extrabold text-[#1c1c1e]">{value}</p>
                    <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">{sub}</p>
                </div>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}25` }}
                >
                    <Icon className="w-4 h-4" style={{ color }} />
                </div>
            </div>
        </div>
    );
}
