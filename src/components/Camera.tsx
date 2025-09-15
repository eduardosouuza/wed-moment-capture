import React, { useRef, useEffect, useState } from 'react';
import { X, Camera as CameraIcon, Video, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface CameraProps {
  onCapture: (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('Iniciando...');
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [finalImageData, setFinalImageData] = useState<string>('');

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Timer para gravação
  useEffect(() => {
    let interval: NodeJS.Timeout;
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
  }, [isRecording]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, mode]);

  const startCamera = async () => {
    try {
      setStatus('Verificando se a câmera está disponível...');
      console.log('1. Verificando APIs');
      
      // Parar stream existente se houver
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (!navigator.mediaDevices) {
        throw new Error('navigator.mediaDevices não disponível');
      }
      
      setStatus('Solicitando permissão da câmera...');
      console.log('2. Solicitando stream');
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: facingMode
          }, 
          audio: mode === 'video' 
        });
      } catch (err) {
        if (err.name === 'NotReadableError') {
          console.warn('Dispositivo em uso, tentando novamente após delay');
          await new Promise(resolve => setTimeout(resolve, 1000));
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: facingMode
            }, 
            audio: mode === 'video' 
          });
        } else {
          throw err;
        }
      }

      console.log('Stream obtido com configurações padrão');
      
      console.log('3. Stream obtido:', stream);
      setStatus('Câmera obtida, inicializando vídeo...');
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('4. Stream definido no vídeo');
        
        videoRef.current.onloadedmetadata = () => {
          console.log('5. Metadados carregados');
          setStatus('Câmera pronta!');
          videoRef.current?.play().catch(err => {
            console.error('Erro ao reproduzir:', err);
            setError('Erro ao reproduzir vídeo: ' + err.message);
          });
        };
      }
      
    } catch (err: any) {
      console.error('Erro na câmera:', err);
      setError(`Erro: ${err.message}`);
      setStatus('Erro ao acessar câmera');
    }
  };

  const takePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const ctx = canvasRef.current.getContext('2d');
    
    if (!ctx) return;

    setIsCapturing(true);
    
    // Countdown de 5 segundos
    for (let i = 5; i > 0; i--) {
      setCountdown(i);
      setStatus(`Prepare-se... ${i}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setCountdown(0);
    setStatus('Capturando 3 fotos...');
    
    // Capturar 3 fotos em sequência
    const photos: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      // Feedback visual para cada foto
      setCaptureCount(i + 1);
      setStatus(`Foto ${i + 1}/3...`);
      
      // Efeito de flash (opcional)
      if (videoRef.current) {
        videoRef.current.style.filter = 'brightness(1.5)';
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.style.filter = 'brightness(1)';
          }
        }, 100);
      }
      
      // Canvas temporário para cada foto individual
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) continue;
      
      // Dimensões da foto individual (quadrada para o layout)
      const photoSize = 300;
      tempCanvas.width = photoSize;
      tempCanvas.height = photoSize;
      
      // Calcular área de crop para foto quadrada
      const videoAspect = video.videoWidth / video.videoHeight;
      let sourceX = 0, sourceY = 0, sourceWidth = video.videoWidth, sourceHeight = video.videoHeight;
      
      if (videoAspect > 1) {
        // Vídeo é mais largo, cortar horizontalmente
        sourceWidth = video.videoHeight;
        sourceX = (video.videoWidth - sourceWidth) / 2;
      } else {
        // Vídeo é mais alto, cortar verticalmente  
        sourceHeight = video.videoWidth;
        sourceY = (video.videoHeight - sourceHeight) / 2;
      }
      
      // Desenhar a foto quadrada
      tempCtx.drawImage(
        video,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, photoSize, photoSize
      );
      
      photos.push(tempCanvas.toDataURL('image/png'));
      
      // Delay entre fotos (exceto na última)
      if (i < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Criar o layout final tipo filme fotográfico
    const finalCanvas = canvasRef.current;
    const finalWidth = 400;
    const finalHeight = 1250;
    
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    
    // Fundo branco estilo polaroid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalWidth, finalHeight);
    
    // Adicionar bordas e sombra
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(10, 10, finalWidth - 20, finalHeight - 20);
    
    // Função para carregar uma imagem
    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
      });
    };
    
    // Posicionar as 3 fotos
    const photoWidth = 300;
    const photoHeight = 300;
    const photoX = (finalWidth - photoWidth) / 2;
    const photoSpacing = 20;
    const startY = 40;
  
    try {
      setStatus('Criando layout...');
      
      // Carregar todas as imagens
      const images = await Promise.all(photos.map(photo => loadImage(photo)));
      
      // Desenhar cada foto
      for (let i = 0; i < 3; i++) {
        const photoY = startY + i * (photoHeight + photoSpacing);
        
        // Criar borda branca ao redor de cada foto
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(photoX - 10, photoY - 10, photoWidth + 20, photoHeight + 20);
        
        // Desenhar a foto
        ctx.drawImage(images[i], photoX, photoY, photoWidth, photoHeight);
      }
      
      // Calcular área disponível para texto (espaço após as fotos)
      const textAreaStart = startY + (3 * photoHeight) + (2 * photoSpacing) + 20; // 20px de margem
      const textAreaHeight = finalHeight - textAreaStart - 20; // 20px de margem inferior
      const textCenterY = textAreaStart + (textAreaHeight / 2);
      
      // Adicionar texto do casamento centralizado na área inferior
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Vitoria & Eduardo', finalWidth / 2, textCenterY - 15);
      
      ctx.font = '16px sans-serif';
      ctx.fillText('20 de Setembro, 2025', finalWidth / 2, textCenterY + 10);
      
      // Adicionar coração decorativo
      ctx.font = '24px serif';
      ctx.fillText('♥', finalWidth / 2, textCenterY + 40);
      
      const finalDataURL = finalCanvas.toDataURL('image/png');
      console.log('Sequência de 3 fotos criada em layout de filme');
      
      // Converter canvas para blob
      const blob = await new Promise<Blob | null>((resolve) => {
        finalCanvas.toBlob(resolve, 'image/png');
      });
      
      if (!blob) {
        console.error('Falha ao criar blob da imagem');
        return;
      }
      
      // Armazenar dados localmente para confirmação (sem upload ainda)
      setCapturedPhotos(photos);
      setFinalImageData(finalCanvas.toDataURL('image/png'));
      setShowConfirmation(true);
      
      setStatus('Câmera pronta!');
      setIsCapturing(false);
      setCaptureCount(0);
      setCountdown(0);
      
    } catch (error) {
      console.error('Erro ao criar layout:', error);
      setStatus('Erro ao criar layout');
      setIsCapturing(false);
      setCaptureCount(0);
      setCountdown(0);
      setTimeout(() => setStatus('Câmera pronta!'), 2000);
    }
  };

  const startRecording = async () => {
    if (!streamRef.current) return;
    
    try {
      // Configurar opções do MediaRecorder para melhor qualidade
      const options: MediaRecorderOptions = {
        mimeType: 'video/webm;codecs=vp9,opus',
        videoBitsPerSecond: 2500000 // 2.5 Mbps para boa qualidade
      };
      
      // Fallback se o codec não for suportado
      let mediaRecorder: MediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(streamRef.current, options);
      } catch {
        mediaRecorder = new MediaRecorder(streamRef.current);
      }
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        try {
          // Upload para Supabase Storage
          const fileName = `video_${Date.now()}.webm`;
          
          // Verificar se o bucket existe
          const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
          if (bucketError) {
            console.error('Erro ao listar buckets:', bucketError);
            setError('Erro de configuração do storage');
            return;
          }
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('media-bucket')
            .upload(`videos/${fileName}`, blob, { 
              contentType: 'video/webm',
              upsert: true
            });
          
          if (uploadError) {
            console.error('Erro no upload do vídeo:', uploadError);
            setError(`Erro ao fazer upload do vídeo: ${uploadError.message}`);
            return;
          }
        
          // Nota: Inserção de metadados desabilitada devido a políticas RLS
          // TODO: Configurar políticas RLS adequadas no Supabase para a tabela 'media'
          console.log('Upload realizado com sucesso:', uploadData.path);
          
          // Obter URL pública
          const { data: { publicUrl } } = supabase.storage
            .from('media-bucket')
            .getPublicUrl(`videos/${fileName}`);
          
          onCapture({
            type: 'video',
            data: publicUrl,
            timestamp: Date.now()
          });
          
        } catch (error) {
          console.error('Erro geral no processamento do vídeo:', error);
          setError(`Erro ao processar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      setError('Erro ao gravar vídeo: ' + (err as Error).message);
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const confirmSave = async () => {
    try {
      // Converter data URL para blob
      const response = await fetch(finalImageData);
      const blob = await response.blob();
      
      // Upload para Supabase Storage
      const fileName = `photo_${Date.now()}.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-bucket')
        .upload(`photos/${fileName}`, blob, { contentType: 'image/png' });
      
      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        return;
      }
      
      // Inserir metadados na tabela media sem user_id
      if (uploadData) {
        const { data: insertData, error: insertError } = await supabase
          .from('media')
          .insert([
            {
              file_path: uploadData.path,
              media_type: 'photo',
            }
          ]);
      
        if (insertError) {
          console.error('Erro ao inserir metadados:', insertError);
        }
      }
      
      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('media-bucket')
        .getPublicUrl(`photos/${fileName}`);
      
      // Chamar onCapture com a URL pública
      onCapture({
        type: 'photo',
        data: publicUrl,
        timestamp: Date.now()
      });
      
    } catch (error) {
      console.error('Erro ao salvar foto:', error);
    }
    
    setShowConfirmation(false);
    setCapturedPhotos([]);
    setFinalImageData('');
    
    // Recarregar a página para atualizar a galeria
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const cancelSave = () => {
    setShowConfirmation(false);
    setCapturedPhotos([]);
    setFinalImageData('');
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header melhorado */}
      <div className="flex justify-between items-center p-4 bg-black text-white shrink-0">
        <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
          <X className="w-6 h-6" />
        </Button>
        
        {/* Seletor de modo */}
        <div className="flex bg-white/20 rounded-full p-1">
          <button
            onClick={() => setMode('photo')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              mode === 'photo' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
            }`}
          >
            📸 Foto
          </button>
          <button
            onClick={() => setMode('video')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              mode === 'video' ? 'bg-white text-black' : 'text-white hover:bg-white/10'
            }`}
          >
            🎥 Vídeo
          </button>
        </div>
        
        <Button onClick={toggleCamera} variant="ghost" className="text-white hover:bg-white/20">
          <RotateCcw className="w-6 h-6" />
        </Button>
      </div>

      {/* Área principal */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 min-h-0">
        {error ? (
          <div className="w-full max-w-sm mx-auto bg-red-900 text-white p-6 rounded-lg text-center">
            <h2 className="text-lg mb-3">Erro na Câmera</h2>
            <p className="mb-3 text-sm">{error}</p>
            <p className="text-xs mb-3">Status: {status}</p>
            <div className="text-xs text-left bg-black/50 p-3 rounded mb-3">
              <p>Informações técnicas:</p>
              <p>• Protocolo: {window.location.protocol}</p>
              <p>• Host: {window.location.hostname}</p>
              <p>• MediaDevices: {navigator.mediaDevices ? 'SIM' : 'NÃO'}</p>
            </div>
            <Button onClick={startCamera} size="sm">
              Tentar Novamente
            </Button>
          </div>
        ) : (
          <div 
            className="relative w-full max-w-xs mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
            style={{ 
              aspectRatio: '9/16',
              maxHeight: 'calc(100vh - 200px)',
              height: 'auto'
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-gray-800"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            
            {/* Status overlay */}
            <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {status}
            </div>
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium animate-pulse">
                REC {recordingTime}s
              </div>
            )}
            
            {/* Indicador de resolução */}
            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Filme Fotográfico
            </div>
            
            {/* Countdown antes da captura */}
            {countdown > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white px-6 py-4 rounded-full text-center animate-pulse">
                <div className="text-6xl font-bold">{countdown}</div>
                <div className="text-sm mt-2">Prepare-se!</div>
              </div>
            )}
            
            {/* Contador de fotos durante captura */}
            {isCapturing && countdown === 0 && captureCount > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center">
                <div className="text-2xl font-bold">{captureCount}/3</div>
                <div className="text-sm">Capturando...</div>
              </div>
            )}
            
            {/* Linhas de guia sutis */}
            {!isCapturing && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20"></div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles melhorados */}
      <div className="p-4 bg-black shrink-0">
        <div className="flex items-center justify-center mb-4">
          <Button
            onClick={mode === 'photo' ? takePhoto : (isRecording ? stopRecording : startRecording)}
            disabled={!!error || status !== 'Câmera pronta!' || isCapturing || countdown > 0}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${
              mode === 'video' && isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : isCapturing || countdown > 0
                ? 'bg-gray-400'
                : 'bg-white hover:bg-gray-100'
            } transition-all duration-200 shadow-lg disabled:opacity-50`}
          >
            {mode === 'photo' ? (
              <CameraIcon className="w-6 h-6 md:w-8 md:h-8 text-black" />
            ) : isRecording ? (
              <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded"></div>
            ) : (
              <Video className="w-6 h-6 md:w-8 md:h-8 text-black" />
            )}
          </Button>
        </div>
        
        <div className="text-center">
          {mode === 'photo' && (
            <div>
              <p className="text-white/70 text-sm">
                {status === 'Câmera pronta!' ? 'Toque para sequência de 3 fotos' : status}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {status === 'Câmera pronta!' ? 'Countdown 5s + 3 fotos • Filme Fotográfico' : 'Layout: Filme Fotográfico'}
              </p>
            </div>
          )}
        
          {mode === 'video' && (
            <div>
              <p className="text-white/70 text-sm">
                {isRecording ? 'Toque para parar' : 'Toque para gravar'} (máx. 15s)
              </p>
              <p className="text-white/50 text-xs mt-1">
                1080×1920 • 9:16
              </p>
            </div>
          )}
        </div>
      </div>

     {/* Modal de Confirmação */}
     {showConfirmation && (
       <div className="absolute inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
         <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
           <div className="p-4">
             <h2 className="text-lg font-bold text-center mb-4">Confirmar Fotos</h2>
             
             {/* Preview do layout final */}
             <div className="mb-6">
               {finalImageData && (
                 <div className="w-full flex justify-center">
                   <img 
                     src={finalImageData} 
                     alt="Layout final das fotos"
                     className="max-w-full h-auto rounded-lg shadow-lg"
                     style={{ maxHeight: '300px' }}
                   />
                 </div>
               )}
             </div>
             
             <div className="text-center mb-6">
               <p className="text-sm text-gray-600 mb-2">
                 Deseja salvar essas fotos na galeria de memórias?
               </p>
               <p className="text-xs text-gray-500">
                 As fotos serão combinadas em um layout de filme fotográfico
               </p>
             </div>
             
             {/* Botões de ação */}
             <div className="flex space-x-3">
               <Button 
                 onClick={cancelSave}
                 variant="outline" 
                 className="flex-1"
               >
                 Cancelar
               </Button>
               <Button 
                 onClick={confirmSave}
                 className="flex-1 bg-green-600 hover:bg-green-700"
               >
                 Salvar na Galeria
               </Button>
             </div>
           </div>
         </div>
       </div>
     )}

     {/* Canvas oculto */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Camera;
