<template>
  <div class="quran-view">
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <h1 class="title">{{ $t('quran.title') }}</h1>
      <div style="width: 40px"></div>
    </div>

    <div class="search-container">
      <input 
        v-model="searchQuery" 
        type="text" 
        :placeholder="$t('quran.search')" 
        class="search-input"
      />
    </div>

    <div class="surah-list">
      <div 
        v-for="surah in filteredSurahs" 
        :key="surah.number"
        class="surah-item"
        @click="openSurah(surah.number)"
      >
        <div class="surah-number">{{ surah.number }}</div>
        <div class="surah-info">
          <div class="surah-name-ru">{{ getLocalName(surah) }}</div>
          <div class="surah-meta">
            {{ surah.englishNameTranslation }} • {{ surah.numberOfAyahs }} {{ $t('quran.ayah') }} • {{ surah.revelationType === 'Meccan' ? $t('quran.meccan') : $t('quran.medinan') }}
          </div>
        </div>
        <div class="surah-name-ar">{{ surah.name }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Surah } from './types';
import { surahNamesRu } from './surahNamesRu';
import { surahNamesTj } from './surahNamesTj';

const router = useRouter();
const { locale } = useI18n();
const searchQuery = ref('');
const surahs = ref<Surah[]>([]);

onMounted(async () => {
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();
    if (data.code === 200) {
      surahs.value = data.data;
    }
  } catch (e) {
    console.error('Failed to fetch surahs', e);
  }
});

const filteredSurahs = computed(() => {
  const query = searchQuery.value.toLowerCase();
  return surahs.value.filter(s => {
    const localName = getLocalName(s).toLowerCase();
    const enName = s.englishName.toLowerCase();
    const enMeaning = s.englishNameTranslation.toLowerCase();
    const arName = s.name;
    const number = s.number.toString();
    
    return localName.includes(query) || 
           enName.includes(query) || 
           enMeaning.includes(query) || 
           arName.includes(query) || 
           number.includes(query);
  });
});

function getLocalName(surah: Surah) {
  if (locale.value === 'ru') return surahNamesRu[surah.number] || surah.englishName;
  if (locale.value === 'tj') return surahNamesTj[surah.number] || surah.englishName;
  return surah.englishName;
}

function openSurah(number: number) {
  router.push(`/quran/${number}`);
}
</script>

<style scoped>
.quran-view {
  position: absolute;
  inset: 0;
  background: #0f172a;
  color: #fff;
  z-index: 50;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
}

.search-container {
  padding: 16px;
}

.search-input {
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  font-size: 16px;
}

.surah-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 16px 16px;
}

.surah-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.surah-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.surah-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-right: 16px;
  font-weight: 700;
  font-size: 14px;
}

.surah-info {
  flex: 1;
}

.surah-name-ru {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

.surah-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.surah-name-ar {
  font-family: 'Amiri', serif;
  font-size: 20px;
  color: #10b981;
}
</style>
