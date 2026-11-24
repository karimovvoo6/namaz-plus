<template>
  <div class="bg" :style="wallpaperStyle" @click.self="toggleMode">
    <TopBar
      :locationText="locationText"
      :hijriText="hijriText"
      :localTime="localTime"
      :makkahTime="makkahTime"
      @profileClick="openProfile"
      @locationClick="openLocation"
    />


    <div class="overlay">
      <Transition name="swap" mode="out-in" appear>
        <HudView
          v-if="isHud"
          :next-prayer="nextPrayer"
          :timer="timer"
          :show-next="showWidgetsNextPrayer"
          :show-timer="showWidgetsTimer"
          @click.stop
        />
        <PrayerCard
          v-else
          :list="list"
          :next-prayer="nextPrayer"
          :timer="timer"
          :now="now"
          :show-next="showWidgetsNextPrayer"
          :show-timer="showWidgetsTimer"
          @click.stop
        />
      </Transition>
    </div>

    <BottomBar
      v-if="!selectedPrayer && !showMenu"
      @compass-click="handleCompassClick"
      @menu-click="handleMenuClick"
      @quran-click="handleQuranClick"
    />



    <MenuSheet v-model="showMenu" @close="showMenu = false" />

    <PrayerDetailsOverlay
      v-if="selectedPrayer"
      :prayer="selectedPrayer.name"
      :prayer-time="selectedPrayer.at"
      @close="prayerStore.selectPrayer(null)"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

import type { CSSProperties } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

import TopBar from './components/TopBar.vue';
import BottomBar from './components/BottomBar.vue';
import HudView from './components/HudView.vue';
import PrayerCard from './components/PrayerCard.vue';
import MenuSheet from './components/MenuSheet.vue';
import PrayerDetailsOverlay from './components/PrayerDetailsOverlay.vue';

import { useLocationStore } from '../../stores/locationStore';
import { usePrayerStore } from '../../stores/prayerStore';
import { useWidgetsStore } from '../../stores/widgetsStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeStore } from '../../stores/themeStore';

import type { NextPrayer } from '../../stores/prayerStore';

const router = useRouter();
const { t } = useI18n();

const locationStore = useLocationStore();
const prayerStore = usePrayerStore();
const { selectedPrayer } = storeToRefs(prayerStore);
const settingsStore = useSettingsStore();

const themeStore = useThemeStore();
const widgetsStore = useWidgetsStore();

/* ===== режимы ===== */
const isHud = ref(false);
const showMenu = ref(false);

const showWidgetsNextPrayer = computed(() => widgetsStore.isWidgetEnabled('next-prayer'));
const showWidgetsTimer = computed(() => widgetsStore.isWidgetEnabled('timer'));

function toggleMode() {
  isHud.value = !isHud.value;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
}

/* ===== namaz data ===== */
const list = computed(() => prayerStore.prayers);

/* clock tick */
const now = ref(new Date());
let intervalId: number | null = null;

onMounted(() => {
  intervalId = window.setInterval(() => (now.value = new Date()), 1000);

  if (locationStore.currentLocation) prayerStore.updatePrayerTimes();
  else prayerStore.fetchPrayerTimes(40.2856, 69.6229); // fallback (Khujand)
});

onUnmounted(() => {
  if (intervalId) window.clearInterval(intervalId);
});

watch(() => locationStore.currentLocation, () => {
  if (locationStore.currentLocation) prayerStore.updatePrayerTimes();
});

function todayAt(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

/* текущий намаз (если есть) */
// const currentPrayer = computed<{ name: PrayerName; at: string; endTime: Date } | null>(() => {
//   if (!list.value?.length) return null;
//
//   const current = now.value.getTime();
//   const sorted = [...list.value].sort((a, b) => todayAt(a.at).getTime() - todayAt(b.at).getTime());
//
//   for (let i = 0; i < sorted.length; i++) {
//     const prayer = sorted[i]; // всегда есть
//     if (!prayer) continue;
//
//     const start = todayAt(prayer.at).getTime();
//     const next = sorted[i + 1] ?? sorted[0];
//
//     if (!next) continue; // Should not happen if list has items
//
//     const end = i === sorted.length - 1
//       ? todayAt(next.at).getTime() + 24 * 60 * 60 * 1000
//       : todayAt(next.at).getTime();
//
//     if (current >= start && current < end) return { name: prayer.name, at: prayer.at, endTime: new Date(end) };
//   }
//   return null;
// });

/* следующий намаз */
const nextPrayer = computed<NextPrayer>(() => {
  // Default value matching NextPrayer interface
  const defaultNext: NextPrayer = { name: 'fajr', at: '05:48', tomorrow: false };
  
  if (!list.value?.length) return defaultNext;

  const current = now.value.getTime();
  const sorted = [...list.value].sort((a, b) => todayAt(a.at).getTime() - todayAt(b.at).getTime());

  for (const prayer of sorted) {
    if (todayAt(prayer.at).getTime() > current) return { ...prayer, tomorrow: false };
  }

  const first = sorted[0];
  if (!first) return defaultNext;
  
  return { ...first, tomorrow: true };
});

const targetDate = computed(() => {
  if (!nextPrayer.value || !nextPrayer.value.at) return new Date();
  const d = todayAt(nextPrayer.value.at);
  if (nextPrayer.value.tomorrow) d.setDate(d.getDate() + 1);
  return d;
});

const timer = computed(() => {
  if (prayerStore.error) return '00:00:00';

  let diff = Math.floor((targetDate.value.getTime() - now.value.getTime()) / 1000);
  if (diff < 0) diff = 0;

  const hh = String(Math.floor(diff / 3600)).padStart(2, '0');
  const mm = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
  const ss = String(diff % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
});

/* ===== локация и хиджри ===== */
// const locationText = computed(() => locationStore.displayName || t('location.current'));
const locationText = computed(() => locationStore.displayName || t('location.current'));
const hijriText = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return formatter.format(now.value);
  } catch (err) {
    return t('calendar.hijriFallback');
  }
});

/* ===== время ===== */
const localTime = computed(() => new Intl.DateTimeFormat(
  settingsStore.language === 'tj' ? 'tg-TJ' : settingsStore.language,
  { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
).format(now.value));

const makkahTime = computed(() => {
  const makkahDate = new Date(now.value.toLocaleString('en-US', { timeZone: 'Asia/Riyadh' }));
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(makkahDate);
});

/* ===== обои ===== */
const wallpaperStyle = computed<CSSProperties>(() => themeStore.backgroundStyle);

/* ===== handlers ===== */
function openProfile() {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  router.push('/profile');
}
function openLocation() {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  router.push('/location');
}
function handleCompassClick() {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  router.push('/qibla');
}
function handleMenuClick() {
  showMenu.value = true;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
}
function handleQuranClick() {
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('light');
  router.push('/quran');
}


</script>

<style scoped>
.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  z-index: 0;
  overflow: hidden;
}

.overlay {
  position: absolute;
  top: max(72px, calc(env(safe-area-inset-top) + 64px));
  bottom: max(88px, calc(env(safe-area-inset-bottom) + 80px));
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  z-index: 1;
  pointer-events: none;
  overflow-y: auto;
}
.overlay > * { pointer-events: auto; }

/* swap animation — оставляй как есть */
</style>
