import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  gradient: string;
  glow: string;
  bg: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: ThemeColors;
  preview: string[];  // 4 colors for the card preview
}

// Predefined themes
export const THEMES: Theme[] = [
  {
    id: 'sunset',
    name: 'Sunset',
    colors: {
      primary: '#FF5722',
      secondary: '#FF9800',
      accent: '#FFC107',
      gradient: 'linear-gradient(135deg, #FF5722, #FF2D55)',
      glow: 'rgba(255, 87, 34, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#FF5722', '#FF9800', '#FFC107', '#E64A19'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      gradient: 'linear-gradient(135deg, #0077B6, #00B4D8)',
      glow: 'rgba(0, 119, 182, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
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
      glow: 'rgba(45, 106, 79, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
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
      glow: 'rgba(123, 45, 142, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
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
      glow: 'rgba(230, 57, 70, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
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
      glow: 'rgba(255, 107, 107, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#FF6B6B', '#FFA07A', '#FFD93D', '#C44569'],
  },
  {
    id: 'amber',
    name: 'Amber',
    colors: {
      primary: '#E85D04',
      secondary: '#F48C06',
      accent: '#FAA307',
      gradient: 'linear-gradient(135deg, #E85D04, #FAA307)',
      glow: 'rgba(232, 93, 4, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#E85D04', '#F48C06', '#FAA307', '#DC2F02'],
  },
  {
    id: 'teal',
    name: 'Teal',
    colors: {
      primary: '#0D9488',
      secondary: '#14B8A6',
      accent: '#5EEAD4',
      gradient: 'linear-gradient(135deg, #0D9488, #14B8A6)',
      glow: 'rgba(13, 148, 136, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#0D9488', '#14B8A6', '#5EEAD4', '#0F766E'],
  },
  {
    id: 'midnight',
    name: 'Midnight',
    colors: {
      primary: '#0A1B2A',
      secondary: '#1A2942',
      accent: '#3B82F6',
      gradient: 'linear-gradient(135deg, #1A2942, #3B82F6)',
      glow: 'rgba(59, 130, 246, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#0A1B2A', '#1A2942', '#2A3F5A', '#3B82F6'],
  },
  {
    id: 'indigo',
    name: 'Indigo',
    colors: {
      primary: '#3F37C9',
      secondary: '#4895EF',
      accent: '#4CC9F0',
      gradient: 'linear-gradient(135deg, #3F37C9, #4895EF)',
      glow: 'rgba(63, 55, 201, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#3F37C9', '#4895EF', '#4CC9F0', '#4361EE'],
  },
  {
    id: 'sage',
    name: 'Sage',
    colors: {
      primary: '#606C38',
      secondary: '#8B9E6B',
      accent: '#A3B18A',
      gradient: 'linear-gradient(135deg, #606C38, #A3B18A)',
      glow: 'rgba(96, 108, 56, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#606C38', '#8B9E6B', '#A3B18A', '#344E41'],
  },
  {
    id: 'slate',
    name: 'Slate',
    colors: {
      primary: '#636E72',
      secondary: '#B2BEC3',
      accent: '#DFE6E9',
      gradient: 'linear-gradient(135deg, #636E72, #B2BEC3)',
      glow: 'rgba(99, 110, 114, 0.4)',
      bg: '#000000',
      card: '#1D1D1F',
      text: '#F5F5F7',
      textMuted: '#86868B',
      border: 'rgba(255, 255, 255, 0.1)',
    },
    preview: ['#2D3436', '#636E72', '#B2BEC3', '#DFE6E9'],
  },
];

interface ThemeState {
  activeThemeId: string;
  setActiveTheme: (themeId: string) => void;
  getActiveTheme: () => Theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: 'sunset',
      setActiveTheme: (themeId) => set({ activeThemeId: themeId }),
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
