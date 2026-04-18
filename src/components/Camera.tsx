import React from 'react';
import { X, Camera as CameraIcon, Video, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';
import { CameraConfirmationModal } from '@/components/camera/CameraConfirmationModal';

interface CameraProps {
  onCapture: (mediaData: { type: 'photo' | 'video'; data: string; timestamp: number }) => void;
  onClose: () => void;
  eventId?: string;
  coupleName1?: string;
  coupleName2?: string;
  eventDate?: string;
  eventName?: string;
  isTrial?: boolean;
  photoLimit?: number;
  photoCount?: number;
}

const Camera: React.FC<CameraProps> = ({
  onCapture,
  onClose,
  eventId,
  coupleName1 = '',
  coupleName2 = '',
  eventDate = '',
  eventName,
  isTrial = false,
  photoLimit = 0,
  photoCount = 0,
}) => {
  const {
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
  } = useCamera({
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
  });

  const handleCaptureAction = () => {
    if (mode === 'photo') {
      takePhoto();
    } else if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const isCaptureDisabled = !!error || status !== 'Câmera pronta!' || isCapturing || countdown > 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-black text-white shrink-0">
        <Button onClick={onClose} variant="ghost" className="text-white hover:bg-white/20">
          <X className="w-6 h-6" />
        </Button>

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

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center bg-black p-4 min-h-0">
        {error ? (
          <div className="w-full max-w-sm mx-auto bg-gray-900 text-white p-6 rounded-lg text-center">
            <h2 className="text-lg mb-3">Erro na Câmera</h2>
            <p className="mb-3 text-sm">{error}</p>
            <p className="text-xs mb-3">Status: {status}</p>
            <div className="text-xs text-left bg-black/50 p-3 rounded mb-3">
              <p>Informações técnicas:</p>
              <p>• Protocolo: {window.location.protocol}</p>
              <p>• Host: {window.location.hostname}</p>
              <p>• MediaDevices: {navigator.mediaDevices ? 'SIM' : 'NÃO'}</p>
            </div>
            <Button onClick={startCamera} size="sm">Tentar Novamente</Button>
          </div>
        ) : (
          <div
            className="relative w-full max-w-xs mx-auto bg-gray-900 rounded-lg overflow-hidden shadow-2xl"
            style={{ aspectRatio: '9/16', maxHeight: 'calc(100vh - 200px)', height: 'auto' }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-gray-800"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />

            <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-sm">
              {status}
            </div>

            {isRecording && (
              <div className="absolute top-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-sm font-medium animate-pulse">
                REC {recordingTime}s
              </div>
            )}

            <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
              Filme Fotográfico
            </div>

            {countdown > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-700/90 text-white px-6 py-4 rounded-full text-center animate-pulse">
                <div className="text-6xl font-bold">{countdown}</div>
                <div className="text-sm mt-2">Prepare-se!</div>
              </div>
            )}

            {isCapturing && countdown === 0 && captureCount > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-center">
                <div className="text-2xl font-bold">{captureCount}/3</div>
                <div className="text-sm">Capturando...</div>
              </div>
            )}

            {!isCapturing && (
              <div className="absolute inset-0 pointer-events-none opacity-30">
                <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="border border-white/20" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black shrink-0">
        <div className="flex items-center justify-center mb-4">
          <Button
            onClick={handleCaptureAction}
            disabled={isCaptureDisabled}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-200 shadow-lg disabled:opacity-50 ${
              mode === 'video' && isRecording
                ? 'bg-purple-600 hover:bg-purple-700'
                : isCapturing || countdown > 0
                  ? 'bg-gray-400'
                  : 'bg-white hover:bg-gray-100'
            }`}
          >
            {mode === 'photo' ? (
              <CameraIcon className="w-6 h-6 md:w-8 md:h-8 text-black" />
            ) : isRecording ? (
              <div className="w-4 h-4 md:w-6 md:h-6 bg-white rounded" />
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
              <p className="text-white/50 text-xs mt-1">Countdown 5s + 3 fotos • Filme Fotográfico</p>
            </div>
          )}
          {mode === 'video' && (
            <div>
              <p className="text-white/70 text-sm">
                {isRecording ? 'Toque para parar' : 'Toque para gravar'} (máx. 15s)
              </p>
              <p className="text-white/50 text-xs mt-1">1080×1920 • 9:16</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação */}
      {showConfirmation && (
        <CameraConfirmationModal
          finalImageData={finalImageData}
          onConfirm={confirmSave}
          onCancel={cancelSave}
        />
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default Camera;
