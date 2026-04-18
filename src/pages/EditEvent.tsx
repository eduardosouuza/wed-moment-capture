import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvent';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, EventFormValues } from '@/lib/validations/event';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    Save,
    Eye,
    Settings,
    QrCode,
    Palette
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IdentityFields, DetailsFields, AppearanceFields } from '@/components/admin/EventFormFields';
import { QRCodeCustomizer } from '@/components/QRCodeCustomizer';
import { supabase } from '@/lib/supabase';

// Otimização: Componente de título que reage ao nome sem re-renderizar a página toda
const EditHeaderTitle = () => {
    const name = useWatch({ name: 'name' });
    return (
        <h1 className="font-display text-lg font-extrabold text-[#1c1c1e] dark:text-white line-clamp-1">
            Editar: {name || 'Evento'}
        </h1>
    );
};

// Otimização: Seção de QR Code isolada para evitar re-renders na aba de customização
const QRPreviewSection = () => {
    const { setValue } = useFormContext<EventFormValues>();
    const values = useWatch<EventFormValues>();
    const { 
        slug, 
        qr_code_fg_color, 
        qr_code_bg_color, 
        qr_code_margin, 
        qr_code_level, 
        qr_code_logo_url, 
        qr_code_logo_size 
    } = values as EventFormValues;

    const previewUrl = `${window.location.origin}/e/${slug}`;

    return (
        <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518]">
            <CardHeader>
                <CardTitle className="text-xl font-display">Customização de QR Code</CardTitle>
                <CardDescription>Personalize o código que seus convidados irão escanear</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="p-4 sm:p-8 rounded-[32px] bg-[#F8F9FA] dark:bg-white/5 border border-[#ede7e4] dark:border-white/10">
                    <QRCodeCustomizer
                        fgColor={qr_code_fg_color}
                        bgColor={qr_code_bg_color}
                        includeMargin={qr_code_margin}
                        level={qr_code_level}
                        logoUrl={qr_code_logo_url}
                        logoSize={qr_code_logo_size}
                        onChange={(field, value) => setValue(field as keyof EventFormValues, value)}
                        previewUrl={previewUrl}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default function EditEvent() {
    const { id } = useParams<{ id: string }>();
    const { user } = useAuth();
    const { updateEvent } = useEvent();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [loadingEvent, setLoadingEvent] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('general');

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            name: '',
            slug: '',
            event_type: 'wedding',
            theme_color: 'rose',
            event_date: '',
            couple_name_1: '',
            couple_name_2: '',
            birthday_person_name: '',
            birthday_age: null,
            company_name: '',
            department: '',
            host_name: '',
            party_reason: '',
            description: '',
            qr_code_fg_color: '#000000',
            qr_code_bg_color: '#FFFFFF',
            qr_code_margin: false,
            qr_code_level: 'H',
            qr_code_logo_url: null,
            qr_code_logo_size: 24,
        } as EventFormValues
    });

    useEffect(() => {
        const fetchEventData = async () => {
            if (!id || !user) { navigate('/admin'); return; }

            try {
                // Segurança reforçada: garantindo que o evento pertence ao usuário (equ 'user_id')
                const { data, error } = await supabase
                    .from('events')
                    .select('*')
                    .eq('id', id)
                    .eq('user_id', user.id)
                    .single();

                if (error) throw error;
                if (!data) throw new Error('Evento não encontrado');

                const evt = data as Record<string, any>;

                form.reset({
                    name: evt.name,
                    slug: evt.slug,
                    event_type: evt.event_type,
                    event_date: evt.event_date || '',
                    couple_name_1: evt.couple_name_1 || '',
                    couple_name_2: evt.couple_name_2 || '',
                    birthday_person_name: evt.birthday_person_name || '',
                    birthday_age: evt.birthday_age ?? null,
                    company_name: evt.company_name || '',
                    department: evt.department || '',
                    host_name: evt.host_name || '',
                    party_reason: evt.party_reason || '',
                    theme_color: evt.theme_color,
                    description: evt.description || '',
                    qr_code_fg_color: evt.qr_code_fg_color || '#000000',
                    qr_code_bg_color: evt.qr_code_bg_color || '#FFFFFF',
                    qr_code_margin: evt.qr_code_margin || false,
                    qr_code_level: evt.qr_code_level || 'H',
                    qr_code_logo_url: evt.qr_code_logo_url || null,
                    qr_code_logo_size: evt.qr_code_logo_size || 24,
                } as EventFormValues);
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Falha ao carregar evento ou permissão negada');
            } finally {
                setLoadingEvent(false);
            }
        };

        fetchEventData();
    }, [id, navigate, form, user]);

    // Animations — aguarda o DOM da aba montar antes de animar
    useGSAP(() => {
        requestAnimationFrame(() => {
            const targets = gsap.utils.toArray('.edit-animate');
            if (targets.length === 0) return;
            gsap.from(targets, {
                opacity: 0,
                y: 20,
                duration: 0.5,
                ease: 'power2.out',
                stagger: 0.1
            });
        });
    }, { dependencies: [activeTab, loadingEvent] });

    const onSubmit = async (values: EventFormValues) => {
        setError('');
        setLoading(true);

        if (!user || !id) { 
            setError('Você precisa estar logado'); 
            setLoading(false); 
            return; 
        }

        const v = values as any;
        const payload = {
            ...values,
            name: values.name.trim(),
            slug: values.slug.trim(),
            event_date: values.event_date || null,
            description: values.description?.trim() || null,
            couple_name_1: values.couple_name_1?.trim() || null,
            couple_name_2: values.couple_name_2?.trim() || null,
            birthday_person_name: v.birthday_person_name?.trim() || null,
            birthday_age: v.birthday_age ?? null,
            company_name: v.company_name?.trim() || null,
            department: v.department?.trim() || null,
            host_name: v.host_name?.trim() || null,
            party_reason: v.party_reason?.trim() || null,
        };

        const { error: updateError } = await updateEvent(id, payload as any);

        if (updateError) { 
            setError(updateError); 
            setLoading(false); 
            return; 
        }

        navigate('/admin');
    };

    if (loadingEvent) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0b] p-8">
                <div className="max-w-5xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-40 rounded-xl" />
                    </div>
                    <Skeleton className="h-[200px] w-full rounded-[32px]" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Skeleton className="h-64 rounded-[32px]" />
                        <Skeleton className="h-64 col-span-2 rounded-[32px]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Form {...form}>
        <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0b] transition-colors duration-300 pb-20">
            {/* Header */}
            <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-[#ede7e4] dark:border-white/10 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('/admin')}
                                className="text-gray-500 hover:text-[#1c1c1e] dark:hover:text-white dark:hover:bg-white/5 -ml-2"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1.5" />
                                Voltar
                            </Button>
                            <div className="w-px h-5 bg-[#ede7e4] dark:bg-white/10" />
                            <div>
                                <EditHeaderTitle />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    const slug = form.getValues('slug');
                                    window.open(`${window.location.origin}/e/${slug}`, '_blank');
                                }}
                                className="hidden sm:flex rounded-xl border-[#ede7e4] dark:border-white/10 h-10 px-4"
                            >
                                <Eye className="w-4 h-4 mr-1.5" /> Ver Evento
                            </Button>
                            <Button
                                onClick={form.handleSubmit(onSubmit)}
                                disabled={loading}
                                size="sm"
                                className="btn-rose rounded-xl font-bold shadow-lg shadow-[#E85A70]/20 px-6 h-10"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1.5" /> Salvar</>}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <Alert variant="destructive" className="mb-6 bg-destructive/10 border-destructive/20 text-destructive rounded-2xl">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <div className="flex overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                            <TabsList className="bg-white dark:bg-white/5 p-1 rounded-2xl border border-[#ede7e4] dark:border-white/10 h-auto">
                                <TabsTrigger value="general" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#FDF2F4] dark:data-[state=active]:bg-[#E85A70]/10 data-[state=active]:text-[#E85A70] font-bold">
                                    <Settings className="w-4 h-4 mr-2" /> Geral
                                </TabsTrigger>
                                <TabsTrigger value="appearance" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#FDF2F4] dark:data-[state=active]:bg-[#E85A70]/10 data-[state=active]:text-[#E85A70] font-bold">
                                    <Palette className="w-4 h-4 mr-2" /> Aparência
                                </TabsTrigger>
                                <TabsTrigger value="qrcode" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-[#FDF2F4] dark:data-[state=active]:bg-[#E85A70]/10 data-[state=active]:text-[#E85A70] font-bold">
                                    <QrCode className="w-4 h-4 mr-2" /> QR Code
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB: GERAL */}
                        <TabsContent value="general" className="edit-animate space-y-6 outline-none">
                            <IdentityFields form={form} />
                            <DetailsFields form={form} />
                        </TabsContent>

                        {/* TAB: APARÊNCIA */}
                        <TabsContent value="appearance" className="edit-animate outline-none">
                            <AppearanceFields form={form} />
                        </TabsContent>

                        {/* TAB: QR CODE */}
                        <TabsContent value="qrcode" className="edit-animate outline-none">
                            <QRPreviewSection />
                        </TabsContent>
                    </Tabs>

                {/* Bottom Actions Mobile */}
                <div className="sm:hidden fixed bottom-6 right-6 left-6 z-30">
                    <Button
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={loading}
                        className="w-full btn-rose h-14 rounded-2xl font-bold shadow-2xl shadow-[#E85A70]/40 text-lg"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Salvar Alterações'}
                    </Button>
                </div>
            </main>
        </div>
        </Form>
    );
}
