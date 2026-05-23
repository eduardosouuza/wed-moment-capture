import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEvent } from '@/hooks/useEvent';
import { useGSAP } from '@/hooks/useGSAP';
import gsap from 'gsap';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, EventFormValues } from '@/lib/validations/event';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    ArrowLeft,
    Loader2,
    AlertCircle,
    ChevronRight,
    ChevronLeft,
    QrCode,
    Sparkles
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IdentityFields, DetailsFields, AppearanceFields } from '@/components/admin/EventFormFields';
import { QRCodeCustomizer } from '@/components/QRCodeCustomizer';
import { EventThemePreview } from '@/components/EventThemePreview';
import { themes } from '@/lib/themes';
import type { ThemeColor } from '@/lib/themes';
import { hashPassword } from '@/lib/crypto';
import type { PlanType } from '@/types/database';

// Otimização: Componente menor para auto-slug para evitar re-render da página toda
const SlugAutoGenerator = () => {
    const { setValue, formState: { dirtyFields } } = useFormContext<EventFormValues>();
    const nameValue = useWatch({ name: 'name' });

    useEffect(() => {
        if (nameValue && !dirtyFields.slug) {
            const slug = nameValue
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setValue('slug', slug, { shouldValidate: true });
        }
    }, [nameValue, setValue, dirtyFields.slug]);

    return null;
};

// Otimização: Título do Header que reage ao nome sem re-renderizar o NewEvent
const HeaderTitle = () => {
    const name = useWatch({ name: 'name' });
    return (
        <h1 className="font-display text-lg font-extrabold text-[#1c1c1e] dark:text-white line-clamp-1">
            {name || 'Novo Evento'}
        </h1>
    );
};

// Passo 3: Personalização do QR Code
const Step3QR = () => {
    const form = useFormContext<EventFormValues>();
    const values = useWatch<EventFormValues>();
    const { qr_code_fg_color, qr_code_bg_color, qr_code_margin, qr_code_level, qr_code_logo_url, qr_code_logo_size, slug, theme_color } = values as EventFormValues;

    const previewUrl = `https://lume.com/e/${slug || 'seu-evento'}`;

    return (
        <QRCodeCustomizer
            fgColor={qr_code_fg_color || '#000000'}
            bgColor={qr_code_bg_color || '#FFFFFF'}
            includeMargin={qr_code_margin || false}
            level={qr_code_level || 'H'}
            logoUrl={qr_code_logo_url || null}
            logoSize={qr_code_logo_size || 24}
            onChange={(field, value) => form.setValue(field as keyof EventFormValues, value)}
            previewUrl={previewUrl}
            themeColor={theme_color}
        />
    );
};

