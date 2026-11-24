import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export const useProfileStore = defineStore('profile', () => {
  const user = ref<TelegramUser | null>(null);
  const isAuthenticated = computed(() => user.value !== null);

  function login(telegramUser: TelegramUser) {
    user.value = telegramUser;
    localStorage.setItem('user', JSON.stringify(telegramUser));
  }

  function logout() {
    user.value = null;
    localStorage.removeItem('user');
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        user.value = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load user from storage:', err);
    }
  }

  async function loginWithTelegram() {
    if (!window.Telegram?.WebApp) {
      throw new Error('Telegram WebApp not available');
    }

    const initData = window.Telegram.WebApp.initDataUnsafe;

    if (!initData.user) {
      throw new Error('User data not available');
    }

    const telegramUser: TelegramUser = {
      id: initData.user.id,
      first_name: initData.user.first_name,
      last_name: initData.user.last_name,
      username: initData.user.username,
      language_code: initData.user.language_code,
      is_premium: initData.user.is_premium,
      // @ts-ignore - photo_url exists in WebAppUser but might be missing in types
      photo_url: initData.user.photo_url,
    };

    login(telegramUser);
    return telegramUser;
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    loadFromStorage,
    loginWithTelegram,
  };
});
