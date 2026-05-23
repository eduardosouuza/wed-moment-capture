import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import type { PaymentEntry } from '@/types/database';
import { exportToCsv } from '@/lib/exportCsv';

interface PaymentsTableProps {
    subscriptions: PaymentEntry[];
    formatDate: (dateString: string) => string;
}

export function PaymentsTable({ subscriptions, formatDate }: PaymentsTableProps) {
    const [search, setSearch] = useState('');

    const filtered = subscriptions.filter(s =>
        !search ||
        s.plan_type?.toLowerCase().includes(search.toLowerCase()) ||
        s.payment_gateway?.toLowerCase().includes(search.toLowerCase()) ||
        s.status?.toLowerCase().includes(search.toLowerCase())
    );

    const totalActive = subscriptions.filter(s => s.status === 'active').length;
    const totalRevenue = subscriptions
        .filter(s => s.status === 'active')
        .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);

    function handleExport() {
        exportToCsv('pagamentos', filtered.map(s => ({
            plano: s.plan_type || '',
            valor: Number(s.amount || 0).toFixed(2),
            status: s.status,
            gateway: s.payment_gateway || '',
            data: s.created_at ? formatDate(s.created_at) : '',
        })));
    }

    return (
        <div>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar pagamentos..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E85A70]/20 focus:border-[#E85A70]/50 placeholder:text-gray-400 w-48"
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
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                        <span className="font-semibold text-emerald-600">{totalActive}</span> ativos
                    </span>
                    <span className="text-gray-200">|</span>
                    <span>
                        Total ativo:{' '}
                        <span className="font-semibold text-gray-700">
                            R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plano</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Valor</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Gateway</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Data</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum pagamento registrado ainda.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 50).map(sub => (
                                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3">
                                        <PlanBadge plan={sub.plan_type || 'free'} />
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className="text-sm font-semibold text-gray-900">
                                            R$ {Number(sub.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <StatusBadge status={sub.status} />
                                    </td>
                                    <td className="px-5 py-3 hidden sm:table-cell">
                                        <span className="text-xs text-gray-500 capitalize">{sub.payment_gateway || '—'}</span>
                                    </td>
                                    <td className="px-5 py-3 hidden md:table-cell">
                                        <span className="text-xs text-gray-400">{sub.created_at ? formatDate(sub.created_at) : '—'}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 50 && (
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Mostrando 50 de {filtered.length} pagamentos
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

function StatusBadge({ status }: { status: PaymentEntry['status'] }) {
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
