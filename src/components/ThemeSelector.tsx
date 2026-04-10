import { themes, type ThemeColor } from '@/lib/themes';
import { Check } from 'lucide-react';

interface ThemeSelectorProps {
    selected: ThemeColor;
    onChange: (color: ThemeColor) => void;
}

export function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
    const themeOptions = Object.entries(themes) as [ThemeColor, typeof themes.purple][];

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
                Tema de Cores
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {themeOptions.map(([colorKey, theme]) => (
                    <button
                        key={colorKey}
                        type="button"
                        onClick={() => onChange(colorKey)}
                        className={`
              relative p-4 rounded-xl border-2 transition-all
              ${selected === colorKey
                                ? 'border-gray-800 shadow-lg scale-105'
                                : 'border-gray-200 hover:border-gray-300'
                            }
            `}
                    >
                        {/* Checkmark */}
                        {selected === colorKey && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-gray-800 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-white" />
                            </div>
                        )}

                        {/* Color Preview */}
                        <div className="flex items-center space-x-3 mb-2">
                            <div
                                className="w-8 h-8 rounded-full"
                                style={{ backgroundColor: theme.primary }}
                            />
                            <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: theme.accent }}
                            />
                        </div>

                        {/* Theme Name */}
                        <div className="text-left">
                            <p className="text-sm font-semibold text-gray-900">
                                {theme.emoji} {theme.name}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
                Esta cor será aplicada em toda a página pública do seu evento
            </p>
        </div>
    );
}
