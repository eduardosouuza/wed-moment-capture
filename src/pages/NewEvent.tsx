import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvent';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    ArrowLeft,
    Calendar,
    Palette,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ThemeSelector } from '@/components/ThemeSelector';
import type { ThemeColor, PlanType } from '@/types/database';

export default function NewEvent() {
    const { user, profile } = useAuth();
    const { createEvent } = useEvent();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userPlan, setUserPlan] = useState<PlanType>('free');

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [eventType, setEventType] = useState<'wedding' | 'birthday' | 'corporate' | 'party'>('wedding');
    const [eventDate, setEventDate] = useState('');
    const [coupleName1, setCoupleName1] = useState('');
    const [coupleName2, setCoupleName2] = useState('');
    const [themeColor, setThemeColor] = useState<ThemeColor>('purple');
    const [description, setDescription] = useState('');

    useState(() => {
        if (user) {
            import('@/lib/supabase').then(({ supabase }) => {
                supabase.from('profiles').select('plan').eq('id', user.id).single()
                    .then(({ data }: any) => {
                        if (data?.plan) setUserPlan(data.plan as PlanType);
                    });
            });
        }
    });

    const handleNameChange = (value: string) => {
        setName(value);
        const slugValue = value
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setSlug(slugValue);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!user) { setError('Você precisa estar logado'); setLoading(false); return; }
        if (!name.trim()) { setError('Nome do evento é obrigatório'); setLoading(false); return; }
        if (!slug.trim()) { setError('URL do evento é obrigatória'); setLoading(false); return; }

        const actualPlan = userPlan || profile?.plan || 'free';
        const isPaid = actualPlan !== 'free';

        const { error: createError } = await createEvent({
            user_id: user.id,
            name: name.trim(),
            slug: slug.trim(),
            event_type: eventType,
            event_date: eventDate || null,
            description: description.trim() || null,
            couple_name_1: coupleName1.trim() || null,
            couple_name_2: coupleName2.trim() || null,
            theme_color: themeColor,
            is_active: true,
            plan: actualPlan as PlanType,
            payment_status: isPaid ? 'paid' : 'pending',
            is_trial: false,
            trial_expires_at: null,
        });

        if (createError) {
            if (createError.includes('duplicate') || createError.includes('unique')) {
                setError('Esta URL já está em uso. Escolha outra.');
            } else {
                setError(createError);
            }
            setLoading(false);
            return;
        }

        navigate('/dashboard');
    };

    const eventTypes = [
        { value: 'wedding', label: 'Casamento', icon: '💒' },
        { value: 'birthday', label: 'Aniversário', icon: '🎂' },
        { value: 'corporate', label: 'Corporativo', icon: '🏢' },
        { value: 'party', label: 'Festa', icon: '🎉' },
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            {/* Header */}
            <header className="bg-white border-b border-[#ede7e4] sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/dashboard')}
                            className="text-gray-500 hover:text-[#1c1c1e] hover:bg-[#F8F9FA] -ml-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-1.5" />
                            Voltar
                        </Button>
                        <div className="w-px h-5 bg-[#ede7e4]" />
                        <div>
                            <h1 className="font-display text-lg font-extrabold text-[#1c1c1e]">Criar Novo Evento</h1>
                            <p className="text-xs text-gray-400 mt-0.5">Configure em poucos passos</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Informações Básicas */}
                    <div className="bento-card p-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-[#E85A70]" />
                            </div>
                            <div>
                                <h2 className="font-display text-base font-extrabold text-[#1c1c1e]">Informações Básicas</h2>
                                <p className="text-xs text-gray-400">Dados principais do seu evento</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name" className="text-sm font-semibold text-[#1c1c1e]">
                                    Nome do Evento <span className="text-[#E85A70]">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Casamento Maria & João"
                                    value={name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    required
                                    className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="slug" className="text-sm font-semibold text-[#1c1c1e]">
                                    URL do Evento <span className="text-[#E85A70]">*</span>
                                </Label>
                                <div className="mt-1.5 flex rounded-xl shadow-none overflow-hidden border border-[#ede7e4] focus-within:border-[#E85A70] focus-within:ring-2 focus-within:ring-[#E85A70]/20 transition-all">
                                    <span className="inline-flex items-center px-3 bg-[#F8F9FA] border-r border-[#ede7e4] text-gray-400 text-sm font-medium">
                                        /e/
                                    </span>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e) => setSlug(e.target.value)}
                                        placeholder="maria-joao-2025"
                                        required
                                        className="rounded-none border-0 focus-visible:ring-0 bg-white"
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-1.5">
                                    Seus convidados acessarão: <span className="font-medium text-gray-600">{window.location.origin}/e/{slug || 'seu-evento'}</span>
                                </p>
                            </div>

                            <div>
                                <Label className="text-sm font-semibold text-[#1c1c1e]">Tipo de Evento</Label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                    {eventTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            type="button"
                                            onClick={() => setEventType(type.value as any)}
                                            className={`p-4 rounded-2xl border-2 text-center transition-all ${
                                                eventType === type.value
                                                    ? 'border-[#E85A70] bg-[#FDF2F4]'
                                                    : 'border-[#ede7e4] bg-white hover:border-[#E85A70]/40 hover:bg-[#FDF2F4]/50'
                                            }`}
                                        >
                                            <div className="text-2xl mb-1.5">{type.icon}</div>
                                            <div className="text-xs font-bold text-[#1c1c1e]">{type.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="eventDate" className="text-sm font-semibold text-[#1c1c1e]">Data do Evento</Label>
                                <Input
                                    id="eventDate"
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                />
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-sm font-semibold text-[#1c1c1e]">Descrição <span className="text-gray-400 font-normal">(opcional)</span></Label>
                                <Textarea
                                    id="description"
                                    placeholder="Conte um pouco sobre seu evento..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Personalização */}
                    <div className="bento-card p-7">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] border border-[#fbdde2] flex items-center justify-center">
                                <Palette className="w-4 h-4 text-[#E85A70]" />
                            </div>
                            <div>
                                <h2 className="font-display text-base font-extrabold text-[#1c1c1e]">Personalização</h2>
                                <p className="text-xs text-gray-400">Cores e identidade do evento</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {eventType === 'wedding' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="coupleName1" className="text-sm font-semibold text-[#1c1c1e]">Nome 1</Label>
                                        <Input
                                            id="coupleName1"
                                            placeholder="Ex: Maria"
                                            value={coupleName1}
                                            onChange={(e) => setCoupleName1(e.target.value)}
                                            className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="coupleName2" className="text-sm font-semibold text-[#1c1c1e]">Nome 2</Label>
                                        <Input
                                            id="coupleName2"
                                            placeholder="Ex: João"
                                            value={coupleName2}
                                            onChange={(e) => setCoupleName2(e.target.value)}
                                            className="mt-1.5 border-[#ede7e4] focus-visible:ring-[#E85A70]/30 focus-visible:border-[#E85A70]"
                                        />
                                    </div>
                                </div>
                            )}

                            <ThemeSelector selected={themeColor} onChange={setThemeColor} />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="bento-card p-7 bg-[#F8F9FA]">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-lg">📋</span>
                            <h3 className="font-display text-sm font-extrabold text-[#1c1c1e]">Preview do Evento</h3>
                        </div>
                        <div className="bg-white rounded-2xl p-5 border border-[#ede7e4] space-y-2">
                            <p className="font-display font-extrabold text-xl text-[#1c1c1e]">{name || 'Nome do Evento'}</p>
                            {coupleName1 && coupleName2 && (
                                <p className="text-base text-[#E85A70] font-bold">
                                    {coupleName1} & {coupleName2}
                                </p>
                            )}
                            {eventDate && (
                                <p className="text-sm text-gray-500">
                                    📅 {new Date(eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                            )}
                            <p className="text-xs text-[#E85A70] font-semibold">
                                🔗 /e/{slug || 'seu-evento'}
                            </p>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/dashboard')}
                            disabled={loading}
                            className="border-[#ede7e4] text-gray-600 hover:bg-[#F8F9FA] rounded-xl"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="btn-rose px-8 rounded-xl font-bold"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                'Criar Evento'
                            )}
                        </Button>
                    </div>
                </form>
            </main>
        </div>
    );
}
