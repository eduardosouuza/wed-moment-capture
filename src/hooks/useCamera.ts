import { useRef, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseCameraProps {
    eventId?: string;
    coupleName1: string;
    coupleName2: string;
    eventDate: string;
    eventName?: string;
    isTrial: boolean;
    photoLimit: number;
    photoCount: number;
    onCapture: (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => void;
    onClose: () => void;
}

export function useCamera({
    eventId,
    coupleName1,
    coupleName2,
    eventDate,
    eventName,
    isTrial,
    photoLimit,
    photoCount,
    onCapture,
    onClose,
}: UseCameraProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [error, setError] = useState('');
    const [status, setStatus] = useState('Iniciando...');
    const [mode, setMode] = useState<'photo' | 'video'>('photo');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
    const [isCapturing, setIsCapturing] = useState(false);
    const [captureCount, setCaptureCount] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [finalImageData, setFinalImageData] = useState('');

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const compressImage = useCallback(async (dataUrl: string, quality: number = 0.8): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context unavailable'));
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Compression failed')),
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = reject;
            img.src = dataUrl;
        });
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= 15) {
                        stopRecording();
                        return 15;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            setRecordingTime(0);
        }
        return () => clearInterval(interval);
    }, [isRecording, stopRecording]);

    const startCamera = useCallback(async () => {
        try {
            setStatus('Verificando se a câmera está disponível...');

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }

            if (!navigator.mediaDevices) {
                throw new Error('navigator.mediaDevices não disponível');
            }

            setStatus('Solicitando permissão da câmera...');

            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode },
                    audio: mode === 'video',
                });
            } catch (err: unknown) {
                if (err instanceof Error && err.name === 'NotReadableError') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    stream = await navigator.mediaDevices.getUserMedia({
                        video: { facingMode },
                        audio: mode === 'video',
                    });
                } else {
                    throw err;
                }
            }

            streamRef.current = stream;
            setStatus('Câmera obtida, inicializando vídeo...');

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setStatus('Câmera pronta!');
                    videoRef.current?.play().catch(err => {
                        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
                        setError('Erro ao reproduzir vídeo: ' + msg);
                    });
                };
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            setError(`Erro: ${msg}`);
            setStatus('Erro ao acessar câmera');
        }
    }, [facingMode, mode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    const takePhoto = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        setIsCapturing(true);

        for (let i = 5; i > 0; i--) {
            setCountdown(i);
            setStatus(`Prepare-se... ${i}`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setCountdown(0);
        setStatus('Capturando 3 fotos...');

        const photos: string[] = [];

        for (let i = 0; i < 3; i++) {
            setCaptureCount(i + 1);
            setStatus(`Foto ${i + 1}/3...`);

            if (videoRef.current) {
                videoRef.current.style.filter = 'brightness(1.5)';
                setTimeout(() => {
                    if (videoRef.current) videoRef.current.style.filter = 'brightness(1)';
                }, 100);
            }

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) continue;

            const photoSize = 300;
            tempCanvas.width = photoSize;
            tempCanvas.height = photoSize;

            const videoAspect = video.videoWidth / video.videoHeight;
            let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;

            if (videoAspect > 1) {
                sourceWidth = video.videoHeight;
                sourceX = (video.videoWidth - sourceWidth) / 2;
            } else {
                sourceHeight = video.videoWidth;
                sourceY = (video.videoHeight - sourceHeight) / 2;
            }

            tempCtx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, photoSize, photoSize);
            photos.push(tempCanvas.toDataURL('image/png'));

            if (i < 2) await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const finalCanvas = canvasRef.current;
        const finalWidth = 400;
        const finalHeight = 1250;

        finalCanvas.width = finalWidth;
        finalCanvas.height = finalHeight;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(10, 10, finalWidth - 20, finalHeight - 20);

        const loadImage = (src: string): Promise<HTMLImageElement> =>
            new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });

        const photoWidth = 300;
        const photoHeight = 300;
        const photoX = (finalWidth - photoWidth) / 2;
        const photoSpacing = 20;
        const startY = 40;

        try {
            setStatus('Criando layout...');
            const images = await Promise.all(photos.map(loadImage));

            for (let i = 0; i < 3; i++) {
                const photoY = startY + i * (photoHeight + photoSpacing);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(photoX - 10, photoY - 10, photoWidth + 20, photoHeight + 20);
                ctx.drawImage(images[i], photoX, photoY, photoWidth, photoHeight);
            }

            const textAreaStart = startY + (3 * photoHeight) + (2 * photoSpacing) + 20;
            const textAreaHeight = finalHeight - textAreaStart - 20;
            const textCenterY = textAreaStart + (textAreaHeight / 2);

            ctx.fillStyle = '#333333';
            ctx.font = 'bold 20px sans-serif';
            ctx.textAlign = 'center';
            
            // Lógica de exibição de nomes
            let displayText = '';
            if (coupleName1 && coupleName2) {
                displayText = `${coupleName1} & ${coupleName2}`;
            } else {
                displayText = coupleName1 || coupleName2 || eventName || '';
            }
            
            ctx.fillText(displayText, finalWidth / 2, textCenterY - 15);
            ctx.font = '16px sans-serif';
            ctx.fillText(eventDate, finalWidth / 2, textCenterY + 10);
            ctx.font = '24px serif';
            ctx.fillText('♥', finalWidth / 2, textCenterY + 40);

            setFinalImageData(finalCanvas.toDataURL('image/png'));
            setShowConfirmation(true);
            setStatus('Câmera pronta!');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao criar layout:', msg);
            setStatus('Erro ao criar layout');
            setTimeout(() => setStatus('Câmera pronta!'), 2000);
        } finally {
            setIsCapturing(false);
            setCaptureCount(0);
            setCountdown(0);
        }
    };

    const startRecording = async () => {
        if (!streamRef.current) return;

        try {
            const options: MediaRecorderOptions = {
                mimeType: 'video/webm;codecs=vp9,opus',
                videoBitsPerSecond: 2500000,
            };

            let mediaRecorder: MediaRecorder;
            try {
                mediaRecorder = new MediaRecorder(streamRef.current, options);
            } catch {
                mediaRecorder = new MediaRecorder(streamRef.current);
            }

            const chunks: Blob[] = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) chunks.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                try {
                    const fileName = `video_${Date.now()}.webm`;
                    const { data: uploadData, error: uploadError } = await supabase.storage
                        .from('media-bucket')
                        .upload(`videos/${fileName}`, blob, { contentType: 'video/webm', upsert: true });

                    if (uploadError) {
                        setError(`Erro ao fazer upload do vídeo: ${uploadError.message}`);
                        return;
                    }

                    // ✅ Insert record in 'media' table so the gallery can find the video
                    const { error: insertError } = await supabase
                        .from('media')
                        .insert([{ event_id: eventId, file_path: uploadData.path, media_type: 'video' }]);

                    if (insertError) {
                        console.error('Erro ao salvar metadados do vídeo:', insertError);
                    }

                    const { data: { publicUrl } } = supabase.storage
                        .from('media-bucket')
                        .getPublicUrl(`videos/${uploadData.path}`);

                    onCapture({ type: 'video', data: publicUrl, timestamp: Date.now() });
                } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
                    setError(`Erro ao processar vídeo: ${msg}`);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            setError('Erro ao gravar vídeo: ' + msg);
        }
    };

    const confirmSave = async () => {
        try {
            if (isTrial && photoLimit > 0 && photoCount >= photoLimit) {
                setError(`❌ Limite de ${photoLimit} fotos atingido!`);
                setTimeout(() => onClose(), 2000);
                return;
            }

            const compressedBlob = await compressImage(finalImageData, 0.8);
            const fileName = `photo_${Date.now()}.jpg`;

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('media-bucket')
                .upload(`photos/${fileName}`, compressedBlob, { contentType: 'image/jpeg' });

            if (uploadError) {
                console.error('Erro no upload:', uploadError);
                return;
            }

            if (uploadData) {
                const { error: insertError } = await supabase
                    .from('media')
                    .insert([{ event_id: eventId, file_path: uploadData.path, media_type: 'photo' }]);

                if (insertError) {
                    console.error('Erro ao inserir metadados:', insertError);
                } else if (isTrial && eventId) {
                    const { error: updateError } = await supabase
                        .from('events')
                        .update({ photo_count: (photoCount || 0) + 1 })
                        .eq('id', eventId);
                    if (updateError) console.error('Erro ao atualizar contador:', updateError);
                }
            }

            const { data: { publicUrl } } = supabase.storage
                .from('media-bucket')
                .getPublicUrl(`photos/${fileName}`);

            onCapture({ type: 'photo', data: publicUrl, timestamp: Date.now() });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            console.error('Erro ao salvar foto:', msg);
        } finally {
            setShowConfirmation(false);
            setFinalImageData('');
        }
    };

    const cancelSave = () => {
        setShowConfirmation(false);
        setFinalImageData('');
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    };

    return {
        videoRef,
        canvasRef,
        error,
        status,
        mode,
        isRecording,
        recordingTime,
        facingMode,
        isCapturing,
        captureCount,
        countdown,
        showConfirmation,
        finalImageData,
        setMode,
        toggleCamera,
        startCamera,
        takePhoto,
        startRecording,
        stopRecording,
        confirmSave,
        cancelSave,
    };
}
