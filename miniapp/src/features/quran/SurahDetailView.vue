<template>
  <div class="surah-detail">
    <div class="header">
      <button class="back-btn" @click="router.back()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="header-titles">
        <h1 class="title">{{ surah?.englishName }}</h1>
        <div class="subtitle">{{ surah?.englishNameTranslation }}</div>
      </div>
      <div class="header-actions">
        <!-- Settings Toggle not implemented yet -->
      </div>
    </div>

    <div class="controls">
      <label class="toggle">
        <input type="checkbox" v-model="showTranscription">
        <span>{{ $t('quran.transcription') }}</span>
      </label>
      <label class="toggle">
        <input type="checkbox" v-model="showTranslation">
        <span>{{ $t('quran.translation') }}</span>
      </label>
      <div class="divider"></div>
      <label class="toggle" :class="{ 'active-link': isAutoplay }">
        <input type="checkbox" v-model="isAutoplay">
        <span>{{ $t('quran.autoplay') }}</span>
      </label>
      <label class="toggle" :class="{ 'active-link': isRepeat }">
        <input type="checkbox" v-model="isRepeat">
        <span>{{ $t('quran.repeat') }}</span>
      </label>
    </div>

    <div class="ayah-list" v-if="surah">
      <div 
        v-for="ayah in surah.ayahs" 
        :key="ayah.number" 
        class="ayah-card"
        :class="{ 'active': currentAudio === ayah.number }"
      >
        <div class="ayah-header">
          <div class="ayah-number">{{ ayah.numberInSurah }}</div>
          <button class="play-btn" :class="{ 'disabled': !isOnline }" @click="toggleAudio(ayah)">
            <span v-if="currentAudio === ayah.number">⏸</span>
            <span v-else>▶</span>
          </button>
        </div>

        <div class="ayah-text-ar">{{ ayah.text }}</div>
        
        <div class="ayah-transcription" v-if="showTranscription">
          {{ ayah.transcription }}
        </div>
        
        <div class="ayah-translation" v-if="showTranslation">
          {{ ayah.translation }}
        </div>
      </div>
    </div>
    
    <div v-else class="loading">{{ $t('common.loading') }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { SurahDetail, Ayah } from './types';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const surahId = route.params.id as string;

const surah = ref<SurahDetail | null>(null);
const showTranscription = ref(true);
const showTranslation = ref(true);
const isAutoplay = ref(true);
const isRepeat = ref(false);
const currentAudio = ref<number | null>(null);
const isOnline = ref(navigator.onLine);
let audioObj: HTMLAudioElement | null = null;

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
  if (!isOnline.value) {
    stopAudio();
  }
}

onMounted(async () => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  try {
    const editionMap: Record<string, string> = {
      ru: 'ru.kuliev',
      en: 'en.sahih',
      tj: 'tg.ayati'
    };
    const currentEdition = editionMap[locale.value] || 'en.sahih';
    
    const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,${currentEdition},en.transliteration`);
    const data = await res.json();
    
    if (data.code === 200 && data.data.length >= 3) {
      const arabic = data.data[0];
      const translation = data.data[1];
      const transcription = data.data[2];

      const mergedAyahs = arabic.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        translation: translation.ayahs[index].text,
        transcription: transcription.ayahs[index].text
      }));

      surah.value = {
        ...arabic,
        ayahs: mergedAyahs
      };
    }
  } catch (e) {
    console.error('Failed to fetch surah details', e);
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
  stopAudio();
});

function toggleAudio(ayah: Ayah) {
  if (currentAudio.value === ayah.number) {
    stopAudio();
  } else {
    playAudio(ayah);
  }
}

function playAudio(ayah: Ayah) {
  if (!isOnline.value) return;
  stopAudio();
  currentAudio.value = ayah.number;
  // Using Alafasy audio
  const url = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
  audioObj = new Audio(url);
  audioObj.onended = () => {
    if (isAutoplay.value && surah.value) {
      const ayahs = surah.value.ayahs;
      const currentIndex = ayahs.findIndex(a => a.number === ayah.number);
      const nextAyah = ayahs[currentIndex + 1];
      
      if (nextAyah) {
        playAudio(nextAyah);
      } else if (isRepeat.value && ayahs.length > 0) {
        const firstAyah = ayahs[0];
        if (firstAyah) playAudio(firstAyah);
      } else {
        currentAudio.value = null;
      }
    } else {
      currentAudio.value = null;
    }
  };
  audioObj.play();
}

function stopAudio() {
  if (audioObj) {
    audioObj.pause();
    audioObj = null;
  }
  currentAudio.value = null;
}
</script>

<style scoped>
.surah-detail {
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
  padding: 16px;
  background: rgba(30, 41, 59, 0.9);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  margin-right: 12px;
}

.header-titles {
  flex: 1;
}

.title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.controls {
  display: flex;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.ayah-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.ayah-card {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ayah-card.active {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.ayah-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ayah-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.play-btn {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
}

.play-btn.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.ayah-text-ar {
  font-family: 'Amiri', serif;
  font-size: 26px;
  text-align: right;
  line-height: 2;
  margin-bottom: 16px;
  color: #fbbf24;
}

.ayah-transcription {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
  line-height: 1.5;
  font-style: italic;
}

.ayah-translation {
  font-size: 15px;
  color: #e2e8f0;
  line-height: 1.5;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: rgba(255, 255, 255, 0.5);
}

.divider {
  width: 1px;
  height: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.active-link {
  color: #10b981;
}
</style>
