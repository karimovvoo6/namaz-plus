<template>
  <div class="calendar-view">
    <div class="bg" :style="themeStore.backgroundStyle" />

    <div class="content">
      <div class="top-bar">
        <button class="back-btn" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="title">{{ $t('calendar.title') }}</div>
        <div style="width: 40px"></div>
      </div>

      <div class="calendar-content">
        <div class="today-section">
          <div class="date-card">
            <div class="gregorian-date">
              {{ gregorianDate }}
            </div>
            <div class="hijri-date">{{ hijriDate }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeStore } from '../../stores/themeStore';

const router = useRouter();
const { t } = useI18n();
const settingsStore = useSettingsStore();
const themeStore = useThemeStore();

const now = ref(new Date());

const gregorianDate = computed(() => {
  return new Intl.DateTimeFormat(
    settingsStore.language === 'tj' ? 'tg-TJ' : settingsStore.language,
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ).format(now.value);
});

const hijriDate = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(now.value);
  } catch (err) {
    return t('calendar.hijriFallback');
  }
});

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});
</script>

<style scoped>
.calendar-view {
  position: absolute;
  inset: 0;
  z-index: 50;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
  background: rgba(20, 30, 35, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: max(16px, env(safe-area-inset-top));
  gap: 12px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.title {
  flex: 1;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.calendar-content {
  flex: 1;
  overflow: auto;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.today-section {
  display: flex;
  justify-content: center;
}

.date-card {
  width: 100%;
  max-width: 600px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  text-align: center;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.gregorian-date {
  font-size: 20px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 12px;
  line-height: 1.4;
}

.hijri-date {
  font-size: 18px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  direction: rtl;
  line-height: 1.4;
}
</style>
