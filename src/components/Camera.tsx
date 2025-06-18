
import React, { useRef, useState, useCallback } from 'react';
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

  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
      }
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      alert('Não foi possível acessar a câmera. Verifique as permissões.');
    }
  }, [facingMode]);

  React.useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || capturedPhotos.length >= 3) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedPhotos(prev => [...prev, photoData]);
    }
  }, [capturedPhotos.length]);

  const startRecording = useCallback(() => {
    if (!streamRef.current) return;

    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: 'video/webm;codecs=vp8'
    });
    
    mediaRecorderRef.current = mediaRecorder;
    const chunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = () => {
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
    
    // Timer para gravação
    const timer = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 15) { // Máximo 15 segundos
          stopRecording();
          clearInterval(timer);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, [onCapture]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  }, [isRecording]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const submitPhotos = () => {
    capturedPhotos.forEach((photo, index) => {
      onCapture({
        type: 'photo',
        data: photo,
        timestamp: Date.now() + index
      });
    });
  };

  const resetPhotos = () => {
    setCapturedPhotos([]);
  };

  if (!cameraReady) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando câmera...</p>
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
            <span className="text-red-400 text-sm">{recordingTime}s</span>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={toggleCamera} className="text-white hover:bg-white/20">
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 right-4 bg-red-500 rounded-full w-4 h-4 animate-pulse" />
        )}
      </div>

      {/* Photo Preview Strip */}
      {capturedPhotos.length > 0 && (
        <div className="bg-black/70 p-2">
          <div className="flex space-x-2 overflow-x-auto">
            {capturedPhotos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Foto ${index + 1}`}
                className="w-16 h-16 object-cover rounded border-2 border-white/50"
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
            <Button
              onClick={takePhoto}
              disabled={capturedPhotos.length >= 3}
              className="w-16 h-16 rounded-full bg-white hover:bg-gray-200 transition-all duration-300"
            >
              <CameraIcon className="w-8 h-8 text-black" />
            </Button>
            
            {/* Record Video Button */}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-olive-500 hover:bg-olive-600'
              }`}
            >
              <Video className="w-8 h-8 text-white" />
            </Button>
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
