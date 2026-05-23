import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import type { Profile } from '@/types/database';
import { exportToCsv } from '@/lib/exportCsv';

interface UsersTableProps {
    users: Profile[];
    formatDate: (dateString: string) => string;
    onUserClick: (user: Profile) => void;
}

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600',
    'bg-emerald-100 text-emerald-600', 'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600', 'bg-sky-100 text-sky-600',
    'bg-indigo-100 text-indigo-600',
];

function getAvatarColor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
    if (!name) return '?';
    return name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function UsersTable({ users, formatDate, onUserClick }: UsersTableProps) {
    const [search, setSearch] = useState('');

    const filtered = users.filter(u =>
        !search ||
        u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.plan?.toLowerCase().includes(search.toLowerCase())
    );

    function handleExport() {
        exportToCsv('usuarios', filtered.map(u => ({
            nome: u.full_name || '',
            email: u.email,
            plano: u.plan || 'free',
            role: u.role,
            cadastro: formatDate(u.created_at),
        })));
    }

    return (
        <div>
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="relative max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
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
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Usuário</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Plano</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Role</th>
                            <th className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Cadastro</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-400">
                                    {search ? `Nenhum resultado para "${search}"` : 'Nenhum usuário cadastrado ainda.'}
                                </td>
                            </tr>
                        ) : (
                            filtered.slice(0, 50).map(user => {
                                const avatarColor = getAvatarColor(user.id);
                                return (
                                    <tr
                                        key={user.id}
                                        className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                        onClick={() => onUserClick(user)}
                                        title="Ver detalhes"
                                    >
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
                                                    {getInitials(user.full_name || '')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 group-hover:text-[#E85A70] transition-colors leading-tight">
                                                        {user.full_name || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 md:hidden leading-tight mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3 hidden md:table-cell">
                                            <span className="text-sm text-gray-500">{user.email}</span>
                                        </td>
                                        <td className="px-5 py-3">
                                            <PlanBadge plan={user.plan || ''} />
                                        </td>
                                        <td className="px-5 py-3 hidden sm:table-cell">
                                            <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md ${
                                                user.role === 'admin'
                                                    ? 'bg-[#E85A70]/10 text-[#E85A70]'
                                                    : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 hidden lg:table-cell">
                                            <span className="text-xs text-gray-400">{formatDate(user.created_at)}</span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {filtered.length > 50 && (
                <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400 text-center">
                    Mostrando 50 de {filtered.length} usuários
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
    };
    const { label, style } = config[plan] || { label: plan || 'Free', style: 'bg-gray-50 text-gray-500 border-gray-100' };
    return (
        <span className={`inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-md border ${style}`}>
            {label}
        </span>
    );
}
