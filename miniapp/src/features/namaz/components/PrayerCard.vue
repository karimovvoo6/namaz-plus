<template>
  <div class="prayer-card">
    <div class="rows">
      <div
        v-for="item in list"
        :key="item.name"
        class="row-item"
        :class="{ active: isCurrent(item.name), done: isDone(item.name) }"
        @click="handlePrayerClick(item.name)"
      >
        <div class="row-left">
          <span class="status-marker">
            <template v-if="isDone(item.name)">✔</template>
            <template v-else-if="isCurrent(item.name)">⏳</template>
            <template v-else>⬜</template>
          </span>
          <span class="name">{{ prettyName(item.name) }}</span>
        </div>
        <div class="row-right">
          <span class="time">{{ item.at }}</span>
          <button
            class="sound-icon"
            :class="{ disabled: !isSoundEnabled(item.name) }"
            @click.stop="handleSoundToggle(item.name)"
            :aria-label="isSoundEnabled(item.name) ? 'Sound enabled' : 'Sound disabled'"
          >
            <svg v-if="isSoundEnabled(item.name)" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div class="next-bar" v-if="showNext || showTimer">
      <span v-if="showNext" class="next-name">{{ prettyName(nextPrayer.name) }}</span>
      <span v-else></span>
      <span v-if="showTimer" class="next-timer">{{ timer }}</span>
    </div>

    <!-- Ramadan Mode Banner -->
    <div
      v-if="ramadanInfo"
      class="ramadan-banner"
      @click="showDuaModal = true"
    >
      <div class="ramadan-left">
        <span class="ramadan-icon">{{ ramadanInfo.isFasting ? '🌙' : '✨' }}</span>
        <div class="ramadan-text">
          <div class="ramadan-label">
            {{ ramadanInfo.title }} ({{ ramadanInfo.targetTime }})
          </div>
          <div class="ramadan-timer">{{ ramadanInfo.countdown }}</div>
        </div>
      </div>
      <button class="ramadan-dua-btn" type="button" @click.stop="showDuaModal = true">
        {{ $t('ramadan.viewDua') }}
      </button>
    </div>

    <!-- Fasting Dua Modal -->
    <div v-if="showDuaModal" class="dua-modal-overlay" @click="showDuaModal = false">
      <div class="dua-modal-content" @click.stop>
        <div class="dua-modal-header">
          <span class="dua-modal-title">🌙 {{ $t('prayerSettings.ramadanDuaTitle') }}</span>
          <button class="dua-close-btn" @click="showDuaModal = false">✕</button>
        </div>
        <div class="dua-modal-body">
          <div class="dua-block">
            <div class="dua-badge">{{ $t('prayerSettings.suhurDuaName') }}</div>
            <div class="dua-arabic">نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ خَالِصًا لِلَّهِ تَعَالَى</div>
            <div class="dua-trans">{{ $t('prayerSettings.suhurDuaText') }}</div>
          </div>
          <div class="dua-divider"></div>
          <div class="dua-block">
            <div class="dua-badge iftar">{{ $t('prayerSettings.iftarDuaName') }}</div>
            <div class="dua-arabic">اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ</div>
            <div class="dua-trans">{{ $t('prayerSettings.iftarDuaText') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>





<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePrayerSettingsStore } from '../../../stores/prayerSettingsStore';
import { usePrayerStore, type PrayerName, type NextPrayer } from '../../../stores/prayerStore';
import { useSettingsStore } from '../../../stores/settingsStore';

const props = defineProps<{
  list: { name: PrayerName; at: string }[];
  nextPrayer: NextPrayer;
  timer: string;
  now: Date;
  showNext: boolean;
  showTimer: boolean;
}>();

const { t } = useI18n();
const prayerSettingsStore = usePrayerSettingsStore();
const prayerStore = usePrayerStore();
const settingsStore = useSettingsStore();

const showDuaModal = ref(false);

const ramadanInfo = computed(() => {
  if (!settingsStore.ramadanModeEnabled) return null;
  const fajrItem = props.list.find((p) => p.name === 'fajr');
  const maghribItem = props.list.find((p) => p.name === 'maghrib');
  if (!fajrItem || !maghribItem) return null;

  const fajrDate = todayAt(fajrItem.at);
  const maghribDate = todayAt(maghribItem.at);
  const now = props.now;

  // Если текущее время между Фаджром и Магрибом -> идет пост! Следующее событие — Ифтар.
  if (now >= fajrDate && now < maghribDate) {
    const diffMs = Math.max(0, maghribDate.getTime() - now.getTime());
    const h = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
    return {
      isFasting: true,
      title: t('ramadan.toIftar'),
      targetTime: maghribItem.at,
      countdown: `${h}:${m}:${s}`,
      suhurTime: fajrItem.at,
      iftarTime: maghribItem.at,
    };
  } else {
    // Ночь: следующее событие — Сухур (до Фаджра)
    const nextFajr = new Date(fajrDate);
    if (now >= maghribDate) {
      nextFajr.setDate(nextFajr.getDate() + 1);
    }
    const diffMs = Math.max(0, nextFajr.getTime() - now.getTime());
    const h = String(Math.floor(diffMs / 3600000)).padStart(2, '0');
    const m = String(Math.floor((diffMs % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((diffMs % 60000) / 1000)).padStart(2, '0');
    return {
      isFasting: false,
      title: t('ramadan.toSuhur'),
      targetTime: fajrItem.at,
      countdown: `${h}:${m}:${s}`,
      suhurTime: fajrItem.at,
      iftarTime: maghribItem.at,
    };
  }
});

function prettyName(name: PrayerName) {
  return t(`prayers.${name}`);
}

function isSoundEnabled(prayer: PrayerName): boolean {
  return prayerSettingsStore.isSoundEnabled(prayer);
}



function todayAt(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(props.now);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d;
}

function isDone(prayerName: PrayerName): boolean {
  if (isCurrent(prayerName)) return false;
  if (props.nextPrayer.tomorrow) return true;
  
  const item = props.list.find((p) => p.name === prayerName);
  if (!item) return false;
  
  let prayerTime = todayAt(item.at);
  
  // Tahajjud is placed at the bottom, so once Fajr has passed, 
  // the Tahajjud displayed represents tonight's (tomorrow calendar day)
  if (prayerName === 'tahajjud') {
    const fajrItem = props.list.find((p) => p.name === 'fajr');
    if (fajrItem) {
      const fajrTime = todayAt(fajrItem.at);
      if (props.now > fajrTime) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }
    }
  }
  
  return props.now > prayerTime;
}

function isCurrent(prayerName: PrayerName): boolean {
  return props.nextPrayer.name === prayerName;
}

function handlePrayerClick(prayer: PrayerName) {
  const prayerItem = props.list.find((p) => p.name === prayer);
  if (prayerItem) {
    prayerStore.selectPrayer(prayerItem);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  }
}

function handleSoundToggle(prayer: PrayerName) {
  const current = prayerSettingsStore.isSoundEnabled(prayer);
  prayerSettingsStore.setPrayerSound(prayer, !current);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}
</script>


<style scoped>
.prayer-card {
  width: 100%;
  max-width: 300px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  border-radius: 20px;
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45);
}

.rows {
  display: grid;
}

.row-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 6px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.row-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.row-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sound-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  border-radius: 50%;
  transition: all 0.2s ease;
  padding: 0;
}

