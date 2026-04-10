import { Aperture } from 'lucide-react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ variant = 'dark', size = 'md', className = '' }: LogoProps) {
  // Tamanhos
  const sizes = {
    sm: {
      icon: 'w-5 h-5',
      text: 'text-xl',
      container: 'p-1.5 rounded-lg'
    },
    md: {
      icon: 'w-6 h-6',
      text: 'text-2xl',
      container: 'p-2 rounded-xl'
    },
    lg: {
      icon: 'w-8 h-8',
      text: 'text-3xl',
      container: 'p-2.5 rounded-xl'
    },
    xl: {
      icon: 'w-10 h-10',
      text: 'text-4xl',
      container: 'p-3 rounded-2xl'
    }
  };

  // Cores do texto
  const textColors = {
    dark: 'text-gray-900',
    light: 'text-white'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizes[size].container} bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/20 flex items-center justify-center`}>
        <Aperture className={`${sizes[size].icon} text-white`} strokeWidth={2.5} />
        {/* Brilho sutil */}
        <div className="absolute inset-0 bg-white/20 rounded-inherit opacity-0 hover:opacity-100 transition-opacity" />
      </div>

      <span className={`font-bold font-display tracking-tight ${sizes[size].text} ${textColors[variant]}`}>
        Lume
      </span>
    </div>
  );
}
