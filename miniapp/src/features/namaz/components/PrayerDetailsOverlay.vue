<template>
  <div class="prayer-details-overlay">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <div class="sheet-handle" />
      
      <div class="content">
        <div class="prayer-header">
          <div class="prayer-name">{{ prayerDisplayName }}</div>
          <div class="prayer-time">{{ prayerTime }}</div>
        </div>

        <div class="prayer-info">
          <div class="info-row">
            <div class="info-label">{{ $t('prayerDetails.startTime') }}</div>
            <div class="info-value">{{ startTime }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">{{ $t('prayerDetails.endTime') }}</div>
            <div class="info-value">{{ endTime }}</div>
          </div>
          <div class="info-row">
            <div class="info-label">{{ $t('prayerDetails.timeLeft') }}</div>
            <div class="info-value">{{ timeLeft }}</div>
          </div>
        </div>

        <SettingsCard>
          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('prayerDetails.sound') }}</div>
              <div class="toggle-subtitle">{{ $t('prayerDetails.soundHint') }}</div>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="isSoundEnabled"
                @change="handleToggleSound"
              />
              <span class="slider" />
            </label>
          </div>
          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('prayerDetails.notifications') }}</div>
              <div class="toggle-subtitle">{{ $t('prayerDetails.notificationsHint') }}</div>
            </div>
            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="areNotificationsEnabled"
                @change="handleToggleNotifications"
              />
              <span class="slider" />
            </label>
          </div>
        </SettingsCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePrayerSettingsStore } from '../../../stores/prayerSettingsStore';
import type { PrayerName } from '../../../stores/prayerStore';
import SettingsCard from '../../profile/components/SettingsCard.vue';

const props = defineProps<{
  prayer: PrayerName;
  prayerTime: string; // HH:MM
}>();

const emit = defineEmits<{
  close: [];
}>();

const { t } = useI18n();
const prayerSettingsStore = usePrayerSettingsStore();

const now = ref(new Date());
let intervalId: number | null = null;

const prayerDisplayName = computed(() => {
  return t(`prayers.${props.prayer}`);
});

const isSoundEnabled = computed(() => {
  return prayerSettingsStore.isSoundEnabled(props.prayer);
});

const areNotificationsEnabled = computed(() => {
  return prayerSettingsStore.areNotificationsEnabled(props.prayer);
});

const startTime = computed(() => {
  return props.prayerTime;
});

const endTime = computed(() => {
  if (!props.prayerTime) return '--:--';
  // Вычисляем время окончания намаза (примерно через 5-10 минут)
  const [hStr, mStr] = props.prayerTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  
  const end = new Date();
  end.setHours(h, m + 5, 0, 0);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
});

const timeLeft = computed(() => {
  if (!props.prayerTime) return '';
  const [hStr, mStr] = props.prayerTime.split(':');
  const h = Number(hStr);
  const m = Number(mStr);

  const prayerDate = new Date();
  prayerDate.setHours(h, m + 5, 0, 0); // +5 минут для окончания
  
  const diff = Math.max(0, Math.floor((prayerDate.getTime() - now.value.getTime()) / 1000));
  
  if (diff === 0) {
    return t('prayerDetails.ended');
  }
  
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  if (hours > 0) {
    return `${hours}ч ${minutes}м`;
  }
  if (minutes > 0) {
    return `${minutes}м ${seconds}с`;
  }
  return `${seconds}с`;
});

function close() {
  emit('close');
}

function handleToggleSound(event: Event) {
  const target = event.target as HTMLInputElement;
  prayerSettingsStore.setPrayerSound(props.prayer, target.checked);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function handleToggleNotifications(event: Event) {
  const target = event.target as HTMLInputElement;
  prayerSettingsStore.setPrayerNotifications(props.prayer, target.checked);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

onMounted(() => {
  intervalId = window.setInterval(() => {
    now.value = new Date();
  }, 1000);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});

onUnmounted(() => {
  if (intervalId) window.clearInterval(intervalId);
});
</script>

<style scoped>
.prayer-details-overlay {
  position: absolute;
  inset: 0;
  z-index: 60;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 80vh;
  background: rgba(20, 30, 35, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  padding: 12px 16px max(16px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 8px;
}

.content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.prayer-header {
  text-align: center;
  padding: 8px 0;
}

.prayer-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
}

.prayer-time {
  color: rgba(255, 255, 255, 0.7);
  font-size: 18px;
  font-weight: 600;
}

.prayer-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.info-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
}

.info-value {
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: 700;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 16px;
}

.toggle-row:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.toggle-label {
  flex: 1;
  min-width: 0;
}

.toggle-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
}

.toggle-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  line-height: 1.4;
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
</style>
