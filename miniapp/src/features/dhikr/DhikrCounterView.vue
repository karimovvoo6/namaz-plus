<template>
  <div class="dhikr-counter-view">
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
        <div class="title">{{ currentSet?.name || $t('dhikr.title') }}</div>
        <button class="settings-btn" @click="showSettings = true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
            <path
              d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24"
              stroke="currentColor"
              stroke-width="2"
            />
          </svg>
        </button>
      </div>

      <div class="counter-section">
        <div class="counter-display">
          <div class="counter-number">{{ session.current }}</div>
          <div class="counter-target">/ {{ session.target }}</div>
        </div>
        
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(session.current / session.target) * 100}%` }"
          />
        </div>

        <div v-if="currentSet?.arabic" class="arabic-text">{{ currentSet.arabic }}</div>
        <div v-if="currentSet?.transliteration" class="transliteration-text">
          {{ currentSet.transliteration }}
        </div>

        <button class="increment-btn" @click="increment">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              stroke-width="3"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <div class="counter-actions">
          <button class="action-btn" @click="reset">{{ $t('dhikr.reset') }}</button>
        </div>
      </div>
    </div>

    <!-- Settings Sheet -->
    <BottomSheet v-model="showSettings" @close="showSettings = false" :title="$t('profile.title')">
      <div class="settings-content">
        <div class="setting-row">
          <div class="setting-label">{{ $t('dhikr.target') }}</div>
          <input
            v-model.number="newTarget"
            type="number"
            min="1"
            max="1000"
            class="setting-input"
            @change="updateTarget"
          />
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDhikrStore } from '../../stores/dhikrStore';
import BottomSheet from '../../ui/BottomSheet.vue';
import { useThemeStore } from '../../stores/themeStore';

const router = useRouter();
const route = useRoute();
const dhikrStore = useDhikrStore();
const { t } = useI18n();
const themeStore = useThemeStore();

const showSettings = ref(false);
const newTarget = ref(33);

const setId = computed(() => route.params.id as string);

const localizedDhikrSets = computed(() => ({
  subhanallah: {
    name: t('dhikr.subhanallah'),
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'Subhanallah',
    target: 33,
  },
  'alhamdulillah': {
    name: t('dhikr.alhamdulillah'),
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    target: 33,
  },
  'allahu-akbar': {
    name: t('dhikr.allahu_akbar'),
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    target: 34,
  },
  custom: {
    name: t('dhikr.custom'),
    target: 100,
  },
}));

const currentSet = computed(() => (localizedDhikrSets.value as any)[setId.value] || localizedDhikrSets.value.custom);

const session = computed(() => {
  const target = currentSet.value?.target || 33;
  return dhikrStore.getSession(setId.value, target);
});

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/dhikr');
}

function increment() {
  dhikrStore.increment(setId.value);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  }
}

function reset() {
  dhikrStore.reset(setId.value);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function updateTarget() {
  if (newTarget.value > 0 && newTarget.value <= 1000) {
    dhikrStore.setTarget(setId.value, newTarget.value);
    showSettings.value = false;
  }
}

onMounted(() => {
  newTarget.value = session.value.target;
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});
</script>

<style scoped>
.dhikr-counter-view {
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
}

.back-btn,
.settings-btn {
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

.back-btn:hover,
.settings-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 18px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.counter-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 40px 20px;
}

.counter-display {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.counter-number {
  font-size: 96px;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.counter-target {
  font-size: 48px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.6);
}

.progress-bar {
  width: 100%;
  max-width: 600px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1f8a5b 0%, #2d8659 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.arabic-text {
  font-size: 36px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  direction: rtl;
  text-align: center;
  margin-top: 16px;
}

.transliteration-text {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8px;
}

.increment-btn {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(31, 138, 91, 0.3);
  border: 3px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 24px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.increment-btn:hover {
  background: rgba(31, 138, 91, 0.4);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.05);
}

.increment-btn:active {
  transform: scale(0.95);
}

.counter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.action-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.settings-content {
  padding: 20px 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 16px;
}

.setting-label {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
}

.setting-input {
  width: 100px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  outline: none;
}
</style>
