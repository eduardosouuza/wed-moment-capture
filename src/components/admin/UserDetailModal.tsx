import { X, Calendar, CreditCard, ExternalLink } from 'lucide-react';
import type { Profile, Event, PaymentEntry } from '@/types/database';

interface Props {
    user: Profile;
    events: Event[];
    payments: PaymentEntry[];
    formatDate: (d: string) => string;
    onClose: () => void;
}

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
    'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600', 'bg-sky-100 text-sky-600',
];

function getAvatarColor(id: string) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function UserDetailModal({ user, events, payments, formatDate, onClose }: Props) {
    const userEvents = events.filter(e => e.user_id === user.id);
    const userPayments = payments.filter(p => p.user_id === user.id);
    const avatarColor = getAvatarColor(user.id);
    const initials = getInitials(user.full_name || '');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor}`}>
                            {initials}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 leading-tight">{user.full_name || 'Sem nome'}</p>
                            <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 text-xs flex-wrap">
                    <span className="text-gray-500">
                        Plano: <PlanBadge plan={user.plan || ''} />
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                        user.role === 'admin' ? 'bg-[#E85A70]/10 text-[#E85A70]' : 'bg-gray-100 text-gray-500'
                    }`}>
                        {user.role}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400">Cadastrou em {formatDate(user.created_at)}</span>
                </div>

                {/* Content */}
                <div className="overflow-y-auto flex-1 p-5 space-y-5">
                    {/* Events */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                            Eventos ({userEvents.length})
                        </h3>
                        {userEvents.length === 0 ? (
                            <div className="py-5 text-center bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-400">Nenhum evento criado</p>
                                <p className="text-xs text-gray-300 mt-0.5">Este usuário ainda não fez nenhum evento</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {userEvents.map(ev => (
                                    <div key={ev.id} className="flex items-center justify-between px-3.5 py-3 bg-gray-50 rounded-xl gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{ev.name}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <a
                                                    href={`/e/${ev.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-gray-400 hover:text-[#E85A70] inline-flex items-center gap-0.5 transition-colors"
                                                >
                                                    /{ev.slug}
                                                    <ExternalLink className="w-2.5 h-2.5" />
                                                </a>
                                                <span className="text-gray-200">·</span>
                                                <span className="text-xs text-gray-400">{formatDate(ev.created_at)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`w-1.5 h-1.5 rounded-full ${ev.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                                            <PlanBadge plan={ev.plan || ''} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Payments */}
                    <section>
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#E85A70]" />
                            Pagamentos ({userPayments.length})
                        </h3>
                        {userPayments.length === 0 ? (
                            <div className="py-5 text-center bg-gray-50 rounded-xl">
                                <p className="text-sm text-gray-400">Nenhum pagamento registrado</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {userPayments.map(pay => (
                                    <div key={pay.id} className="flex items-center justify-between px-3.5 py-3 bg-gray-50 rounded-xl">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">
                                                R$ {Number(pay.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                                                {pay.payment_gateway} · {formatDate(pay.created_at)}
                                            </p>
                                        </div>
                                        <PayStatusBadge status={pay.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    const config: Record<string, { label: string; style: string }> = {
        premium: { label: 'Premium', style: 'bg-amber-50 text-amber-700 border-amber-100' },
        standard: { label: 'Standard', style: 'bg-purple-50 text-purple-700 border-purple-100' },
        basico: { label: 'Básico', style: 'bg-blue-50 text-blue-700 border-blue-100' },
    };
    const { label, style } = config[plan] || { label: plan || 'Free', style: 'bg-gray-50 text-gray-500 border-gray-100' };
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style}`}>
            {label}
        </span>
    );
}

function PayStatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; style: string }> = {
        active: { label: 'Ativo', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        pending: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-100' },
        failed: { label: 'Falhou', style: 'bg-red-50 text-red-700 border-red-100' },
    };
    const { label, style } = config[status] || { label: status, style: 'bg-gray-50 text-gray-500 border-gray-100' };
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style}`}>
            {label}
        </span>
    );
}
