import { supabase } from '@/lib/supabase';

// ============================================
// FUNÇÕES DE LAYOUT DE FOTOS E UPLOAD
// Adicionar ao Camera.tsx
// ============================================

/**
 * Cria layout polaroid com 3 fotos e texto personalizado
 * @param photoDataUrls - Array com 3 data URLs das fotos capturadas
 * @param coupleName1 - Primeiro nome (ex: "Ana")
 * @param coupleName2 - Segundo nome (ex: "Carlos")
 * @param eventDate - Data formatada (ex: "15 de junho de 2025")
 * @returns Data URL do layout final
 */
const createPhotoLayout = async (
    photoDataUrls: string[],
    coupleName1: string,
    coupleName2: string,
    eventDate: string
): Promise<string> => {
    return new Promise((resolve, reject) => {
        // Dimensões do canvas final
        const finalWidth = 600;
        const finalHeight = 900;

        // Criar canvas temporário
        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
        }

        // Fundo branco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);

        // Configurações das fotos
        const photoWidth = 520;
        const photoHeight = 180;
        const photoSpacing = 20;
        const startY = 40;
        const startX = (finalWidth - photoWidth) / 2;

        // Carregar as 3 imagens
        const imagePromises = photoDataUrls.map(dataUrl => {
            return new Promise<HTMLImageElement>((resolveImg, rejectImg) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => resolveImg(img);
                img.onerror = () => rejectImg(new Error('Erro ao carregar imagem'));
                img.src = dataUrl;
            });
        });

        Promise.all(imagePromises)
            .then(images => {
                // Desenhar as 3 fotos
                images.forEach((img, index) => {
                    const photoY = startY + (index * (photoHeight + photoSpacing));

                    // Moldura branca ao redor da foto
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(startX - 10, photoY - 10, photoWidth + 20, photoHeight + 20);

                    // Sombra suave
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
                    ctx.shadowBlur = 10;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 4;

                    // Desenhar a foto
                    ctx.drawImage(img, startX, photoY, photoWidth, photoHeight);

                    // Resetar sombra
                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                });

                // Área de texto (rodapé)
                const textAreaStart = startY + (3 * photoHeight) + (2 * photoSpacing) + 40;
                const textAreaHeight = finalHeight - textAreaStart - 20;
                const textCenterY = textAreaStart + (textAreaHeight / 2);

                // Texto dos nomes
                ctx.fillStyle = '#333333';
                ctx.font = 'bold 24px Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${coupleName1} & ${coupleName2}`, finalWidth / 2, textCenterY - 20);

                // Texto da data
                ctx.font = '18px Arial, sans-serif';
                ctx.fillText(eventDate, finalWidth / 2, textCenterY + 15);

                // Coração decorativo
                ctx.font = '28px serif';
                ctx.fillStyle = '#e74c3c';
                ctx.fillText('♥', finalWidth / 2, textCenterY + 50);

                // Converter para data URL
                const finalDataUrl = canvas.toDataURL('image/jpeg', 0.9);
                resolve(finalDataUrl);
            })
            .catch(error => {
                reject(error);
            });
    });
};

/**
 * Faz upload da foto para o Supabase Storage e salva metadata
 * @param dataUrl - Data URL da foto com layout
 * @param eventId - ID do evento
 * @returns Objeto com dados da mídia salva
 */
const uploadPhotoToSupabase = async (
    dataUrl: string,
    eventId: string | undefined
): Promise<{ publicUrl: string; mediaId: string } | null> => {
    try {
        if (!eventId) {
            console.error('Event ID não fornecido');
            return null;
        }

        // Converter data URL para Blob
        const base64Data = dataUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}-${randomStr}.jpg`;
        const filePath = `${eventId}/${fileName}`;

        // Upload para o Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media-bucket')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                cacheControl: '3600'
            });

        if (uploadError) {
            console.error('Erro no upload:', uploadError);
            throw uploadError;
        }

        console.log('Upload bem-sucedido:', uploadData);

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('media-bucket')
            .getPublicUrl(filePath);

        // Salvar metadata na tabela media
        const { data: mediaData, error: dbError } = await supabase
            .from('media')
            .insert([
                {
                    event_id: eventId,
                    file_path: filePath,
                    media_type: 'photo',
                    file_size: blob.size,
                    is_approved: true,
                    moderation_status: 'approved'
                }
            ])
            .select()
            .single();

        if (dbError) {
            console.error('Erro ao salvar no banco:', dbError);
            // Tentar deletar o arquivo do storage se falhar o insert
            await supabase.storage.from('media-bucket').remove([filePath]);
            throw dbError;
        }

        console.log('Mídia salva no banco:', mediaData);

        return {
            publicUrl,
            mediaId: mediaData.id
        };

    } catch (error) {
        console.error('Erro no processo de upload:', error);
        return null;
    }
};

// ============================================
// EXPORTAR FUNÇÕES (se necessário)
// ============================================
export { createPhotoLayout, uploadPhotoToSupabase };
