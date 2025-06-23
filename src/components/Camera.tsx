
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Camera as CameraIcon, Video, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraProps {
  onCapture: (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => void;
  onClose: () => void;
}

const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    console.log('Tentando iniciar câmera...');
    try {
      // Para primeiro qualquer stream existente
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Solicita acesso à câmera
      const constraints = {
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: true
      };

      console.log('Solicitando acesso à câmera com constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Stream obtido:', stream);
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        console.log('Stream atribuído ao elemento video');
        
        // Aguarda o video estar pronto
        videoRef.current.onloadedmetadata = () => {
          console.log('Metadata do video carregada');
          setCameraReady(true);
          setError(null);
        };
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      setError(`Erro ao acessar a câmera: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      setCameraReady(false);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    
    return () => {
      console.log('Limpando resources da câmera');
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log('Parando track:', track.kind);
          track.stop();
        });
      }
    };
  }, [startCamera]);

  const takePhoto = useCallback(() => {
    console.log('Tirando foto...');
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 3) {
      console.log('Não é possível tirar foto - condições não atendidas');
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      console.log('Foto capturada, tamanho:', photoData.length);
      setCapturedPhotos(prev => [...prev, photoData]);
    }
  }, [capturedPhotos.length]);

  const startRecording = useCallback(() => {
    console.log('Iniciando gravação...');
    if (!streamRef.current) {
      console.log('Stream não disponível para gravação');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        console.log('Dados de vídeo disponíveis:', event.data.size);
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Gravação parada, processando...');
        const blob = new Blob(chunks, { type: 'video/webm' });
        
        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('Vídeo convertido para base64');
          onCapture({
            type: 'video',
            data: reader.result as string,
            timestamp: Date.now()
          });
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Timer para gravação (máximo 15 segundos)
      const timer = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 14) { // Para aos 15 segundos
            stopRecording();
            clearInterval(timer);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao iniciar gravação:', error);
      setError('Erro ao iniciar gravação de vídeo');
    }
  }, [onCapture]);

  const stopRecording = useCallback(() => {
    console.log('Parando gravação...');
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const toggleCamera = () => {
    console.log('Alternando câmera...');
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setCameraReady(false);
  };

  const submitPhotos = () => {
    console.log('Enviando fotos:', capturedPhotos.length);
    capturedPhotos.forEach((photo, index) => {
      onCapture({
        type: 'photo',
        data: photo,
        timestamp: Date.now() + index
      });
    });
  };

  const resetPhotos = () => {
    console.log('Resetando fotos');
    setCapturedPhotos([]);
  };

  // Tela de erro
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <CameraIcon className="w-12 h-12 mx-auto mb-2" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Câmera não disponível</h3>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <div className="space-y-2">
            <Button onClick={startCamera} className="w-full">
              Tentar novamente
            </Button>
            <Button onClick={onClose} variant="outline" className="w-full">
              Fechar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Tela de carregamento
  if (!cameraReady) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg mb-2">Carregando câmera...</p>
          <p className="text-sm text-gray-300">Permita o acesso quando solicitado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black/50 text-white">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-5 h-5" />
        </Button>
        <div className="text-center">
          {capturedPhotos.length > 0 && (
            <span className="text-sm">{capturedPhotos.length}/3 fotos</span>
          )}
          {isRecording && (
            <span className="text-red-400 text-sm font-mono">{recordingTime + 1}s / 15s</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={toggleCamera} className="text-white hover:bg-white/20">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="bg-red-500 rounded-full w-3 h-3 animate-pulse" />
            <span className="text-white text-sm font-mono">REC</span>
          </div>
        )}
      </div>

      {/* Photo Preview Strip */}
      {capturedPhotos.length > 0 && (
        <div className="bg-black/70 p-3">
          <div className="flex space-x-2 overflow-x-auto">
            {capturedPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-16 h-16 object-cover rounded border-2 border-white/50 flex-shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-black/70 p-6 flex justify-center items-center space-x-6">
        {capturedPhotos.length === 0 ? (
          <>
            {/* Take Photo Button */}
            <div className="text-center">
              <Button
                onClick={takePhoto}
                disabled={capturedPhotos.length >= 3}
                className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 transition-all duration-300 mb-2"
              >
                <CameraIcon className="w-8 h-8 text-black" />
              </Button>
              <p className="text-white text-xs">Foto</p>
            </div>
            
            {/* Record Video Button */}
            <div className="text-center">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full transition-all duration-300 mb-2 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-olive-500 hover:bg-olive-600'
                }`}
              >
                <Video className="w-8 h-8 text-white" />
              </Button>
              <p className="text-white text-xs">{isRecording ? 'Parar' : 'Vídeo'}</p>
            </div>
          </>
        ) : (
          <div className="flex space-x-4">
            {capturedPhotos.length < 3 && (
              <Button
                onClick={takePhoto}
                className="w-12 h-12 rounded-full bg-white hover:bg-gray-200"
              >
                <CameraIcon className="w-6 h-6 text-black" />
              </Button>
            )}
            
            <Button
              onClick={submitPhotos}
              className="w-12 h-12 rounded-full bg-olive-500 hover:bg-olive-600"
            >
              <Check className="w-6 h-6 text-white" />
            </Button>
            
            <Button
              onClick={resetPhotos}
              variant="outline"
              className="w-12 h-12 rounded-full border-white text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Camera;
