import { defineStore } from "pinia";
import { ref, computed } from "vue";
import defaultWallpaper from "@/assets/wallpapers/classic/classic-1.jpg";

// ✅ Импортируем КОНКРЕТНЫЕ файлы (для фолбэков)
// ✅ Импортируем КОНКРЕТНЫЕ файлы (для фолбэков)
// Note: imports moved to wallpapers.ts, keeping default only


export type ThemeType = 'image' | 'gradient' | 'color';

export interface WallpaperItem {
  id: string;
  category?: string;
  title: string;
  // Унифицированные поля для работы с useImageFallback и данными
  src?: string;       // Legacy field, mapping to url/localUrl
  url?: string;       // Primary image URL (import or remote)
  localUrl?: string;  // Explicit local import
  remoteUrl?: string; // Explicit remote URL
  color?: string;     // For solid color items
  css?: string;       // For gradients
  isPremium?: boolean;
}

const STORAGE_KEY_TYPE = "namaz_theme_type";
const STORAGE_KEY_VALUE = "namaz_theme_value";

// Default theme
const DEFAULT_THEME_TYPE: ThemeType = 'image';
const DEFAULT_THEME_VALUE = defaultWallpaper;

export const useThemeStore = defineStore("theme", () => {
  const themeType = ref<ThemeType>(DEFAULT_THEME_TYPE);
  const themeValue = ref<string>(DEFAULT_THEME_VALUE);

  // Computed style for the background element
  const backgroundStyle = computed(() => {
    if (themeType.value === 'image') {
      return {
        backgroundImage: `url(${themeValue.value})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        backgroundRepeat: "no-repeat",
      };
    } else if (themeType.value === 'gradient') {
      return {
        background: themeValue.value,
      };
    } else {
      return {
        backgroundColor: themeValue.value,
      };
    }
  });

  function setTheme(type: ThemeType, value: string) {
    themeType.value = type;
    themeValue.value = value;
    localStorage.setItem(STORAGE_KEY_TYPE, type);
    localStorage.setItem(STORAGE_KEY_VALUE, value);
  }

  function loadFromStorage() {
    const savedType = localStorage.getItem(STORAGE_KEY_TYPE) as ThemeType | null;
    const savedValue = localStorage.getItem(STORAGE_KEY_VALUE);

    if (savedType && savedValue) {
      themeType.value = savedType;
      themeValue.value = savedValue;
    }
  }

  return {
    themeType,
    themeValue,
    backgroundStyle,
    setTheme,
    loadFromStorage,
  };
});
