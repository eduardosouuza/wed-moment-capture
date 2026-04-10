import { Calendar, ExternalLink, Image as ImageIcon, Power, PowerOff, Edit, Trash2, CreditCard } from 'lucide-react';
import type { Event } from '@/types/database';

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
    events,
    mediaCount,
    actionLoading,
    formatDate,
    onToggleStatus,
    onDelete,
    onEdit,
}: EventsTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                Eventos Recentes
                <span className="ml-2 text-sm font-normal text-gray-400">({events.length})</span>
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagamento</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mídias</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400 text-sm">
                                    Nenhum evento criado ainda.
                                </td>
                            </tr>
                        ) : (
                            events.slice(0, 20).map((event) => (
                                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{event.name}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <a
                                            href={`/e/${event.slug}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                                        >
                                            {event.slug}
                                            <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <PlanBadge plan={event.plan || 'free'} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <PaymentStatusBadge status={event.payment_status} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                            <ImageIcon className="w-3.5 h-3.5" />
                                            {mediaCount[event.id] ?? '—'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {event.is_active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(event.created_at)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-1">
                                            <button
                                                onClick={() => onToggleStatus(event.id, event.is_active)}
                                                disabled={actionLoading === event.id}
                                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                                    event.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'
                                                }`}
                                                title={event.is_active ? 'Desativar evento' : 'Ativar evento'}
                                            >
                                                {event.is_active ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => onEdit(event.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Editar evento"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onDelete(event.id, event.name)}
                                                disabled={actionLoading === event.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                title="Excluir evento"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    const styles: Record<string, string> = {
        premium: 'bg-amber-100 text-amber-800',
        standard: 'bg-purple-100 text-purple-800',
        basic: 'bg-blue-100 text-blue-800',
        basico: 'bg-blue-100 text-blue-800',
        free: 'bg-gray-100 text-gray-600',
    };
    return (
        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[plan] || styles.free}`}>
            {plan}
        </span>
    );
}

function PaymentStatusBadge({ status }: { status?: string }) {
    const config: Record<string, { label: string; style: string }> = {
        paid: { label: 'Pago', style: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pendente', style: 'bg-amber-100 text-amber-700' },
        failed: { label: 'Falhou', style: 'bg-red-100 text-red-700' },
    };
    const { label, style } = config[status || ''] || { label: status || '—', style: 'bg-gray-100 text-gray-500' };
    return (
        <span className={`px-2 py-1 inline-flex items-center gap-1 text-xs font-semibold rounded-full ${style}`}>
            <CreditCard className="w-3 h-3" />
            {label}
        </span>
    );
}
