import type { WallpaperItem } from "@/stores/themeStore";

import classic1 from "@/assets/wallpapers/classic/classic-1.jpg";
import classic2 from "@/assets/wallpapers/classic/classic-2.jpg";
import classic3 from "@/assets/wallpapers/classic/classic-3.jpg";
import classic4 from "@/assets/wallpapers/classic/classic-4.jpg";
import classic5 from "@/assets/wallpapers/classic/classic-5.jpg";


import ai1 from "@/assets/wallpapers/ai/ai-1.jpg";
import ai2 from "@/assets/wallpapers/ai/ai-2.webp";
import ai3 from "@/assets/wallpapers/ai/ai-3.webp";
import ai4 from "@/assets/wallpapers/ai/ai-4.png";
import ai5 from "@/assets/wallpapers/ai/ai-5.png";

import makkah1 from "@/assets/wallpapers/makkah/makkah-1.png";
import makkah2 from "@/assets/wallpapers/makkah/makkah-2.png";
import makkah3 from "@/assets/wallpapers/makkah/makkah-3.png";
import makkah4 from "@/assets/wallpapers/makkah/makkah-4.png";
import makkah5 from "@/assets/wallpapers/makkah/makkah-5.png";


// Interfaces
export { type WallpaperItem };

export interface GradientItem {
  id: string;
  css: string;
}

// Data
export const gradients: GradientItem[] = [
  { id: 'g_emerald', css: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)' },
  { id: 'g_gold', css: 'linear-gradient(135deg, #b45309 0%, #78350f 100%)' },
  { id: 'g_midnight', css: 'linear-gradient(135deg, #1e3a8a 0%, #172554 100%)' },
  { id: 'g_sand', css: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)' },
  { id: 'g_fajr', css: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' },
  { id: 'g1', css: 'linear-gradient(45deg, #FF9A9E 0%, #FECFEF 99%, #FECFEF 100%)' },
  { id: 'g2', css: 'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)' },
  { id: 'g3', css: 'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)' },
  { id: 'g4', css: 'linear-gradient(to right, #43e97b 0%, #38f9d7 100%)' },
  { id: 'g5', css: 'linear-gradient(to top, #30cfd0 0%, #330867 100%)' },
];
export const classicWallpapers: WallpaperItem[] = [
  {
    id: "classic-1",
    title: "White Mosque",
    url: classic1, // local import
    localUrl: classic1,
  },
  {
    id: "classic-2",
    title: "Night Crescent",
    url: classic2,
    localUrl: classic2,
  },
  {
    id: "classic-3",
    title: "Old City",
    url: classic3,
    localUrl: classic3,
  },
  {
    id: "classic-4",
    title: "Mosque",
    url: classic4,
    localUrl: classic4,
  },
  {
    id: "classic-5",
    title: "Black Mosque",
    url: classic5,
    localUrl: classic5,
  },
];

export const aiWallpapers: WallpaperItem[] = [
  {
    id: "ai-1",
    title: "AI Mosque",
    url: ai1,
    localUrl: ai1,
    isPremium: true
  },
  {
    id: "ai-2",
    title: "AI Minaret",
    url: ai2,
    localUrl: ai2,
    isPremium: true
  },
  {
    id: "ai-3",
    title: "AI Prayer",
    url: ai3,
    localUrl: ai3,
    isPremium: true
  },
  {
    id: "ai-4",
    title: "Premium Night",
    url: ai4,
    localUrl: ai4,
    isPremium: true
  },
  {
    id: "ai-5",
    title: "Eco-Futurism",
    url: ai5,
    localUrl: ai5,
    isPremium: true
  },
];

export const makkahWallpapers: WallpaperItem[] = [
  { id: "makkah-1", title: "Masjid al-Haram Aerial", url: makkah1, localUrl: makkah1 },
  { id: "makkah-2", title: "Royal Clock Tower", url: makkah2, localUrl: makkah2 },
  { id: "makkah-3", title: "Sunset over Mecca", url: makkah3, localUrl: makkah3 },
  { id: "makkah-4", title: "Holy Kaaba Detail", url: makkah4, localUrl: makkah4 },
  { id: "makkah-5", title: "Pilgrims' Prayer", url: makkah5, localUrl: makkah5 },
];

export interface WallpaperSection {
  id: string;
  title: string;
  items: WallpaperItem[];
}

export const wallpaperSections: WallpaperSection[] = [
  {
    id: 'ai',
    title: 'AI',
    items: aiWallpapers,
  },
  {
    id: 'makkah',
    title: 'Makkah',
    items: makkahWallpapers,
  },
  {
    id: 'classic',
    title: 'Classic',
    items: classicWallpapers,
  },
];
