import React, { useState, useEffect } from 'react';
import Camera from './Camera';
import { createPhotoLayout, uploadPhotoToSupabase } from './PhotoLayoutUtils';

interface CameraWithLayoutProps {
    onCapture: (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => void;
    onClose: () => void;
    eventId?: string;
    coupleName1?: string;
    coupleName2?: string;
    eventDate?: string;
    // Trial props
    isTrial?: boolean;
    photoLimit?: number;
    photoCount?: number;
}

/**
 * Wrapper do Camera que adiciona processamento de layout e upload automático
 */
const CameraWithLayout: React.FC<CameraWithLayoutProps> = ({
    onCapture,
    onClose,
    eventId,
    coupleName1 = 'Vitoria',
    coupleName2 = 'Eduardo',
    eventDate = '20 de Setembro, 2025',
    // Trial props
    isTrial = false,
    photoLimit = 0,
    photoCount = 0,
}) => {
    const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    // Quando tiver 3 fotos, processar automaticamente
    useEffect(() => {
        if (capturedPhotos.length === 3 && !isProcessing && eventId) {
            processAndUploadPhotos();
        }
    }, [capturedPhotos, isProcessing, eventId]);

    const processAndUploadPhotos = async () => {
        setIsProcessing(true);
        console.log('🎨 Processando layout com 3 fotos...');

        try {
            // 1. Criar layout polaroid
            console.log('📸 Criando layout polaroid...');
            console.log('📝 Usando nomes:', coupleName1, '&', coupleName2);
            console.log('📅 Usando data:', eventDate);
            const layoutDataUrl = await createPhotoLayout(
                capturedPhotos,
                coupleName1,
                coupleName2,
                eventDate
            );

            console.log('✅ Layout criado com sucesso!');

            // 2. Upload para Supabase
            console.log('☁️ Fazendo upload para Supabase...');
            const result = await uploadPhotoToSupabase(layoutDataUrl, eventId);

            if (result) {
                console.log('✅ Foto salva com sucesso!', result);

                // 3. Notificar componente pai com a URL pública
                onCapture({
                    type: 'photo',
                    data: result.publicUrl,
                    timestamp: Date.now()
                });

                // 4. Fechar câmera
                setTimeout(() => {
                    onClose();
                }, 500);
            } else {
                console.error('❌ Erro ao fazer upload');
                alert('Erro ao salvar foto. Tente novamente.');
            }
        } catch (error) {
            console.error('❌ Erro ao processar fotos:', error);
            alert('Erro ao processar fotos. Verifique sua conexão.');
        } finally {
            setIsProcessing(false);
            setCapturedPhotos([]);
        }
    };

    const handleCameraCapture = (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => {
        if (mediaData.type === 'photo') {
            // Adicionar foto ao array
            console.log(`📷 Foto ${capturedPhotos.length + 1}/3 capturada`);
            setCapturedPhotos(prev => [...prev, mediaData.data]);

            // NÃO passar para o pai ainda - só depois do processamento
        } else {
            // Vídeos passam direto
            onCapture(mediaData);
        }
    };

    return (
        <div>
            {isProcessing && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 text-center max-w-md">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Processando suas fotos...
                        </h3>
                        <p className="text-gray-600">
                            Criando layout e salvando na nuvem ☁️
                        </p>
                    </div>
                </div>
            )}

            <Camera
                onCapture={handleCameraCapture}
                onClose={onClose}
                eventId={eventId}
                coupleName1={coupleName1}
                coupleName2={coupleName2}
                eventDate={eventDate}
                isTrial={isTrial}
                photoLimit={photoLimit}
                photoCount={photoCount}
            />
        </div>
    );
};

export default CameraWithLayout;
