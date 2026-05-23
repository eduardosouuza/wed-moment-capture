import { useState } from 'react';
import { Search, Download, ExternalLink, Image as ImageIcon, Power, PowerOff, Edit, Trash2, CreditCard } from 'lucide-react';
import type { Event } from '@/types/database';
import { exportToCsv } from '@/lib/exportCsv';

interface EventsTableProps {
    events: Event[];
    mediaCount: Record<string, number>;
    actionLoading: string | null;
    formatDate: (dateString: string) => string;
    onToggleStatus: (eventId: string, currentStatus: boolean) => void;
    onDelete: (eventId: string, eventName: string) => void;
    onEdit: (eventId: string) => void;
}

export function EventsTable({
    events, mediaCount, actionLoading, formatDate,
    onToggleStatus, onDelete, onEdit,
}: EventsTableProps) {
    const [search, setSearch] = useState('');

    const filtered = events.filter(e =>
        !search ||
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        e.slug?.toLowerCase().includes(search.toLowerCase()) ||
        e.plan?.toLowerCase().includes(search.toLowerCase())
    );

    function handleExport() {
        exportToCsv('eventos', filtered.map(e => ({
            nome: e.name,
            slug: e.slug,
            plano: e.plan || '',
            pagamento: e.payment_status || '',
            midias: mediaCount[e.id] ?? 0,
            status: e.is_active ? 'ativo' : 'inativo',
            criado: formatDate(e.created_at),
        })));
    }

    return (
        <div>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E85A70]/20 focus:border-[#E85A70]/50 placeholder:text-gray-400"
                    />
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    title="Exportar CSV"
                >
                    <Download className="w-3.5 h-3.5" />
                    CSV
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Evento</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Plano</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Pagamento</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Mídias</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Criado</th>
                            <th className="px-5 py-2.5 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum evento criado ainda.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 50).map(event => (
                                <tr key={event.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 leading-tight">{event.name}</p>
                                            <a
                                                href={`/e/${event.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-0.5 text-xs text-gray-400 hover:text-[#E85A70] mt-0.5 transition-colors"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                /{event.slug}
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        <PlanBadge plan={event.plan || ''} />
                                    </td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <PaymentStatusBadge status={event.payment_status} />
                                    </td>
                                    <td className="px-5 py-3 hidden lg:table-cell">
                                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                            <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                                            {mediaCount[event.id] ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${
                                            event.is_active
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-gray-50 text-gray-500 border-gray-100'
                                        }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                            {event.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 hidden lg:table-cell">
                                        <span className="text-xs text-gray-400">{formatDate(event.created_at)}</span>
                                    </td>
                                    <td className="px-5 py-3 text-right">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button
                                                onClick={() => onToggleStatus(event.id, event.is_active)}
                                                disabled={actionLoading === event.id}
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors disabled:opacity-40 ${
                                                    event.is_active
                                                        ? 'text-emerald-600 hover:bg-emerald-50'
                                                        : 'text-gray-400 hover:bg-gray-100'
                                                }`}
                                                title={event.is_active ? 'Desativar' : 'Ativar'}
                                            >
                                                {event.is_active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                                            </button>
                                            <button
                                                onClick={() => onEdit(event.id)}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(event.id, event.name)}
                                                disabled={actionLoading === event.id}
                                                className="w-7 h-7 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                                                title="Excluir"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 50 && (
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Mostrando 50 de {filtered.length} eventos
                </div>
            )}
        </div>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    const config: Record<string, { label: string; style: string }> = {
        premium: { label: 'Premium', style: 'bg-amber-50 text-amber-700 border-amber-100' },
        standard: { label: 'Standard', style: 'bg-purple-50 text-purple-700 border-purple-100' },
        basico: { label: 'Básico', style: 'bg-blue-50 text-blue-700 border-blue-100' },
        basic: { label: 'Básico', style: 'bg-blue-50 text-blue-700 border-blue-100' },
    };
    const { label, style } = config[plan] || { label: plan || 'Free', style: 'bg-gray-50 text-gray-500 border-gray-100' };
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style}`}>
            {label}
        </span>
    );
}

function PaymentStatusBadge({ status }: { status?: string }) {
    const config: Record<string, { label: string; style: string }> = {
        paid: { label: 'Pago', style: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
        pending: { label: 'Pendente', style: 'bg-amber-50 text-amber-700 border-amber-100' },
        failed: { label: 'Falhou', style: 'bg-red-50 text-red-700 border-red-100' },
    };
    const { label, style } = config[status || ''] || { label: status || '—', style: 'bg-gray-50 text-gray-500 border-gray-100' };
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style}`}>
            <CreditCard className="w-2.5 h-2.5" />
            {label}
        </span>
    );
}
