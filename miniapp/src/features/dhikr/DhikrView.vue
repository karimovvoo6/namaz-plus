<template>
  <div class="dhikr-view">
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
        <div class="title">{{ $t('dhikr.title') }}</div>
        <div style="width: 40px" />
      </div>

      <div class="dhikr-sets">
        <button
          v-for="set in localizedDhikrSets"
          :key="set.id"
          class="dhikr-set-card"
          @click="openCounter(set)"
        >
          <div class="set-icon">{{ set.icon }}</div>
          <div class="set-content">
            <div class="set-name">{{ set.name }}</div>
            <div class="set-description">{{ set.description }}</div>
            <div class="set-progress">
              {{ getProgress(set.id) }} / {{ getTarget(set.id, set.target) }}
            </div>
          </div>
          <div class="set-arrow">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDhikrStore } from '../../stores/dhikrStore';
import type { DhikrSet } from '../../stores/dhikrStore';
import { useThemeStore } from '../../stores/themeStore';

const router = useRouter();
const { t } = useI18n();
const dhikrStore = useDhikrStore();
const themeStore = useThemeStore();

const localizedDhikrSets = computed(() => [
  {
    id: 'subhanallah',
    name: t('dhikr.subhanallah'),
    description: t('dhikr.subhanallah_desc'),
    target: 33,
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhanallah',
    icon: '🕋',
  },
  {
    id: 'alhamdulillah',
    name: t('dhikr.alhamdulillah'),
    description: t('dhikr.alhamdulillah_desc'),
    target: 33,
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    icon: '📿',
  },
  {
    id: 'allahu-akbar',
    name: t('dhikr.allahu_akbar'),
    description: t('dhikr.allahu_akbar_desc'),
    target: 34,
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    icon: '🕌',
  },
  {
    id: 'custom',
    name: t('dhikr.custom'),
    description: t('dhikr.custom_desc'),
    target: 100,
    icon: '✨',
  },
]);

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function getProgress(setId: string): number {
  const session = dhikrStore.sessions[setId];
  return session?.current || 0;
}

function getTarget(setId: string, defaultTarget: number): number {
  const session = dhikrStore.sessions[setId];
  return session?.target || defaultTarget;
}

function openCounter(set: DhikrSet) {
  router.push(`/dhikr/${set.id}`);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}
</script>

<style scoped>
.dhikr-view {
  position: fixed;
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
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.dhikr-sets {
  flex: 1;
  overflow: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dhikr-set-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.dhikr-set-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateX(4px);
}

.set-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.set-content {
  flex: 1;
  min-width: 0;
}

.set-name {
  font-size: 18px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 6px;
}

.set-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.set-progress {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
}

.set-arrow {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
</style>
