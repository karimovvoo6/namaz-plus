<template>
  <div class="prayer-settings">
    <div class="backdrop" @click="goBack" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('prayerSettings.title') }}</div>
        <button class="closeBtn" type="button" @click="goBack" aria-label="Close">
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
        <!-- Источник времени -->
        <SettingsCard>
          <SettingsRow
            icon="info"
            :title="$t('prayerSettings.sourceTitle')"
            :subtitle="`${cityLabel}, Aladhan (MWL, Ханафи)`"
          />
        </SettingsCard>

        <!-- Дополнительные намазы -->
        <SettingsCard>
          <div class="section-title">{{ $t('prayerSettings.additionalPrayersTitle') }}</div>

          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('prayerSettings.tahajjudTitle') }}</div>
              <div class="toggle-subtitle">{{ $t('prayerSettings.tahajjudSubtitle') }}</div>
            </div>

            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="settingsStore.tahajjudEnabled"
                @change="onTahajjudToggle"
              />
              <span class="slider" />
            </label>
          </div>

          <div class="divider"></div>

          <SettingsRow
            icon="info"
            :title="$t('prayerSettings.moreAboutTahajjud')"
            @click="tahajjudInfoOpen = true"
          />
        </SettingsCard>

        <!-- Режим Рамадана (Сухур и Ифтар) -->
        <SettingsCard>
          <div class="section-title">{{ $t('prayerSettings.ramadanSectionTitle') }}</div>

          <div class="toggle-row">
            <div class="toggle-label">
              <div class="toggle-title">{{ $t('prayerSettings.ramadanModeTitle') }}</div>
              <div class="toggle-subtitle">{{ $t('prayerSettings.ramadanModeSubtitle') }}</div>
            </div>

            <label class="toggle-switch">
              <input
                type="checkbox"
                :checked="settingsStore.ramadanModeEnabled"
                @change="onRamadanToggle"
              />
              <span class="slider" />
            </label>
          </div>

          <div class="divider"></div>

          <SettingsRow
            icon="info"
            :title="$t('prayerSettings.ramadanDuaTitle')"
            @click="ramadanDuaOpen = true"
          />
        </SettingsCard>

        <!-- Ramadan Dua Modal -->
        <div
          v-if="ramadanDuaOpen"
          class="picker-overlay"
          @click="ramadanDuaOpen = false"
        >
          <div class="picker" @click.stop style="max-height: 80vh; overflow-y: auto;">
            <div class="picker-title">{{ $t('prayerSettings.ramadanDuaTitle') }}</div>

            <div class="info-text" style="text-align: left; line-height: 1.5; font-size: 13.5px; display: flex; flex-direction: column; gap: 14px;">
              <div>
                <strong style="color: #6ee7b7; display: block; margin-bottom: 4px;">{{ $t('prayerSettings.suhurDuaName') }}:</strong>
                <div style="font-size: 15px; direction: rtl; text-align: right; color: #fff; margin-bottom: 4px; font-family: serif;">
                  نَوَيْتُ أَنْ أَصُومَ صَوْمَ شَهْرِ رَمَضَانَ مِنَ الْفَجْرِ إِلَى الْمَغْرِبِ خَالِصًا لِلَّهِ تَعَالَى
                </div>
                <div style="color: rgba(255, 255, 255, 0.75);">
                  {{ $t('prayerSettings.suhurDuaText') }}
                </div>
              </div>

              <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 12px;">
                <strong style="color: #f7d58b; display: block; margin-bottom: 4px;">{{ $t('prayerSettings.iftarDuaName') }}:</strong>
                <div style="font-size: 15px; direction: rtl; text-align: right; color: #fff; margin-bottom: 4px; font-family: serif;">
                  اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
                </div>
                <div style="color: rgba(255, 255, 255, 0.75);">
                  {{ $t('prayerSettings.iftarDuaText') }}
                </div>
              </div>
            </div>

            <div class="picker-options" style="margin-top: 16px;">
              <button
                type="button"
                class="picker-option active center"
                @click="ramadanDuaOpen = false"
              >
                {{ $t('prayerSettings.gotIt') }}
              </button>
            </div>
          </div>
        </div>



        <!-- Tahajjud Info Modal -->
        <div
          v-if="tahajjudInfoOpen"
          class="picker-overlay"
          @click="tahajjudInfoOpen = false"
        >
          <div class="picker" @click.stop>
            <div class="picker-title">{{ $t('prayerSettings.tahajjudTitle') }}</div>

            <div class="info-text">
              {{ $t('prayerSettings.tahajjudInfoText') }}
            </div>

            <div class="picker-options">
              <button
                type="button"
                class="picker-option active center"
                @click="tahajjudInfoOpen = false"
              >
                {{ $t('prayerSettings.gotIt') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocationStore } from '@/stores/locationStore';
import { usePrayerStore } from '@/stores/prayerStore';
import { useSettingsStore, type PrayerTimesSource } from '@/stores/settingsStore';
import { useProfileStore } from '@/stores/profileStore';

import SettingsCard from '../profile/components/SettingsCard.vue';
import SettingsRow from '../profile/components/SettingsRow.vue';

const router = useRouter();
const {} = useI18n();
const locationStore = useLocationStore();
const prayerStore = usePrayerStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();

const sourceModalOpen = ref(false);

const tahajjudInfoOpen = ref(false);
const ramadanDuaOpen = ref(false);

/**
 * ✅ TS-safe: displayName может быть undefined/null.
 * Всегда приводим к строке, берём первую часть до запятой.
 */
const cityLabel = computed(() => {
  const dn = (locationStore.displayName ?? '').toString();
  const city = dn.split(',')[0]?.trim();
  return city && city.length > 0 ? city : 'Худжанд';
});

const sourceLabel = computed(() => {
  return settingsStore.prayerTimesSource === 'shuroiulamo'
    ? 'shuroiulamo.tj'
    : 'aladhan.com';
});

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

async function selectSource(source: PrayerTimesSource) {
  if (window.Telegram?.WebApp) window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  settingsStore.setPrayerTimesSource(source);
  await prayerStore.updatePrayerTimes(new Date());
  sourceModalOpen.value = false;
  
  if (profileStore.user?.id) {
    settingsStore.syncWithBackend(profileStore.user.id);
  }
}


function onTahajjudToggle(e: Event) {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } catch (err) {}
  const enabled = (e.target as HTMLInputElement).checked;
  settingsStore.setTahajjudEnabled(enabled);
  prayerStore.updatePrayerTimes(new Date());
  
  if (profileStore.user?.id) {
    settingsStore.syncWithBackend(profileStore.user.id);
  }
}

function onRamadanToggle(e: Event) {
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } catch (err) {}
  const enabled = (e.target as HTMLInputElement).checked;
  settingsStore.setRamadanModeEnabled(enabled);
}


onMounted(async () => {
  settingsStore.loadFromStorage();
  await prayerStore.updatePrayerTimes(new Date());
});
</script>

<style scoped>
.prayer-settings {
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

.toggle-subtitle {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  margin-top: 2px;
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
  inset: 0;
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

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 0 16px;
}

/* Picker overlay */
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

.picker-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
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

.opt-desc {
  display: block;
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.info-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  text-align: center;
  line-height: 1.5;
}

.center {
  text-align: center;
  justify-content: center;
}
</style>
