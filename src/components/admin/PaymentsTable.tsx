import { CreditCard } from 'lucide-react';
import type { PaymentEntry } from '@/types/database';

interface PaymentsTableProps {
    subscriptions: PaymentEntry[];
    formatDate: (dateString: string) => string;
}

export function PaymentsTable({ subscriptions, formatDate }: PaymentsTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                Pagamentos Recentes
                <span className="ml-2 text-sm font-normal text-gray-400">({subscriptions.length})</span>
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gateway</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscriptions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                                    Nenhum pagamento registrado ainda.
                                </td>
                            </tr>
                        ) : (
                            subscriptions.slice(0, 20).map((sub) => (
                                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <PlanBadge plan={sub.plan_type || 'free'} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            R$ {Number(sub.amount || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <StatusBadge status={sub.status} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {sub.payment_gateway || '—'}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {sub.created_at ? formatDate(sub.created_at) : '—'}
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

function StatusBadge({ status }: { status: PaymentEntry['status'] }) {
    const config: Record<string, { label: string; style: string }> = {
        active: { label: 'Ativo', style: 'bg-emerald-100 text-emerald-700' },
        pending: { label: 'Pendente', style: 'bg-amber-100 text-amber-700' },
        canceled: { label: 'Cancelado', style: 'bg-red-100 text-red-700' },
        expired: { label: 'Expirado', style: 'bg-gray-100 text-gray-600' },
    };
    const { label, style } = config[status] || { label: status, style: 'bg-gray-100 text-gray-600' };
    return (
        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${style}`}>
            {label}
        </span>
    );
}
