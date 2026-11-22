import { Theme } from '@/lib/types';

export interface ThemeConfig {
  id: Theme;
  name: string;
  badge: string;
  bgClass: string;
  cardClass: string;
  textClass: string;
  accentClass: string;
  buttonClass: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {
  clean: {
    id: 'clean',
    name: 'Clean',
    badge: 'Classic Minimal',
    bgClass: 'bg-neutral-100/70',
    cardClass: 'bg-white border-neutral-200/90 text-neutral-900',
    textClass: 'text-neutral-900',
    accentClass: 'bg-neutral-900 text-white',
    buttonClass: 'bg-neutral-900 hover:bg-neutral-800 text-white',
  },
  warm: {
    id: 'warm',
    name: 'Warm',
    badge: 'Desi Sandalwood',
    bgClass: 'bg-[#faf6f0]',
    cardClass: 'bg-[#fffdf9] border-amber-200/70 text-amber-950 shadow-sm',
    textClass: 'text-amber-950',
    accentClass: 'bg-amber-800 text-white',
    buttonClass: 'bg-amber-800 hover:bg-amber-900 text-white',
  },
  bold: {
    id: 'bold',
    name: 'Bold',
    badge: 'Creator Dark',
    bgClass: 'bg-[#0f0f11]',
    cardClass: 'bg-[#18181b] border-neutral-800 text-white shadow-md',
    textClass: 'text-white',
    accentClass: 'bg-gradient-to-r from-amber-400 to-orange-500 text-black',
    buttonClass: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:opacity-95 text-neutral-950 font-bold',
  },
};