.sound-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

.sound-icon.disabled {
  color: rgba(255, 255, 255, 0.4);
  opacity: 0.6;
}

.row-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.row-item.active {
  background: rgba(31, 138, 91, 0.2);
  border-color: rgba(31, 138, 91, 0.4);
}

.row-item.done .name,
.row-item.done .time {
  opacity: 0.5;
  text-decoration: line-through;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-marker {
  font-size: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.active .status-marker {
  background: #1f8a5b;
  box-shadow: 0 0 10px rgba(31, 138, 91, 0.5);
}

.name {
  font-weight: 600;
}
.time {
  font-weight: 800;
}

.next-bar {
  margin-top: 14px;
  background: #1f8a5b;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 900;
}

.next-name {
  font-size: 15px;
}
.next-timer {
  font-size: 16px;
  letter-spacing: 0.3px;
}

/* Ramadan Mode Banner */
.ramadan-banner {
  margin-top: 10px;
  background: linear-gradient(135deg, rgba(229, 184, 105, 0.2), rgba(31, 138, 91, 0.25));
  border: 1px solid rgba(229, 184, 105, 0.35);
  border-radius: 14px;
  padding: 10px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.ramadan-banner:hover {
  background: linear-gradient(135deg, rgba(229, 184, 105, 0.28), rgba(31, 138, 91, 0.35));
}

.ramadan-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ramadan-icon {
  font-size: 20px;
}

.ramadan-label {
  font-size: 11.5px;
  color: #f7d58b;
  font-weight: 600;
}

.ramadan-timer {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.5px;
}

.ramadan-dua-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  color: #fff;
  padding: 6px 10px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

/* Fasting Dua Modal */
.dua-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.dua-modal-content {
  background: #141e23;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  width: 100%;
  max-width: 420px;
  padding: 20px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
}

.dua-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.dua-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #f7d58b;
}

.dua-close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
}

.dua-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dua-badge {
  display: inline-block;
  align-self: flex-start;
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 8px;
  background: rgba(110, 231, 183, 0.15);
  color: #6ee7b7;
}

.dua-badge.iftar {
  background: rgba(247, 213, 139, 0.15);
  color: #f7d58b;
}

.dua-arabic {
  font-size: 16px;
  direction: rtl;
  text-align: right;
  line-height: 1.6;
  font-family: serif;
  color: #fff;
}

.dua-trans {
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.4;
}

.dua-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 14px 0;
}
</style>
