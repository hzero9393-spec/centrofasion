import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  glow: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  preview: string[];
}

export const THEMES: Theme[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#E85D04',
      secondary: '#F48C06',
      accent: '#FAA307',
      gradient: 'linear-gradient(135deg, #E85D04, #F48C06)',
      glow: 'rgba(232, 93, 4, 0.3)',
    },
    preview: ['#E85D04', '#F48C06', '#FAA307', '#DC2F02'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)',
      glow: 'rgba(0, 119, 182, 0.3)',
    },
    preview: ['#0077B6', '#00B4D8', '#90E0EF', '#023E8A'],
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: {
      primary: '#2D6A4F',
      secondary: '#40916C',
      accent: '#52B788',
      gradient: 'linear-gradient(135deg, #2D6A4F, #52B788)',
      glow: 'rgba(45, 106, 79, 0.3)',
    },
    preview: ['#2D6A4F', '#40916C', '#52B788', '#1B4332'],
  },
  {
    id: 'berry',
    name: 'Berry',
    colors: {
      primary: '#7B2D8E',
      secondary: '#9D4EDD',
      accent: '#C77DFF',
      gradient: 'linear-gradient(135deg, #7B2D8E, #9D4EDD)',
      glow: 'rgba(123, 45, 142, 0.3)',
    },
    preview: ['#7B2D8E', '#9D4EDD', '#C77DFF', '#5A189A'],
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: {
      primary: '#E63946',
      secondary: '#F4845F',
      accent: '#F7B267',
      gradient: 'linear-gradient(135deg, #E63946, #F4845F)',
      glow: 'rgba(230, 57, 70, 0.3)',
    },
    preview: ['#E63946', '#F4845F', '#F7B267', '#D62828'],
  },
  {
    id: 'coral',
    name: 'Coral',
    colors: {
      primary: '#FF6B6B',
      secondary: '#FFA07A',
      accent: '#FFD93D',
      gradient: 'linear-gradient(135deg, #FF6B6B, #FFA07A)',
      glow: 'rgba(255, 107, 107, 0.3)',
    },
    preview: ['#FF6B6B', '#FFA07A', '#FFD93D', '#C44569'],
  },
  {
    id: 'teal',
    name: 'Teal',
    colors: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#5EEAD4',
      gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
      glow: 'rgba(13, 148, 136, 0.3)',
    },
    preview: ['#0D9488', '#14B8A6', '#5EEAD4', '#0F766E'],
  },
  {
    id: 'emerald',
    name: 'Emerald',
    colors: {
      primary: '#10B981',
      secondary: '#34D399',
      accent: '#6EE7B7',
      gradient: 'linear-gradient(135deg, #10B981, #34D399)',
      glow: 'rgba(16, 185, 129, 0.3)',
    },
    preview: ['#10B981', '#34D399', '#6EE7B7', '#059669'],
  },
  {
    id: 'amber',
    name: 'Amber',
    colors: {
      primary: '#D97706',
      secondary: '#F59E0B',
      accent: '#FCD34D',
      gradient: 'linear-gradient(135deg, #D97706, #F59E0B)',
      glow: 'rgba(217, 119, 6, 0.3)',
    },
    preview: ['#D97706', '#F59E0B', '#FCD34D', '#B45309'],
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      primary: '#475569',
      secondary: '#64748B',
      accent: '#94A3B8',
      gradient: 'linear-gradient(135deg, #475569, #64748B)',
      glow: 'rgba(71, 85, 105, 0.3)',
    },
    preview: ['#334155', '#475569', '#64748B', '#94A3B8'],
  },
];

interface ThemeState {
  activeThemeId: string;
  darkMode: boolean;
  setActiveTheme: (themeId: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  getActiveTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: 'sunset',
      darkMode: true,
      setActiveTheme: (themeId) => set({ activeThemeId: themeId }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      setDarkMode: (dark) => set({ darkMode: dark }),
      getActiveTheme: () => {
        const { activeThemeId } = get();
        return THEMES.find((t) => t.id === activeThemeId) || THEMES[0];
      },
    }),
    {
      name: 'clothfasion-theme',
      skipHydration: true,
    }
  )
);