export default function NewEvent() {
    const { user } = useAuth();
    const { createEvent } = useEvent();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState(1);

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
            custom_message: '',
            requires_password: false,
            event_password: '',
            moderation_enabled: false,
            qr_code_fg_color: '#000000',
            qr_code_bg_color: '#FFFFFF',
            qr_code_margin: false,
            qr_code_level: 'H',
            qr_code_logo_url: null,
            qr_code_logo_size: 24,
        }
    });

    // Animations
    useGSAP(() => {
        gsap.from('.header-animate', {
            opacity: 0,
            y: -20,
            duration: 0.6,
            ease: 'power2.out'
        });
        
        gsap.from('.step-card-animate', {
            opacity: 0,
            x: 20,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1
        });
    }, { dependencies: [step] });

    const nextStep = async () => {
        let fieldsToValidate: (keyof EventFormValues)[] = [];
        if (step === 1) fieldsToValidate = ['name', 'slug', 'event_type'];
        if (step === 2) fieldsToValidate = ['event_date', 'theme_color'];

        const isValid = await form.trigger(fieldsToValidate);

        if (isValid) {
            setError('');
            // Auto-sync QR color from theme when entering step 3 (if not manually changed)
            if (step === 2 && !form.formState.dirtyFields.qr_code_fg_color) {
                const tc = form.getValues('theme_color') as ThemeColor;
                const theme = themes[tc] || themes.rose;
                form.setValue('qr_code_fg_color', theme.primary);
            }
            setStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setError('');
        setStep(prev => Math.max(prev - 1, 1));
    };

    const onSubmit = async (values: EventFormValues) => {
        setError('');
        setLoading(true);

        if (!user) { 
            setError('Você precisa estar logado'); 
            setLoading(false); 
            return; 
        }

        const passwordHash = values.requires_password && values.event_password?.trim()
            ? await hashPassword(values.event_password.trim())
            : null;

        const { error: createError } = await createEvent({
            user_id: user.id,
            name: values.name.trim(),
            slug: values.slug.trim(),
            event_type: values.event_type,
            event_date: values.event_date || null,
            description: values.description?.trim() || null,
            custom_message: values.custom_message?.trim() || null,
            requires_password: values.requires_password || false,
            password_hash: passwordHash,
            moderation_enabled: values.moderation_enabled || false,
            couple_name_1: values.couple_name_1?.trim() || null,
            couple_name_2: values.couple_name_2?.trim() || null,
            birthday_person_name: values.birthday_person_name?.trim() || null,
            birthday_age: values.birthday_age ?? null,
            company_name: values.company_name?.trim() || null,
            department: values.department?.trim() || null,
            host_name: values.host_name?.trim() || null,
            party_reason: values.party_reason?.trim() || null,
            theme_color: values.theme_color,
            qr_code_fg_color: values.qr_code_fg_color || '#000000',
            qr_code_bg_color: values.qr_code_bg_color || '#FFFFFF',
            qr_code_margin: values.qr_code_margin || false,
            qr_code_level: values.qr_code_level || 'H',
            qr_code_logo_url: values.qr_code_logo_url || null,
            qr_code_logo_size: values.qr_code_logo_size || 24,
            is_active: true,
            payment_status: 'pending',
        });

        if (createError) {
            if (createError.includes('duplicate') || createError.includes('unique')) {
                setError('Esta URL já está em uso. Escolha outra.');
                setStep(1);
            } else {
                setError(createError);
            }
            setLoading(false);
            return;
        }

        navigate('/dashboard');
    };

    const progressValue = (step / 3) * 100;

    return (
        <Form {...form}>
            <div ref={containerRef} className="min-h-screen bg-[#F8F9FA] dark:bg-[#0a0a0b] transition-colors duration-300 pb-20">
                {/* Header */}
                <header className="bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-[#ede7e4] dark:border-white/10 sticky top-0 z-20 header-animate">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => navigate('/dashboard')}
                                    className="text-gray-500 hover:text-[#1c1c1e] dark:hover:text-white dark:hover:bg-white/5 -ml-2"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                                    Voltar
                                </Button>
                                <div className="w-px h-5 bg-[#ede7e4] dark:bg-white/10" />
                                <div>
                                    <HeaderTitle />
                                </div>
                            </div>
                            <Badge variant="outline" className="font-bold border-[#E85A70]/20 text-[#E85A70] rounded-full px-4">
                                Passo {step} de 3
                            </Badge>
                        </div>
                        <Progress value={progressValue} className="h-1 mt-4 bg-[#FDF2F4] dark:bg-white/5" />
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <SlugAutoGenerator />
                        {error && (
                            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="step-card-animate">
                            {step === 1 && <IdentityFields form={form} />}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <DetailsFields form={form} />
                                    <div className="flex flex-col lg:flex-row gap-6 items-start">
                                        <div className="flex-1 min-w-0">
                                            <AppearanceFields form={form} />
                                        </div>
                                        <div className="w-full lg:w-auto lg:flex-shrink-0">
                                            <EventThemePreview />
                                        </div>
                                    </div>
                                </div>
                            )}
                            {step === 3 && (
                                <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518]">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-[#FDF2F4] dark:bg-[#E85A70]/10 flex items-center justify-center">
                                                <QrCode className="w-5 h-5 text-[#E85A70]" />
                                            </div>
                                            <div>
                                                <CardTitle className="font-display text-xl">Personalizar QR Code</CardTitle>
                                                <CardDescription>Customize o QR Code que seus convidados vão escanear</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <Step3QR />

                                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex gap-3">
                                            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                                                <strong>Dica:</strong> Você pode alterar o QR Code a qualquer momento após a criação do evento.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={step === 1 ? () => navigate('/dashboard') : prevStep}
                                disabled={loading}
                                className="text-gray-500 rounded-xl px-6"
                            >
                                {step === 1 ? 'Cancelar' : <><ChevronLeft className="w-4 h-4 mr-1.5" /> Voltar</>}
                            </Button>
                            
                            <div className="flex gap-3">
                                {step < 3 ? (
                                    <Button
                                        key="continuar"
                                        type="button"
                                        onClick={nextStep}
                                        className="btn-rose px-8 rounded-xl font-bold h-12"
                                    >
                                        Continuar <ChevronRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        key="lancar"
                                        type="submit"
                                        disabled={loading}
                                        className="btn-rose px-10 rounded-xl font-bold h-12 shadow-lg shadow-[#E85A70]/20"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Criando...
                                            </>
                                        ) : (
                                            'Lançar Evento'
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </Form>
    );
}
