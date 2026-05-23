import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, Users, Calendar, DollarSign,
    Shield, RefreshCw, Image as ImageIcon, CreditCard,
    UserX,
} from 'lucide-react';
import type { Profile, Event, PaymentEntry, PaymentRow } from '@/types/database';
import { UsersTable } from '@/components/admin/UsersTable';
import { EventsTable } from '@/components/admin/EventsTable';
import { PaymentsTable } from '@/components/admin/PaymentsTable';
import { UserDetailModal } from '@/components/admin/UserDetailModal';

const PLAN_PRICES: Record<string, number> = {
    basico: 29.90,
    standard: 49.90,
    premium: 99.90,
};

type Period = 'all' | '7d' | '30d' | '3m';
type ActiveTab = 'users' | 'events' | 'payments';

const PERIOD_LABELS: Record<Period, string> = {
    all: 'Tudo',
    '7d': '7 dias',
    '30d': '30 dias',
    '3m': '3 meses',
};

function getPeriodCutoff(period: Period): Date {
    const d = new Date();
    if (period === '7d') d.setDate(d.getDate() - 7);
    else if (period === '30d') d.setDate(d.getDate() - 30);
    else if (period === '3m') d.setMonth(d.getMonth() - 3);
    return d;
}

const PLAN_CHART_COLORS = {
    premium: '#F59E0B',
    standard: '#8B5CF6',
    basico: '#3B82F6',
    free: '#E5E7EB',
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Raw data
    const [users, setUsers] = useState<Profile[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [subscriptions, setSubscriptions] = useState<PaymentEntry[]>([]);
    const [mediaCount, setMediaCount] = useState<Record<string, number>>({});

    // UI state
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [period, setPeriod] = useState<Period>('all');
    const [activeTab, setActiveTab] = useState<ActiveTab>('users');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
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
                const results = await Promise.all(
                    safeEvents.map(event =>
                        supabase.from('media').select('*', { count: 'exact', head: true }).eq('event_id', event.id)
                    )
                );
                safeEvents.forEach((event, i) => { counts[event.id] = results[i].count || 0; });
                setMediaCount(counts);
            }

            let subsData: PaymentRow[] = [];
            const subscribedUserIds = new Set<string>();

            try {
                const { data: subs } = await supabase
                    .from('subscriptions').select('*').order('created_at', { ascending: false });
                subsData = (subs as PaymentRow[]) || [];
                subsData.filter(s => s.status === 'active').forEach(s => subscribedUserIds.add(s.user_id));
            } catch { /* tabela não existe */ }

            const paidEventEntries: PaymentEntry[] = safeEvents
                .filter(e => e.payment_status === 'paid' && !subscribedUserIds.has(e.user_id))
                .map(e => ({
                    id: `event-${e.id}`, plan_type: e.plan || '',
                    amount: PLAN_PRICES[e.plan || ''] || 0, status: 'active' as const,
                    payment_gateway: 'evento', created_at: e.created_at, user_id: e.user_id,
                }));

            const subsEntries: PaymentEntry[] = subsData.map(s => ({
                id: s.id, user_id: s.user_id, plan_type: s.plan_type,
                amount: s.amount, status: s.status, payment_gateway: s.payment_gateway, created_at: s.created_at,
            }));

            setSubscriptions(
                [...subsEntries, ...paidEventEntries]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            );
        } catch (err: unknown) {
            console.error('Erro ao buscar dados:', err instanceof Error ? err.message : err);
            toast({ title: 'Erro ao carregar dados', description: 'Não foi possível carregar os dados do painel.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    // Period-filtered data
    const filteredUsers = useMemo(() => {
        if (period === 'all') return users;
        const cutoff = getPeriodCutoff(period);
        return users.filter(u => new Date(u.created_at) >= cutoff);
    }, [users, period]);

    const filteredEvents = useMemo(() => {
        if (period === 'all') return events;
        const cutoff = getPeriodCutoff(period);
        return events.filter(e => new Date(e.created_at) >= cutoff);
    }, [events, period]);

    const filteredPayments = useMemo(() => {
        if (period === 'all') return subscriptions;
        const cutoff = getPeriodCutoff(period);
        return subscriptions.filter(s => new Date(s.created_at) >= cutoff);
    }, [subscriptions, period]);

    // Computed stats (always from filtered data)
    const stats = useMemo(() => {
        const premiumUsers = filteredUsers.filter(u => u.plan === 'premium').length;
        const standardUsers = filteredUsers.filter(u => u.plan === 'standard').length;
        const basicoUsers = filteredUsers.filter(u => u.plan === 'basico').length;
        const paidUsers = premiumUsers + standardUsers + basicoUsers;
        const freeUsers = filteredUsers.length - paidUsers;
        const activeEvents = filteredEvents.filter(e => e.is_active).length;
        const totalRevenue = filteredPayments
            .filter(p => p.status === 'active')
            .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const conversionRate = filteredUsers.length > 0
            ? Math.round((paidUsers / filteredUsers.length) * 100) : 0;
        return {
            totalUsers: filteredUsers.length,
            totalEvents: filteredEvents.length,
            activeEvents,
            premiumUsers, standardUsers, basicoUsers, paidUsers, freeUsers,
            totalRevenue, conversionRate,
        };
    }, [filteredUsers, filteredEvents, filteredPayments]);

    // Always all-time metrics
    const totalMediaCount = useMemo(
        () => Object.values(mediaCount).reduce((a, b) => a + b, 0),
        [mediaCount]
    );
    const usersWithoutEvents = useMemo(() => {
        const withEvents = new Set(events.map(e => e.user_id));
        return users.filter(u => !withEvents.has(u.id)).length;
    }, [users, events]);
    const estimatedStorage = useMemo(() => {
        const mb = totalMediaCount * 3;
        return mb >= 1024 ? `≈ ${(mb / 1024).toFixed(1)} GB` : `≈ ${mb} MB`;
    }, [totalMediaCount]);

    // Donut chart data
    const planChartData = useMemo(() => {
        const raw = [
            { name: 'Premium', value: stats.premiumUsers, color: PLAN_CHART_COLORS.premium },
            { name: 'Standard', value: stats.standardUsers, color: PLAN_CHART_COLORS.standard },
            { name: 'Básico', value: stats.basicoUsers, color: PLAN_CHART_COLORS.basico },
            { name: 'Free', value: stats.freeUsers, color: PLAN_CHART_COLORS.free },
        ].filter(d => d.value > 0);
        return raw.length > 0 ? raw : [{ name: 'Vazio', value: 1, color: '#F3F4F6' }];
    }, [stats]);

    // Event handlers
    const handleDeleteEvent = async (eventId: string, eventName: string) => {
        if (!window.confirm(`Excluir o evento "${eventName}"? Esta ação não pode ser desfeita.`)) return;
        setActionLoading(eventId);
        try {
            const { error } = await supabase.from('events').delete().eq('id', eventId);
            if (error) throw error;
            setEvents(prev => prev.filter(e => e.id !== eventId));
            toast({ title: 'Evento excluído', description: `"${eventName}" foi excluído com sucesso.` });
        } catch {
            toast({ title: 'Erro ao excluir', variant: 'destructive' });
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
            toast({ title: currentStatus ? 'Evento desativado' : 'Evento ativado' });
        } catch {
            toast({ title: 'Erro ao atualizar', variant: 'destructive' });
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

    const TABS = [
        { id: 'users' as ActiveTab, label: 'Usuários', count: filteredUsers.length, icon: Users },
        { id: 'events' as ActiveTab, label: 'Eventos', count: filteredEvents.length, icon: Calendar },
        { id: 'payments' as ActiveTab, label: 'Pagamentos', count: filteredPayments.length, icon: CreditCard },
    ];

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
        <div className="min-h-screen bg-[#F2F3F5]">
            {/* Header */}
            <header className="bg-[#1c1c1e] text-white sticky top-0 z-10 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#E85A70]/20 border border-[#E85A70]/30 flex items-center justify-center">
                                <Shield className="w-3.5 h-3.5 text-[#E85A70]" />
                            </div>
                            <div>
                                <p className="font-bold text-sm leading-tight text-white">Painel Admin</p>
                                <p className="text-[11px] text-gray-500 leading-tight">Lume Platform</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={fetchData}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                title="Atualizar dados"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <Button
                                variant="ghost" size="sm"
                                onClick={() => navigate('/dashboard')}
                                className="text-gray-400 hover:text-white hover:bg-white/10 text-xs h-8 px-3"
                            >
                                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                                Voltar
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

                {/* Period filter */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 font-medium mr-1">Período:</span>
                    {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                                period === p
                                    ? 'bg-[#1c1c1e] text-white shadow-sm'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            {PERIOD_LABELS[p]}
                        </button>
                    ))}
                    {period !== 'all' && (
                        <span className="ml-1 text-[11px] text-gray-400 italic">
                            Mostrando dados dos últimos {PERIOD_LABELS[period]}
                        </span>
                    )}
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                    {/* Usuários — com donut chart */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm col-span-2 sm:col-span-1">
                        <div className="flex items-start justify-between mb-1">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Usuários</p>
                            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Users className="w-3.5 h-3.5 text-blue-500" />
                            </div>
                        </div>

                        {/* Donut + number side-by-side */}
                        <div className="flex items-center gap-4 mt-2">
                            <div className="relative flex-shrink-0">
                                <PieChart width={76} height={76}>
                                    <Pie
                                        data={planChartData}
                                        cx={38} cy={38}
                                        innerRadius={26} outerRadius={36}
                                        dataKey="value"
                                        strokeWidth={0}
                                        startAngle={90} endAngle={-270}
                                    >
                                        {planChartData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-base font-extrabold text-[#1c1c1e] leading-none">
                                        {stats.totalUsers}
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-1 min-w-0">
                                {stats.premiumUsers > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                                        <span className="text-[11px] text-gray-600">{stats.premiumUsers} premium</span>
                                    </div>
                                )}
                                {stats.standardUsers > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-purple-500 flex-shrink-0" />
                                        <span className="text-[11px] text-gray-600">{stats.standardUsers} standard</span>
                                    </div>
                                )}
                                {stats.basicoUsers > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                                        <span className="text-[11px] text-gray-600">{stats.basicoUsers} básico</span>
                                    </div>
                                )}
                                {stats.freeUsers > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
                                        <span className="text-[11px] text-gray-500">{stats.freeUsers} free</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sem evento indicator */}
                        {usersWithoutEvents > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
                                <UserX className="w-3 h-3 text-amber-500" />
                                <span className="text-[11px] text-amber-600 font-medium">{usersWithoutEvents} sem evento</span>
                                <span className="text-[11px] text-gray-400">· nunca ativaram</span>
                            </div>
                        )}
                    </div>

                    {/* Eventos */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Eventos</p>
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-[#1c1c1e] tracking-tight mb-3">{stats.totalEvents}</p>
                        <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                {stats.activeEvents} ativos
                            </span>
                            {stats.totalEvents - stats.activeEvents > 0 && (
                                <>
                                    <span className="text-gray-200">·</span>
                                    <span className="text-[11px] text-gray-400">{stats.totalEvents - stats.activeEvents} inativos</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mídias */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Mídias</p>
                            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-[#1c1c1e] tracking-tight mb-3">
                            {totalMediaCount.toLocaleString('pt-BR')}
                        </p>
                        <div className="space-y-1">
                            <p className="text-[11px] text-gray-400">
                                {events.length > 0
                                    ? `≈ ${Math.round(totalMediaCount / events.length)} por evento`
                                    : 'Fotos e vídeos'}
                            </p>
                            <p className="text-[11px] text-gray-300">{estimatedStorage} estimado</p>
                        </div>
                    </div>

                    {/* Receita */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100/80 shadow-sm">
                        <div className="flex items-start justify-between mb-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Receita</p>
                            <div className="w-7 h-7 rounded-lg bg-[#E85A70]/10 flex items-center justify-center">
                                <DollarSign className="w-3.5 h-3.5 text-[#E85A70]" />
                            </div>
                        </div>
                        <p className="text-3xl font-extrabold text-[#1c1c1e] tracking-tight mb-3">
                            R$ {stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-semibold text-[#E85A70]">{stats.conversionRate}% conversão</span>
                            <span className="text-gray-200">·</span>
                            <span className="text-[11px] text-gray-400">{stats.paidUsers} pagantes</span>
                        </div>
                    </div>
                </div>

                {/* Tabbed Tables */}
                <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden">
                    {/* Tab Bar */}
                    <div className="border-b border-gray-100 px-2 flex items-center">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all ${
                                    activeTab === tab.id
                                        ? 'border-[#E85A70] text-[#E85A70]'
                                        : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
                                }`}
                            >
                                <tab.icon className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">{tab.label}</span>
                                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full leading-none ${
                                    activeTab === tab.id
                                        ? 'bg-[#E85A70]/10 text-[#E85A70]'
                                        : 'bg-gray-100 text-gray-400'
                                }`}>
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </div>

                    {activeTab === 'users' && (
                        <UsersTable
                            users={filteredUsers}
                            formatDate={formatDate}
                            onUserClick={setSelectedUser}
                        />
                    )}
                    {activeTab === 'events' && (
                        <EventsTable
                            events={filteredEvents}
                            mediaCount={mediaCount}
                            actionLoading={actionLoading}
                            formatDate={formatDate}
                            onToggleStatus={handleToggleEventStatus}
                            onDelete={handleDeleteEvent}
                            onEdit={(id) => navigate(`/events/${id}/edit`)}
                        />
                    )}
                    {activeTab === 'payments' && (
                        <PaymentsTable subscriptions={filteredPayments} formatDate={formatDate} />
                    )}
                </div>
            </main>

            {/* User detail modal */}
            {selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    events={events}
                    payments={subscriptions}
                    formatDate={formatDate}
                    onClose={() => setSelectedUser(null)}
                />
            )}
        </div>
    );
}
