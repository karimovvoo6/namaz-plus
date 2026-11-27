import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PrayerName } from './prayerStore';
import { i18n } from '../i18n';

const { t } = i18n.global;

export interface PrayerNotificationSettings {
  enabled: boolean;
  sound: string;
  timeOffset: number; // минуты
}

export interface NotificationSettings {
  enabled: boolean;
  showRakaatCount: boolean;
  prayers: Record<PrayerName, PrayerNotificationSettings>;
}

const DEFAULT_SOUNDS = [
  { id: 'azan_makkah', name: computed(() => t('notifications.azan_makkah')), url: '/audio/azan_makkah.mp3' },
  { id: 'azan_madinah', name: computed(() => t('notifications.azan_madinah')), url: '/audio/azan_madinah.mp3' },
  { id: 'azan_alafasy', name: computed(() => t('notifications.azan_alafasy')), url: '/audio/azan_alafasy.mp3' },
  { id: 'bismillah', name: computed(() => t('notifications.bismillah')), url: '/audio/bismillah.mp3' },
  { id: 'none', name: computed(() => t('notifications.none')), url: '' },
];

export const useNotificationStore = defineStore('notification', () => {
  const settings = ref<NotificationSettings>({
    enabled: true,
    showRakaatCount: true,
    prayers: {
      fajr: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
      dhuhr: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
      asr: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
      maghrib: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
      isha: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
      tahajjud: { enabled: true, sound: 'azan_makkah', timeOffset: 0 },
    },
  });

  const sounds = ref(DEFAULT_SOUNDS);

  const isEnabled = computed(() => settings.value.enabled);

  function toggleNotifications(enabled: boolean) {
    settings.value.enabled = enabled;
    saveToStorage();
  }

  function toggleRakaatCount(enabled: boolean) {
    settings.value.showRakaatCount = enabled;
    saveToStorage();
  }

  function setPrayerSound(prayer: PrayerName, sound: string) {
    if (settings.value.prayers[prayer]) {
      settings.value.prayers[prayer].sound = sound;
      saveToStorage();
    }
  }

  function setPrayerEnabled(prayer: PrayerName, enabled: boolean) {
    if (settings.value.prayers[prayer]) {
      settings.value.prayers[prayer].enabled = enabled;
      saveToStorage();
    }
  }

  function setPrayerTimeOffset(prayer: PrayerName, offset: number) {
    if (settings.value.prayers[prayer]) {
      settings.value.prayers[prayer].timeOffset = offset;
      saveToStorage();
    }
  }

  function getPrayerSettings(prayer: PrayerName): PrayerNotificationSettings {
    return settings.value.prayers[prayer] || {
      enabled: true,
      sound: 'azan_makkah',
      timeOffset: 0,
    };
  }

  function getSoundUrl(soundId: string): string {
    const sound = DEFAULT_SOUNDS.find(s => s.id === soundId);
    return sound?.url || '';
  }

  function isPrayerSoundEnabled(prayer: PrayerName): boolean {
    const prayerSettings = getPrayerSettings(prayer);
    return prayerSettings.enabled && prayerSettings.sound !== 'none';
  }

  function saveToStorage() {
    localStorage.setItem('notificationSettings', JSON.stringify(settings.value));
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('notificationSettings');
      if (stored) {
        const parsed = JSON.parse(stored);
        settings.value = { ...settings.value, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load notification settings from storage:', err);
    }
  }

  return {
    settings,
    sounds,
    isEnabled,
    toggleNotifications,
    toggleRakaatCount,
    setPrayerSound,
    setPrayerEnabled,
    setPrayerTimeOffset,
    getPrayerSettings,
    getSoundUrl,
    isPrayerSoundEnabled,
    loadFromStorage,
  };
});
