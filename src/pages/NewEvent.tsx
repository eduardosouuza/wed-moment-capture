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
    CheckCircle2,
    Layout,
    Sparkles
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IdentityFields, DetailsFields, AppearanceFields } from '@/components/admin/EventFormFields';
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

// Otimização: Preview do Passo 3 isolado
const Step3Preview = () => {
    const values = useWatch<EventFormValues>();
    const { 
        name, 
        slug, 
        event_date, 
        event_type, 
        couple_name_1, 
        couple_name_2,
        birthday_person_name,
        company_name,
        host_name
    } = values as EventFormValues;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Nome do Evento</span>
                    <p className="font-semibold text-[#1c1c1e] dark:text-white text-lg">{name}</p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">URL do Evento</span>
                    <p className="font-semibold text-[#E85A70] break-all">
                        <span className="hidden sm:inline opacity-70">lume.com/e/</span>{slug}
                    </p>
                </div>
                <div className="space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Data do Evento</span>
                    <p className="font-semibold text-[#1c1c1e] dark:text-white">
                        {event_date ? new Date(event_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Não definida'}
                    </p>
                </div>
            </div>
            
            <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#FDF2F4] to-white dark:from-[#E85A70]/10 dark:to-transparent border border-[#E85A70]/20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-xl">
                    <Layout className="w-10 h-10 text-[#E85A70]" />
                </div>
                <div>
                    <h4 className="font-display font-bold text-xl">{name}</h4>
                    {event_type === 'wedding' && couple_name_1 && (
                        <p className="text-[#E85A70] font-medium">{couple_name_1} & {couple_name_2}</p>
                    )}
                    {event_type === 'birthday' && birthday_person_name && (
                        <p className="text-[#E85A70] font-medium">Aniversário de {birthday_person_name}</p>
                    )}
                    {event_type === 'corporate' && company_name && (
                        <p className="text-[#E85A70] font-medium">{company_name}</p>
                    )}
                    {event_type === 'party' && host_name && (
                        <p className="text-[#E85A70] font-medium">Anfitrião: {host_name}</p>
                    )}
                    <Badge variant="secondary" className="mt-4 bg-[#E85A70]/10 text-[#E85A70] border-none">
                        Preview Ativo
                    </Badge>
                </div>
            </div>
        </div>
    );
};

export default function NewEvent() {
    const { user, profile } = useAuth();
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

        // Removido fetch redundante: usando dados do profile que já estão no hook useAuth
        const actualPlan = profile?.plan || 'free';
        const isPaid = actualPlan !== 'free';

        const { error: createError } = await createEvent({
            user_id: user.id,
            name: values.name.trim(),
            slug: values.slug.trim(),
            event_type: values.event_type,
            event_date: values.event_date || null,
            description: values.description?.trim() || null,
            couple_name_1: values.couple_name_1?.trim() || null,
            couple_name_2: values.couple_name_2?.trim() || null,
            birthday_person_name: values.birthday_person_name?.trim() || null,
            birthday_age: values.birthday_age ?? null,
            company_name: values.company_name?.trim() || null,
            department: values.department?.trim() || null,
            host_name: values.host_name?.trim() || null,
            party_reason: values.party_reason?.trim() || null,
            theme_color: values.theme_color,
            is_active: true,
            plan: actualPlan,
            payment_status: isPaid ? 'paid' : 'pending',
            is_trial: false,
            trial_expires_at: null,
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
                                    <AppearanceFields form={form} />
                                </div>
                            )}
                            {step === 3 && (
                                <Card className="border-none shadow-xl shadow-black/5 dark:bg-[#151518]">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="font-display text-xl">Tudo Pronto!</CardTitle>
                                                <CardDescription>Revise as informações antes de finalizar</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <Step3Preview />

                                        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex gap-3">
                                            <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                                            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                                                <strong>Dica:</strong> Após a criação, você poderá personalizar o QR Code, gerenciar a galeria e acompanhar o engajamento através do seu painel.
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
                                        type="button"
                                        onClick={nextStep}
                                        className="btn-rose px-8 rounded-xl font-bold h-12"
                                    >
                                        Continuar <ChevronRight className="w-4 h-4 ml-1.5" />
                                    </Button>
                                ) : (
                                    <Button
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
