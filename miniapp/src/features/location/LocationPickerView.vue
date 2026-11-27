<template>
  <div class="location-picker">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('location.title') }}</div>
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
        <!-- Поиск -->
        <div class="search-section">
          <div class="search-box">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="$t('location.searchPlaceholder')"
              class="search-input"
              @input="handleSearch"
            />
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              </svg>
            </button>
          </div>

          <!-- Кнопка "Моё местоположение" -->
          <button class="my-location-btn" @click="handleMyLocation" :disabled="locationStore.isLoading">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2v4M12 18v4M2 12h4M18 12h4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span>{{ $t('location.myLocation') }}</span>
            <span v-if="locationStore.isLoading" class="loading">...</span>
          </button>
        </div>

        <!-- Результаты поиска -->
        <div v-if="searchResults.length > 0" class="results-section">
          <div class="section-title">{{ $t('common.search') }}</div>
          <div class="results-list">
            <button
              v-for="location in searchResults"
              :key="location.id"
              class="result-item"
              @click="selectLocation(location)"
            >
              <svg class="result-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" />
              </svg>
              <div class="result-text">
                <div class="result-name">{{ location.displayName }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- Сохранённые города -->
        <div v-if="locationStore.savedLocations.length > 0 && !searchQuery" class="saved-section">
          <div class="section-title">{{ $t('location.saved') }}</div>
          <div class="saved-list">
            <div
              v-for="location in locationStore.savedLocations"
              :key="location.id"
              class="saved-item"
              role="button"
              tabindex="0"
              @keydown.enter="selectLocation(location)"
              @click="selectLocation(location)"
            >
              <svg class="saved-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z"
                  stroke="currentColor"
                  stroke-width="2"
                />
                <circle cx="12" cy="10" r="2.5" stroke="currentColor" stroke-width="2" />
              </svg>
              <div class="saved-text">
                <div class="saved-name">{{ location.displayName }}</div>
              </div>
              <button
                class="remove-btn"
                @click.stop="removeLocation(location.id)"
                aria-label="Remove"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Пустое состояние -->
        <div v-if="!searchQuery && locationStore.savedLocations.length === 0 && !locationStore.isLoading" class="empty">
          <div class="empty-text">{{ $t('location.noSaved') }}</div>
        </div>

        <!-- Ошибка -->
        <div v-if="locationStore.error" class="error">
          {{ locationStore.error }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useLocationStore } from '../../stores/locationStore';
import { usePrayerStore } from '../../stores/prayerStore';
import type { Location } from '../../stores/locationStore';

const router = useRouter();


const locationStore = useLocationStore();
const prayerStore = usePrayerStore();

const searchQuery = ref('');
const searchResults = ref<Location[]>([]);
let searchTimeout: number | null = null;

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

async function handleSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  searchTimeout = window.setTimeout(async () => {
    const results = await locationStore.searchCities(searchQuery.value);
    searchResults.value = results;
  }, 300);
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
}

async function handleMyLocation() {
  try {
    const location = await locationStore.detectLocation();
    locationStore.addSavedLocation(location);
    await selectLocation(location);
  } catch (err) {
    console.error('Failed to detect location:', err);
  }
}

async function selectLocation(location: Location) {
  locationStore.setCurrentLocation(location);
  locationStore.addSavedLocation(location);
  
  // Обновляем время намаза
  await prayerStore.fetchPrayerTimes(location.latitude, location.longitude);
  
  // Haptic feedback
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  
  close();
}

function removeLocation(id: string) {
  locationStore.removeSavedLocation(id);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});
</script>

<style scoped>
.location-picker {
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
  gap: 16px;
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
  gap: 20px;
}

.search-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 500;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-btn {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  border-radius: 50%;
}

.my-location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.2s ease;
}

.my-location-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.18);
}

.my-location-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.section-title {
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.results-section,
.saved-section {
  display: flex;
  flex-direction: column;
}

.results-list,
.saved-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item,
.saved-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.result-item:hover,
.saved-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

.result-icon,
.saved-icon {
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.result-text,
.saved-text {
  flex: 1;
  min-width: 0;
}

.result-name,
.saved-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.saved-item {
  position: relative;
}

.remove-btn {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  border-radius: 50%;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.error {
  padding: 12px 16px;
  background: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  text-align: center;
}
</style>
