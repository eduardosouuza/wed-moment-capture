// Definição de temas de cores para eventos
// Cada tema contém: primary (cor principal), secondary (cor secundária), 
// accent (cor de destaque) e light (versão clara para backgrounds)

export type ThemeColor = 'purple' | 'blue' | 'pink' | 'green' | 'orange' | 'red';

export interface ThemeColors {
    name: string;
    emoji: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    light: string;
    textOnPrimary: string;
}

export const themes: Record<ThemeColor, ThemeColors> = {
    purple: {
        name: 'Roxo Elegante',
        emoji: '🟣',
        primary: '#8B5CF6',
        primaryHover: '#7C3AED',
        secondary: '#C084FC',
        accent: '#DDD6FE',
        light: '#F5F3FF',
        textOnPrimary: '#FFFFFF',
    },
    blue: {
        name: 'Azul Oceano',
        emoji: '🔵',
        primary: '#3B82F6',
        primaryHover: '#2563EB',
        secondary: '#60A5FA',
        accent: '#BFDBFE',
        light: '#EFF6FF',
        textOnPrimary: '#FFFFFF',
    },
    pink: {
        name: 'Rosa Romântico',
        emoji: '💗',
        primary: '#EC4899',
        primaryHover: '#DB2777',
        secondary: '#F472B6',
        accent: '#FBCFE8',
        light: '#FDF2F8',
        textOnPrimary: '#FFFFFF',
    },
    green: {
        name: 'Verde Natural',
        emoji: '🟢',
        primary: '#10B981',
        primaryHover: '#059669',
        secondary: '#34D399',
        accent: '#A7F3D0',
        light: '#ECFDF5',
        textOnPrimary: '#FFFFFF',
    },
    orange: {
        name: 'Laranja Vibrante',
        emoji: '🟠',
        primary: '#F97316',
        primaryHover: '#EA580C',
        secondary: '#FB923C',
        accent: '#FED7AA',
        light: '#FFF7ED',
        textOnPrimary: '#FFFFFF',
    },
    red: {
        name: 'Vermelho Paixão',
        emoji: '🔴',
        primary: '#EF4444',
        primaryHover: '#DC2626',
        secondary: '#F87171',
        accent: '#FECACA',
        light: '#FEF2F2',
        textOnPrimary: '#FFFFFF',
    },
};

// Função helper para obter tema
export const getTheme = (color: ThemeColor = 'purple'): ThemeColors => {
    return themes[color] || themes.purple;
};

// Aplicar tema via CSS variables
export const applyTheme = (color: ThemeColor) => {
    const theme = getTheme(color);
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', theme.primary);
    root.style.setProperty('--theme-primary-hover', theme.primaryHover);
    root.style.setProperty('--theme-secondary', theme.secondary);
    root.style.setProperty('--theme-accent', theme.accent);
    root.style.setProperty('--theme-light', theme.light);
    root.style.setProperty('--theme-text-on-primary', theme.textOnPrimary);
};
