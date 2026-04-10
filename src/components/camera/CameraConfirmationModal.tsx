import { Button } from '@/components/ui/button';

interface CameraConfirmationModalProps {
    finalImageData: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function CameraConfirmationModal({ finalImageData, onConfirm, onCancel }: CameraConfirmationModalProps) {
    return (
        <div className="absolute inset-0 bg-black/90 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-sm w-full max-h-[90vh] overflow-y-auto">
                <div className="p-4">
                    <h2 className="text-lg font-bold text-center mb-4">Confirmar Fotos</h2>

                    {finalImageData && (
                        <div className="mb-6 w-full flex justify-center">
                            <img
                                src={finalImageData}
                                alt="Layout final das fotos"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                                style={{ maxHeight: '300px' }}
                            />
                        </div>
                    )}

                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-600 mb-2">
                            Deseja salvar essas fotos na galeria de memórias?
                        </p>
                        <p className="text-xs text-gray-500">
                            As fotos serão combinadas em um layout de filme fotográfico
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <Button
                            onClick={onCancel}
                            variant="outline"
                            className="flex-1 border-purple-400 text-purple-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            Salvar na Galeria
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
