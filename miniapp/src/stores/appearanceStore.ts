import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Theme {
  id: string;
  name: string;
  icon: string;
  preview: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface Wallpaper {
  id: string;
  name: string;
  category: string;
  type: 'image' | 'gradient' | 'dynamic' | 'ai' | 'user-image';
  url?: string;
  gradient?: string;
  thumbnail?: string;
  premium?: boolean;
}

export type WallpaperType = 'dynamic' | 'gradient' | 'image' | 'user-image';

export interface SelectedWallpaper {
  type: WallpaperType;
  value: string; // gradient css / image url / base64
}

const DEFAULT_THEMES: Theme[] = [
  {
    id: 'default',
    name: 'По умолчанию',
    icon: '🌙',
    preview: 'default',
    colors: {
      primary: '#1f8a5b',
      secondary: '#d8b04b',
      accent: '#ffffff',
    },
  },
  {
    id: 'green',
    name: 'Зелёная',
    icon: '🕌',
    preview: 'green',
    colors: {
      primary: '#2d8659',
      secondary: '#4a9d6e',
      accent: '#ffffff',
    },
  },
  {
    id: 'gold',
    name: 'Золотая',
    icon: '✨',
    preview: 'gold',
    colors: {
      primary: '#d8b04b',
      secondary: '#f4c430',
      accent: '#1a1a1a',
    },
  },
  {
    id: 'blue',
    name: 'Синяя',
    icon: '🌊',
    preview: 'blue',
    colors: {
      primary: '#2563eb',
      secondary: '#3b82f6',
      accent: '#ffffff',
    },
  },
  {
    id: 'purple',
    name: 'Фиолетовая',
    icon: '🔮',
    preview: 'purple',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#ffffff',
    },
  },
];

export const useAppearanceStore = defineStore('appearance', () => {
  const themes = ref<Theme[]>(DEFAULT_THEMES);
  const selectedThemeId = ref<string>('default');
  const selectedWallpaper = ref<SelectedWallpaper | null>(null);
  const userImages = ref<string[]>([]); // base64 strings

  const selectedTheme = computed(() => {
    return themes.value.find((t) => t.id === selectedThemeId.value) || themes.value[0];
  });

  const currentWallpaperStyle = computed(() => {
    if (!selectedWallpaper.value) {
      return { background: 'url(../../assets/bg.jpg) center / cover no-repeat' };
    }

    const { type, value } = selectedWallpaper.value;

    if (type === 'gradient' || type === 'dynamic') {
      return { background: value };
    }

    if (type === 'image' || type === 'user-image') {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    return { background: 'url(../../assets/bg.jpg) center / cover no-repeat' };
  });

  function setTheme(themeId: string) {
    selectedThemeId.value = themeId;
    localStorage.setItem('selectedTheme', themeId);
    applyTheme();
  }

  function setWallpaper(type: WallpaperType, value: string) {
    selectedWallpaper.value = { type, value };
    localStorage.setItem('selectedWallpaper', JSON.stringify(selectedWallpaper.value));
  }

  function addUserImage(base64: string) {
    userImages.value.push(base64);
    localStorage.setItem('userImages', JSON.stringify(userImages.value));
  }

  function removeUserImage(index: number) {
    userImages.value.splice(index, 1);
    localStorage.setItem('userImages', JSON.stringify(userImages.value));

    // Если удаляемое изображение было выбрано, сбросить выбор
    if (selectedWallpaper.value?.type === 'user-image' && selectedWallpaper.value.value === userImages.value[index]) {
      selectedWallpaper.value = null;
      localStorage.removeItem('selectedWallpaper');
    }
  }

  function applyTheme() {
    const theme = selectedTheme.value;
    if (!theme) return;
    if (theme && typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--theme-primary', theme.colors.primary);
      root.style.setProperty('--theme-secondary', theme.colors.secondary);
      root.style.setProperty('--theme-accent', theme.colors.accent);
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('selectedTheme');
      if (stored && themes.value.find((t) => t.id === stored)) {
        selectedThemeId.value = stored;
      }
      applyTheme();

      const storedWallpaper = localStorage.getItem('selectedWallpaper');
      if (storedWallpaper) {
        selectedWallpaper.value = JSON.parse(storedWallpaper);
      }

      const storedUserImages = localStorage.getItem('userImages');
      if (storedUserImages) {
        userImages.value = JSON.parse(storedUserImages);
      }
    } catch (err) {
      console.error('Failed to load appearance from storage:', err);
    }
  }

  return {
    themes,
    selectedThemeId,
    selectedTheme,
    selectedWallpaper,
    userImages,
    currentWallpaperStyle,
    setTheme,
    setWallpaper,
    addUserImage,
    removeUserImage,
    loadFromStorage,
  };
});
