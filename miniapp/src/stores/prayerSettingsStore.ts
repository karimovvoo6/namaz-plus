import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { PrayerName } from './prayerStore';

export interface IndividualPrayerSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
}

export const usePrayerSettingsStore = defineStore('prayerSettings', () => {
  const prayerSettings = ref<Record<PrayerName, IndividualPrayerSettings>>({
    fajr: { soundEnabled: true, notificationsEnabled: true },
    dhuhr: { soundEnabled: true, notificationsEnabled: true },
    asr: { soundEnabled: true, notificationsEnabled: true },
    maghrib: { soundEnabled: true, notificationsEnabled: true },
    isha: { soundEnabled: true, notificationsEnabled: true },
    tahajjud: { soundEnabled: true, notificationsEnabled: true },
  });

  function setPrayerSound(prayer: PrayerName, enabled: boolean) {
    if (prayerSettings.value[prayer]) {
      prayerSettings.value[prayer].soundEnabled = enabled;
      saveToStorage();
    }
  }

  function setPrayerNotifications(prayer: PrayerName, enabled: boolean) {
    if (prayerSettings.value[prayer]) {
      prayerSettings.value[prayer].notificationsEnabled = enabled;
      saveToStorage();
    }
  }

  function getPrayerSettings(prayer: PrayerName): IndividualPrayerSettings {
    return prayerSettings.value[prayer] || {
      soundEnabled: true,
      notificationsEnabled: true,
    };
  }

  function isSoundEnabled(prayer: PrayerName): boolean {
    return getPrayerSettings(prayer).soundEnabled;
  }

  function areNotificationsEnabled(prayer: PrayerName): boolean {
    return getPrayerSettings(prayer).notificationsEnabled;
  }

  function saveToStorage() {
    localStorage.setItem('prayerSettings', JSON.stringify(prayerSettings.value));
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('prayerSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        prayerSettings.value = { ...prayerSettings.value, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load prayer settings from storage:', err);
    }
  }

  return {
    prayerSettings,
    setPrayerSound,
    setPrayerNotifications,
    getPrayerSettings,
    isSoundEnabled,
    areNotificationsEnabled,
    loadFromStorage,
  };
});
