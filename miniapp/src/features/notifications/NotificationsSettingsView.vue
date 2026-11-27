<template>
  <div class="notifications-settings">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('notifications.title') }}</div>
        <button class="closeBtn" @click="close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>

      <div class="content">
        <!-- Главный toggle -->
        <SettingsCard>
          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('notifications.enabled') }}</div>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="notificationStore.isEnabled"
                @change="handleToggleNotifications"
              />
              <span class="slider" />
            </label>
          </div>
        </SettingsCard>

        <!-- Настройки для каждого намаза -->
        <SettingsCard v-for="prayer in (['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud'] as const)" :key="prayer">
          <div class="prayer-section-header">
            <div class="section-title">{{ $t(`prayers.${prayer}`) }}</div>
            <label class="toggle-switch mini">
              <input
                type="checkbox"
                :checked="notificationStore.getPrayerSettings(prayer).enabled"
                @change="(e) => handleTogglePrayer(prayer, (e.target as HTMLInputElement).checked)"
              />
              <span class="slider" />
            </label>
          </div>
          
          <div class="prayer-controls" :class="{ disabled: !notificationStore.getPrayerSettings(prayer).enabled || !isOnline }">
            <SettingsRow
              icon="bell"
              :title="$t('notifications.sound')"
              :value="getCurrentSoundName(prayer)"
              @click="openSoundPicker(prayer)"
            />
            <SettingsRow
              icon="bell"
              :title="$t('notifications.timeOffset')"
              :value="`${getTimeOffset(prayer)} ${$t('notifications.minutes')}`"
              @click="openOffsetPicker(prayer)"
            />
          </div>
        </SettingsCard>

        <!-- Другие настройки -->
        <SettingsCard>
          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('notifications.rakaatCount') }}</div>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="notificationStore.settings.showRakaatCount"
                @change="handleToggleRakaatCount"
              />
              <span class="slider" />
            </label>
          </div>
          <SettingsRow
            icon="info"
            :title="$t('notifications.troubleshooting')"
            :subtitle="$t('notifications.troubleshootingHint')"
            @click="handleTroubleshooting"
          />
        </SettingsCard>

        <!-- Sound Picker -->
        <div v-if="showSoundPicker" class="picker-overlay" @click="closePicker">
          <div class="picker" @click.stop>
            <div class="picker-title">
              {{ $t('notifications.sound') }}: {{ $t(`prayers.${editingPrayer}`) }}
            </div>
            <div class="picker-options">
              <div
                v-for="sound in notificationStore.sounds"
                :key="sound.id"
                class="sound-row-item"
              >
                <button
                  type="button"
                  class="picker-option sound-select-btn"
                  :class="{ active: editingPrayer && getCurrentSound(editingPrayer) === sound.id }"
                  @click="selectSound(sound.id)"
                >
                  {{ sound.name }}
                </button>
                <button
                  v-if="sound.url"
                  type="button"
                  class="sound-preview-btn"
                  :class="{ active: currentPlayingId === sound.id }"
                  @click.stop="togglePlaySound(sound)"
                  :aria-label="currentPlayingId === sound.id ? 'Стоп' : 'Слушать'"
                >
                  {{ currentPlayingId === sound.id ? '⏹' : '▶' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Offset Picker -->
        <div v-if="showTimeOffsetPicker" class="picker-overlay" @click="closePicker">
          <div class="picker" @click.stop>
            <div class="picker-title">
              {{ $t('notifications.timeOffset') }}: {{ $t(`prayers.${editingPrayer}`) }}
            </div>
            <div class="picker-options">
              <button
                v-for="offset in [-30, -15, -10, -5, 0, 5, 10, 15, 30]"
                :key="offset"
                class="picker-option"
                :class="{ active: editingPrayer && getTimeOffset(editingPrayer) === offset }"
                @click="selectTimeOffset(offset)"
              >
                {{ offset > 0 ? '+' : '' }}{{ offset }} {{ $t('notifications.minutes') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNotificationStore } from '../../stores/notificationStore';
import type { PrayerName } from '../../stores/prayerStore';
import SettingsCard from '../profile/components/SettingsCard.vue';
import SettingsRow from '../profile/components/SettingsRow.vue';

const router = useRouter();
const { t } = useI18n();
const notificationStore = useNotificationStore();

const showSoundPicker = ref(false);
const showTimeOffsetPicker = ref(false);
const editingPrayer = ref<PrayerName | null>(null);
const isOnline = ref(navigator.onLine);
let previewAudio: HTMLAudioElement | null = null;

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
  if (!isOnline.value) {
    stopPreview();
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  stopPreview();
});

function close() {
  stopPreview();
  if (window.history.length > 1) router.back();
  else router.push('/profile');
}

function handleToggleNotifications(event: Event) {
  const target = event.target as HTMLInputElement;
  notificationStore.toggleNotifications(target.checked);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function handleTogglePrayer(prayer: PrayerName, enabled: boolean) {
  notificationStore.setPrayerEnabled(prayer, enabled);
  if (!enabled && previewAudio) {
    stopPreview();
  }
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

const currentPlayingId = ref<string | null>(null);

function stopPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio.currentTime = 0;
    previewAudio = null;
  }
  currentPlayingId.value = null;
}

function togglePlaySound(sound: { id: string; url: string }) {
  if (currentPlayingId.value === sound.id) {
    stopPreview();
    return;
  }

  stopPreview();

  if (!sound.url) return;

  try {
    previewAudio = new Audio(sound.url);
    previewAudio.loop = false;
    currentPlayingId.value = sound.id;
    previewAudio.play().catch((e: Error) => {
      console.warn('Failed to play preview', e);
      stopPreview();
    });
    previewAudio.onended = () => {
      stopPreview();
    };
  } catch (err) {
    stopPreview();
  }
}

function handleToggleRakaatCount(event: Event) {
  const target = event.target as HTMLInputElement;
  notificationStore.toggleRakaatCount(target.checked);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function openSoundPicker(prayer: PrayerName) {
  if (!notificationStore.getPrayerSettings(prayer).enabled) return;
  if (!isOnline.value) {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(t('common.offline_message'));
    }
    return;
  }
  editingPrayer.value = prayer;
  showSoundPicker.value = true;
}

function openOffsetPicker(prayer: PrayerName) {
  if (!notificationStore.getPrayerSettings(prayer).enabled) return;
  editingPrayer.value = prayer;
  showTimeOffsetPicker.value = true;
}

function getCurrentSound(prayer: PrayerName) {
  return notificationStore.getPrayerSettings(prayer).sound;
}

function getCurrentSoundName(prayer: PrayerName) {
  const soundId = getCurrentSound(prayer);
  const sound = notificationStore.sounds.find((s) => s.id === soundId);
  return sound?.name || soundId;
}

function getTimeOffset(prayer: PrayerName) {
  return notificationStore.getPrayerSettings(prayer).timeOffset;
}

function selectSound(soundId: string) {
  if (editingPrayer.value) {
    notificationStore.setPrayerSound(editingPrayer.value, soundId);
  }
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function closePicker() {
  stopPreview();
  showSoundPicker.value = false;
  showTimeOffsetPicker.value = false;
}

function selectTimeOffset(offset: number) {
  if (editingPrayer.value) {
    notificationStore.setPrayerTimeOffset(editingPrayer.value, offset);
  }
  showTimeOffsetPicker.value = false;
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function handleTroubleshooting() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    window.Telegram.WebApp.showAlert(t('notifications.troubleshootingHint'));
  }
}
</script>

<style scoped>
.notifications-settings {
  position: absolute;
  inset: 0;
  z-index: 50;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sheet {
  position: absolute;
  inset: 0;
  padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #141e23f2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px;
}

.title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.closeBtn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.prayer-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.prayer-section-header .section-title {
  border-bottom: none;
}

.prayer-controls {
  transition: opacity 0.3s ease;
}

.prayer-controls.disabled {
  opacity: 0.4;
  pointer-events: none;
}

.toggle-switch.mini {
  width: 44px;
  height: 24px;
}

.toggle-switch.mini .slider:before {
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
}

.toggle-switch.mini input:checked + .slider:before {
  transform: translateX(20px);
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
}

.toggle-label {
  flex: 1;
}

.toggle-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 30px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1f8a5b;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

.picker-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  z-index: 10;
}

.picker {
  width: 90%;
  max-width: 600px;
  max-height: 70vh;
  background: rgba(20, 30, 35, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.picker-title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 16px;
  text-align: center;
}

.picker-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 50vh;
  overflow: auto;
}

.picker-option {
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
}

.picker-option:hover {
  background: rgba(255, 255, 255, 0.12);
}

.picker-option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.sound-row-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sound-select-btn {
  flex: 1;
}

.sound-preview-btn {
  width: 46px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #6ee7b7;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sound-preview-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: scale(1.04);
}

.sound-preview-btn.active {
  background: #1f8a5b;
  color: #fff;
  border-color: #1f8a5b;
  box-shadow: 0 0 10px rgba(31, 138, 91, 0.5);
}
</style>
