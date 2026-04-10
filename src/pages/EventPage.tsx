import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvent';
import PhotoboothMain from '@/components/PhotoboothMain';
import { Loader2, AlertCircle } from 'lucide-react';
import { applyTheme } from '@/lib/themes';

export default function EventPage() {
    const { slug } = useParams<{ slug: string }>();
    const { event, loading, error } = useEvent(slug);
    const navigate = useNavigate();

    useEffect(() => {
        // Se não houver slug, redirecionar para home
        if (!slug) {
            navigate('/');
        }
    }, [slug, navigate]);

    // Aplicar tema quando o evento carregar
    useEffect(() => {
        if (event?.theme_color) {
            applyTheme(event.theme_color);
        }
    }, [event]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50" style={{ backgroundColor: 'var(--theme-light, #F5F3FF)' }}>
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: 'var(--theme-primary, #8B5CF6)' }} />
                    <p style={{ color: 'var(--theme-primary, #8B5CF6)' }}>Carregando evento...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Evento não encontrado
                    </h2>
                    <p className="text-gray-600 mb-6">
                        O evento que você está procurando não existe ou foi removido.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-white px-6 py-2 rounded-lg font-medium transition-all"
                        style={{ background: 'linear-gradient(to right, var(--theme-primary, #8B5CF6), var(--theme-primary-hover, #7C3AED))' }}
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    // Evento inativo
    if (!event.is_active) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Evento Inativo
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Este evento foi desativado temporariamente.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gradient-to-r from-gray-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                        Voltar ao Início
                    </button>
                </div>
            </div>
        );
    }

    // Success - render event (sem componentes de trial)
    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--theme-light, #F5F3FF)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <PhotoboothMain event={event} />
            </div>
        </div>
    );
}
