import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { i18n } from '@/i18n';

export type Language = 'ru' | 'tj' | 'en';
export type PrayerTimesSource = 'shuroiulamo' | 'aladhan';

export interface PrayerSettings {
  calculationMethod: string;
  madhab: string;
}

const STORAGE_KEYS = {
  language: 'language',
  prayerSettings: 'prayerSettings',
  prayerTimesSource: 'prayerTimesSource',
  tahajjudEnabled: 'tahajjudEnabled',
} as const;

export const useSettingsStore = defineStore('settings', () => {
  /* =======================
     STATE
  ======================= */
  const language = ref<Language>('ru');

  const prayerSettings = ref<PrayerSettings>({
    calculationMethod: 'MWL',
    madhab: 'hanafi',
  });

  const prayerTimesSource = ref<PrayerTimesSource>('shuroiulamo');
  const tahajjudEnabled = ref<boolean>(false);

  /* =======================
     COMPUTED
  ======================= */
  const languageName = computed(() => {
    const names: Record<Language, string> = {
      ru: 'Русский',
      tj: 'Тоҷикӣ',
      en: 'English',
    };
    return names[language.value];
  });

  /* =======================
     ACTIONS
  ======================= */
  function setLanguage(lang: Language) {
    language.value = lang;

    // 🔴 САМОЕ ВАЖНОЕ — синхронизация с vue-i18n
    i18n.global.locale.value = lang;

    localStorage.setItem(STORAGE_KEYS.language, lang);
  }

  function setPrayerSettings(settings: Partial<PrayerSettings>) {
    prayerSettings.value = { ...prayerSettings.value, ...settings };
    localStorage.setItem(
      STORAGE_KEYS.prayerSettings,
      JSON.stringify(prayerSettings.value)
    );
  }

  function setPrayerTimesSource(source: PrayerTimesSource) {
    prayerTimesSource.value = source;
    localStorage.setItem(STORAGE_KEYS.prayerTimesSource, source);
  }

  function setTahajjudEnabled(enabled: boolean) {
    tahajjudEnabled.value = enabled;
    localStorage.setItem(STORAGE_KEYS.tahajjudEnabled, String(enabled));
  }

  function loadFromStorage() {
    try {
      /* ===== Language ===== */
      const storedLang = localStorage.getItem(STORAGE_KEYS.language) as Language | null;
      if (storedLang && ['ru', 'tj', 'en'].includes(storedLang)) {
        language.value = storedLang;
        i18n.global.locale.value = storedLang; // 🔴 обязательно
      } else {
        i18n.global.locale.value = language.value;
      }

      /* ===== Prayer settings ===== */
      const storedPrayer = localStorage.getItem(STORAGE_KEYS.prayerSettings);
      if (storedPrayer) {
        prayerSettings.value = JSON.parse(storedPrayer);
      }

      /* ===== Source ===== */
      const storedSource = localStorage.getItem(STORAGE_KEYS.prayerTimesSource);
      if (storedSource === 'shuroiulamo' || storedSource === 'aladhan') {
        prayerTimesSource.value = storedSource;
      }

      /* ===== Tahajjud ===== */
      const storedTah = localStorage.getItem(STORAGE_KEYS.tahajjudEnabled);
      if (storedTah === 'true' || storedTah === 'false') {
        tahajjudEnabled.value = storedTah === 'true';
      }
    } catch (err) {
      console.error('Failed to load settings from storage:', err);
    }
  }

  async function syncWithBackend(telegramId: number) {
    try {
      const BOT_API_BASE = import.meta.env.VITE_BOT_API_BASE;
      if (!BOT_API_BASE || BOT_API_BASE === 'http://localhost:8080') {
        return; // Автономный режим без бэкенда
      }
      const base = BOT_API_BASE === '/api' ? '' : BOT_API_BASE;
      const body = {
        language: language.value,
        prayer_times_source: prayerTimesSource.value,
        tahajjud_enabled: tahajjudEnabled.value,
        calculation_method: prayerSettings.value.calculationMethod,
        madhab: prayerSettings.value.madhab,
      };

      const res = await fetch(`${base}/api/user/${telegramId}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) console.error('Failed to sync settings with backend:', res.status);
    } catch (err) {
      console.warn('Error syncing settings (standalone mode):', err);
    }
  }

  /* =======================
     EXPORT
  ======================= */

  return {
    // state
    language,
    prayerSettings,
    prayerTimesSource,
    tahajjudEnabled,

    // computed
    languageName,

    // actions
    setLanguage,
    setPrayerSettings,
    setPrayerTimesSource,
    setTahajjudEnabled,
    loadFromStorage,
    syncWithBackend,
  };
});

