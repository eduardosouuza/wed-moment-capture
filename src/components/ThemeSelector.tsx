import { themes, type ThemeColor } from '@/lib/themes';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThemeSelectorProps {
    selected: ThemeColor;
    onChange: (color: ThemeColor) => void;
}

export function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
    const themeOptions = Object.entries(themes) as [ThemeColor, typeof themes.rose][];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {themeOptions.map(([colorKey, theme]) => (
                    <button
                        key={colorKey}
                        type="button"
                        onClick={() => onChange(colorKey)}
                        className={cn(
                            "group relative p-3 rounded-2xl border-2 transition-all duration-300 text-left overflow-hidden",
                            selected === colorKey
                                ? "border-[#E85A70] bg-[#FDF2F4] dark:bg-[#E85A70]/10 shadow-md scale-[1.02]"
                                : "border-[#ede7e4] dark:border-white/10 bg-white dark:bg-white/5 hover:border-[#E85A70]/40"
                        )}
                    >
                        {/* Background Accent Gradient */}
                        {selected === colorKey && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#E85A70]/20 to-transparent rounded-bl-full pointer-events-none" />
                        )}

                        {/* Selected Indicator */}
                        <div className={cn(
                            "absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 scale-0",
                            selected === colorKey ? "scale-100 bg-[#E85A70] text-white" : "bg-gray-200 dark:bg-white/10"
                        )}>
                            <Check className="w-3 h-3" />
                        </div>

                        {/* Color Circles */}
                        <div className="flex -space-x-2 mb-3 relative z-10">
                            <div
                                className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151518] shadow-sm group-hover:scale-110 transition-transform"
                                style={{ backgroundColor: theme.primary }}
                            />
                            <div
                                className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151518] shadow-sm group-hover:scale-110 transition-transform delay-75"
                                style={{ backgroundColor: theme.secondary }}
                            />
                            <div
                                className="w-7 h-7 rounded-full border-2 border-white dark:border-[#151518] shadow-sm group-hover:scale-110 transition-transform delay-150"
                                style={{ backgroundColor: theme.accent }}
                            />
                        </div>

                        {/* Theme Info */}
                        <div className="relative z-10">
                            <span className="text-lg block mb-0.5">{theme.emoji}</span>
                            <p className={cn(
                                "text-xs font-bold font-display tracking-tight transition-colors",
                                selected === colorKey ? "text-[#E85A70]" : "text-[#1c1c1e] dark:text-gray-300"
                            )}>
                                {theme.name}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
