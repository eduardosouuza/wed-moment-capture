import { Users } from 'lucide-react';
import type { Profile } from '@/types/database';

interface UsersTableProps {
    users: Profile[];
    formatDate: (dateString: string) => string;
}

export function UsersTable({ users, formatDate }: UsersTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-purple-600" />
                Usuários Recentes
                <span className="ml-2 text-sm font-normal text-gray-400">({users.length})</span>
            </h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cadastro</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                                    Nenhum usuário cadastrado ainda.
                                </td>
                            </tr>
                        ) : (
                            users.slice(0, 15).map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{user.full_name || '—'}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <PlanBadge plan={user.plan || 'free'} />
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(user.created_at)}
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
