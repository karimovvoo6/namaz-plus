<template>
  <div class="allah-names-view">
    <div class="bg" :style="themeStore.backgroundStyle" />
    
    <div class="content">
      <!-- TopBar -->
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
        <div class="title">{{ $t('allahNames.title') }}</div>
        <button class="random-btn" @click="showRandom">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 0 0 5.64 5.64M3.51 15a9 9 0 0 0 14.85 4.36"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Search -->
      <div class="search-section">
        <div class="search-box">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2" />
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="$t('allahNames.search')"
            class="search-input"
          />
        </div>
        <button
          class="filter-btn"
          :class="{ active: showFavoritesOnly }"
          @click="toggleFavorites"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              :fill="showFavoritesOnly ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>

      <!-- Names List -->
      <div class="names-list">
        <div
          v-for="name in filteredNames"
          :key="name.number"
          class="name-card"
          role="button"
          tabindex="0"
          @keydown.enter="openDetails(name)"
          @click="openDetails(name)"
        >
          <div class="name-number">{{ name.number }}</div>
          <div class="name-content">
            <div class="name-arabic">{{ name.arabic }}</div>
            <div class="name-transliteration">{{ name.transliteration }}</div>
            <div class="name-translation">{{ getTranslation(name) }}</div>
          </div>
          <button
            class="favorite-btn"
            :class="{ active: isFavorite(name.number) }"
            @click.stop="toggleFavorite(name.number)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                :fill="isFavorite(name.number) ? 'currentColor' : 'none'"
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

    <!-- Details Modal -->
    <div v-if="selectedName" class="details-modal" @click="closeDetails">
      <div class="details-content" @click.stop>
        <button class="details-close" @click="closeDetails">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <div class="details-number">{{ selectedName.number }}</div>
        <div class="details-arabic">{{ selectedName.arabic }}</div>
        <div class="details-transliteration">{{ selectedName.transliteration }}</div>
        <div class="details-translation">{{ getTranslation(selectedName) }}</div>
        <div class="details-meaning">{{ getMeaning(selectedName) }}</div>
        <button
          class="details-favorite"
          :class="{ active: isFavorite(selectedName.number) }"
          @click="toggleFavorite(selectedName.number)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              :fill="isFavorite(selectedName.number) ? 'currentColor' : 'none'"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          {{ isFavorite(selectedName.number) ? $t('allahNames.inFavorites') : $t('allahNames.addToFavorites') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { allahNames, type AllahName } from './data/allahNames';
import { useThemeStore } from '../../stores/themeStore';

const router = useRouter();
const { locale } = useI18n();
const themeStore = useThemeStore();
const searchQuery = ref('');
const showFavoritesOnly = ref(false);
const selectedName = ref<AllahName | null>(null);
const favorites = ref<Set<number>>(new Set());

function getTranslation(name: AllahName) {
  if (locale.value === 'en') return name.translationEn || name.transliteration;
  if (locale.value === 'tj') return name.translationTj || name.translationRu;
  return name.translationRu;
}

function getMeaning(name: AllahName) {
  if (locale.value === 'en') return name.meaningEn || name.meaningShort;
  if (locale.value === 'tj') return name.meaningTj || name.meaningShort;
  return name.meaningShort;
}

const filteredNames = computed(() => {
  let names = allahNames;
  
  if (showFavoritesOnly.value) {
    names = names.filter((n) => favorites.value.has(n.number));
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    names = names.filter(
      (n) =>
        n.transliteration.toLowerCase().includes(query) ||
        getTranslation(n).toLowerCase().includes(query) ||
        n.arabic.includes(query)
    );
  }
  
  return names;
});

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function isFavorite(number: number): boolean {
  return favorites.value.has(number);
}

function toggleFavorite(number: number) {
  if (favorites.value.has(number)) {
    favorites.value.delete(number);
  } else {
    favorites.value.add(number);
  }
  saveFavorites();
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function toggleFavorites() {
  showFavoritesOnly.value = !showFavoritesOnly.value;
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function openDetails(name: AllahName) {
  selectedName.value = name;
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function closeDetails() {
  selectedName.value = null;
}

function showRandom() {
  const randomName = allahNames[Math.floor(Math.random() * allahNames.length)];
  if (randomName) openDetails(randomName);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
  }
}

function saveFavorites() {
  localStorage.setItem('allahNamesFavorites', JSON.stringify(Array.from(favorites.value)));
}

function loadFavorites() {
  try {
    const stored = localStorage.getItem('allahNamesFavorites');
    if (stored) {
      favorites.value = new Set(JSON.parse(stored));
    }
  } catch (err) {
    console.error('Failed to load favorites:', err);
  }
}

onMounted(() => {
  loadFavorites();
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});
</script>

<style scoped>
.allah-names-view {
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

.back-btn,
.random-btn {
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
.random-btn:hover {
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

.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.search-box {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
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

.filter-btn {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.filter-btn.active {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.4);
  color: rgba(255, 59, 48, 0.9);
}

.names-list {
  flex: 1;
  overflow: auto;
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.name-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.name-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateX(4px);
}

.name-number {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(31, 138, 91, 0.2);
  color: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.name-content {
  flex: 1;
  min-width: 0;
}

.name-arabic {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
  direction: rtl;
  text-align: right;
}

.name-transliteration {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2px;
}

.name-translation {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.favorite-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: 0;
  color: rgba(255, 255, 255, 0.5);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 59, 48, 0.8);
}

.favorite-btn.active {
  color: rgba(255, 59, 48, 0.9);
}

.details-modal {
  position: absolute;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.details-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  padding: 32px;
  background: rgba(20, 30, 35, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  text-align: center;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.details-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.details-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(31, 138, 91, 0.2);
  color: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  font-size: 24px;
  font-weight: 700;
  margin: 0 auto 24px;
}

.details-arabic {
  font-size: 48px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 16px;
  direction: rtl;
}

.details-transliteration {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 12px;
}

.details-translation {
  font-size: 20px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
}

.details-meaning {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 24px;
}

.details-favorite {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 auto;
}

.details-favorite:hover {
  background: rgba(255, 255, 255, 0.15);
}

.details-favorite.active {
  background: rgba(255, 59, 48, 0.2);
  border-color: rgba(255, 59, 48, 0.4);
  color: rgba(255, 59, 48, 0.9);
}
</style>
