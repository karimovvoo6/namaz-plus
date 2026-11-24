<template>
  <div class="appearance-page">
    <!-- 1️⃣ Header -->
    <header class="header">
      <div class="header-left"></div>
      <div class="header-title">{{ $t('appearance.title') }}</div>
      <button class="header-btn" @click="close">
        <div class="close-icon-circle">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
             <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
      </button>
    </header>

    <div class="content">


      <!-- 3️⃣ Gradients -->
      <section class="section">
        <div class="section-title">{{ $t('appearance.gradients') }}</div>
        <div class="gradients-grid">
          <button 
            v-for="g in gradients" 
            :key="g.id"
            class="gradient-circle"
            :class="{ active: themeStore.themeValue === g.css }"
            :style="{ background: g.css }"
            @click="selectWallpaper('gradient', g.css!)"
          >
             <div class="circle-check" v-if="themeStore.themeValue === g.css">
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                 <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
               </svg>
             </div>
          </button>
        </div>
      </section>

      <!-- 4️⃣ Image Sections (AI, Makkah, Classic, etc.) -->
      <section 
        v-for="section in wallpaperSections" 
        :key="section.id" 
        class="section"
      >
         <div class="section-title">{{ getSectionTitle(section.id) }}</div>
         <div class="grid">
            <button 
              v-for="item in section.items" 
              :key="item.id"
              class="classic-card"
              :class="{ active: themeStore.themeValue === getImageUrl(item) }"
              :style="{ backgroundImage: `url(${getImageUrl(item)})` }"
              @click="selectWallpaper('image', getImageUrl(item))"
            >
              <div class="card-overlay" v-if="themeStore.themeValue === getImageUrl(item)">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                   <path d="M20 6L9 17l-5-5" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                 </svg>
              </div>
            </button>
         </div>
      </section>

      <div class="spacer"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useThemeStore, type ThemeType } from '@/stores/themeStore';
import { gradients, wallpaperSections } from './data/wallpapers';
import { getImageUrl } from './composables/useImageFallback';

const router = useRouter();
const { t } = useI18n();
const themeStore = useThemeStore();

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function getSectionTitle(id: string) {
  return t(`appearance.sections.${id}`);
}

function selectWallpaper(type: ThemeType, value: string) {
  themeStore.setTheme(type, value);
}

function handleWheel(event: WheelEvent) {
  const el = event.currentTarget as HTMLDivElement;
  if (el) {
    el.scrollLeft += event.deltaY;
  }
}
</script>

<style scoped>
.appearance-page {
  position: absolute;
  inset: 0;
  background: #141e23f2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  z-index: 50;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Header */
.header {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  width: 32px;
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  text-align: center;
}

.header-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #fff;
}

.close-icon-circle {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  place-items: center;
  color: #EBEBF5;
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.3px;
  padding-left: 4px;
}

/* Gradients */
.gradients-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 4px 0 16px;
  max-width: 600px;
}

.gradient-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 2px solid transparent;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
  color: inherit;
}

.gradient-circle:active {
  transform: scale(0.95);
}

.gradient-circle.active {
  border-color: #0A84FF;
  transform: scale(1.05);
}

.circle-check {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
}

.classic-card {
  aspect-ratio: 1;
  border-radius: 16px;
  background-color: #2C2C2E;
  border: 2px solid transparent;
  cursor: pointer;
  position: relative;
  background-size: cover;
  background-position: center;
  transition: transform 0.2s;
  overflow: hidden;
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
}

.classic-card:active {
  transform: scale(0.96);
}

.classic-card.active {
  border-color: #0A84FF;
}

/* Common Check */
.card-check {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #0A84FF;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.spacer {
  height: 60px;
}
</style>
