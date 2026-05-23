import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
    Copy,
    Check,
    Download,
    Edit,
    ExternalLink,
    CreditCard,
    Image,
    Frame,
    BarChart2,
    PackageOpen,
    ChevronDown,
    ChevronUp,
    Loader2,
    ShieldCheck,
} from 'lucide-react';
import type { Event } from '@/types/database';
import { QRCodeFrameModal } from './QRCodeFrameModal';
import { EventAnalyticsChart } from './EventAnalyticsChart';
import { ModerationPanel } from './ModerationPanel';
import { supabase } from '@/lib/supabase';
import { bulkDownloadEvent } from '@/lib/bulkDownload';

interface EventCardProps {
    event: Event;
    mediaCount: number;
    copiedId: string | null;
    onCopyLink: (slug: string, id: string) => void;
    onDownloadQR: (slug: string) => void;
    formatDate: (dateString: string) => string;
    isFirst?: boolean;
}

export function EventCard({ event, mediaCount, copiedId, onCopyLink, onDownloadQR, formatDate, isFirst = false }: EventCardProps) {
    const navigate = useNavigate();
    const [showFrame, setShowFrame] = useState(false);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showModeration, setShowModeration] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

    // Busca contagem de mídias pendentes (só quando moderação está ativa)
    useEffect(() => {
        if (!event.moderation_enabled) return;
        supabase
            .from('media')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('moderation_status', 'pending')
            .then(({ count }) => setPendingCount(count || 0));
    }, [event.id, event.moderation_enabled]);

    const eventUrl = `${window.location.origin}/e/${event.slug}`;
    const photoPercent = event.max_photos > 0
        ? Math.min((mediaCount / event.max_photos) * 100, 100)
        : 0;

    const handleBulkDownload = async () => {
        if (downloading || mediaCount === 0) return;
        setDownloading(true);
        try {
            const { data } = await supabase
                .from('media')
                .select('id, file_path, media_type')
                .eq('event_id', event.id);

            if (!data || data.length === 0) return;

            const items = data.map(m => ({
                id: m.id,
                url: supabase.storage.from('media-bucket').getPublicUrl(m.file_path).data.publicUrl,
                type: m.media_type as 'photo' | 'video',
            }));

            await bulkDownloadEvent(items, event.name, (current, total) => {
                setDownloadProgress({ current, total });
            });
        } catch (err) {
            console.error('Erro no download em lote:', err);
        } finally {
            setDownloading(false);
            setDownloadProgress(null);
        }
    };

    return (
        <>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all duration-300">
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
                <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg truncate">{event.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-sm text-gray-400">
                            {event.event_date ? formatDate(event.event_date) : 'Sem data'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                            event.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${event.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            {event.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                        {event.moderation_enabled && pendingCount > 0 && (
                            <button
                                onClick={() => setShowModeration(true)}
                                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-[#FDF2F4] text-[#E85A70] border border-[#fbdde2] hover:bg-[#fbdde2] transition-colors"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-[#E85A70] animate-pulse" />
                                {pendingCount} pendente{pendingCount !== 1 ? 's' : ''}
                            </button>
                        )}
                        {event.payment_status === 'paid' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                                <CreditCard className="w-3 h-3" />
                                Pago
                            </span>
                        ) : event.payment_status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                                <CreditCard className="w-3 h-3" />
                                Pendente
                            </span>
                        ) : null}
                    </div>
                </div>
            </div>

            <div className="flex gap-5 mb-5">
                {/* QR Code */}
                <div id={isFirst ? 'tour-qr' : undefined} className="flex flex-col items-center">
                    <div className="bg-gray-50 rounded-xl p-3">
                        <QRCodeSVG
                            id={`qr-${event.slug}`}
                            value={eventUrl}
                            size={88}
                            fgColor={event.qr_code_fg_color || '#000000'}
                            bgColor={event.qr_code_bg_color || '#FFFFFF'}
                            includeMargin={event.qr_code_margin || false}
                            level={(event.qr_code_level as 'L' | 'M' | 'Q' | 'H') || 'H'}
                            imageSettings={event.qr_code_logo_url ? {
                                src: event.qr_code_logo_url,
                                height: event.qr_code_logo_size || 24,
                                width: event.qr_code_logo_size || 24,
                                excavate: true,
                            } : undefined}
                        />
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <button
                            onClick={() => onDownloadQR(event.slug)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
                        >
                            <Download className="w-3 h-3 mr-1" />
                            Baixar
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                            onClick={() => setShowFrame(true)}
                            className="text-xs text-gray-400 hover:text-gray-600 font-medium inline-flex items-center transition-colors"
                        >
                            <Frame className="w-3 h-3 mr-1" />
                            Moldura
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm text-gray-500 flex items-center gap-1.5">
                                <Image className="w-3.5 h-3.5" />
                                Mídias
                            </span>
                            <span className="text-sm font-medium text-gray-700">
                                {mediaCount} <span className="text-gray-400 font-normal">/ {event.max_photos}</span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    photoPercent > 90 ? 'bg-red-400' : photoPercent > 60 ? 'bg-amber-400' : 'bg-purple-500'
                                }`}
                                style={{ width: `${photoPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg">
                            {event.event_type === 'wedding' ? '💒 Casamento' :
                                event.event_type === 'birthday' ? '🎂 Aniversário' :
                                    event.event_type === 'corporate' ? '🏢 Corporativo' :
                                        event.event_type === 'party' ? '🎉 Festa' : '📸 Evento'}
                        </span>
                        {event.couple_name_1 && event.couple_name_2 && (
                            <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-lg">
                                💕 {event.couple_name_1} & {event.couple_name_2}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Analytics expandable section */}
            {showAnalytics && (
                <EventAnalyticsChart eventId={event.id} />
            )}

            {/* Secondary actions row */}
            <div className="flex gap-2 mb-2">
                {event.moderation_enabled && (
                    <button
                        onClick={() => setShowModeration(true)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
                            pendingCount > 0
                                ? 'bg-[#FDF2F4] text-[#E85A70] border border-[#fbdde2]'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Moderar
                    </button>
                )}
                <button
                    onClick={() => setShowAnalytics(v => !v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                        showAnalytics
                            ? 'bg-[#FDF2F4] text-[#E85A70] border border-[#fbdde2]'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                >
                    <BarChart2 className="w-3.5 h-3.5" />
                    Analytics
                    {showAnalytics ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                <button
                    onClick={handleBulkDownload}
                    disabled={downloading || mediaCount === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {downloadProgress
                                ? `${downloadProgress.current}/${downloadProgress.total}`
                                : 'Preparando...'}
                        </>
                    ) : (
                        <>
                            <PackageOpen className="w-3.5 h-3.5" />
                            Baixar tudo
                            {mediaCount > 0 && (
                                <span className="text-[10px] text-gray-400">({mediaCount})</span>
                            )}
                        </>
                    )}
                </button>
            </div>

            {/* Main actions row */}
            <div className="flex gap-2 pt-2 border-t border-gray-50">
                <button
                    id={isFirst ? 'tour-copy' : undefined}
                    onClick={() => onCopyLink(event.slug, event.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        copiedId === event.id
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {copiedId === event.id ? (
                        <><Check className="w-4 h-4" /> Copiado</>
                    ) : (
                        <><Copy className="w-4 h-4" /> Copiar Link</>
                    )}
                </button>
                <button
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all text-sm font-medium"
                >
                    <Edit className="w-4 h-4" />
                    Editar
                </button>
                <a
                    id={isFirst ? 'tour-open' : undefined}
                    href={`/e/${event.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all text-sm font-medium"
                >
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                </a>
            </div>
        </div>

        {showFrame && (
            <QRCodeFrameModal event={event} onClose={() => setShowFrame(false)} />
        )}

        {showModeration && (
            <ModerationPanel
                event={event}
                onClose={() => setShowModeration(false)}
                onCountChange={setPendingCount}
            />
        )}
        </>
    );
}
