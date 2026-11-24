<template>
  <div class="about-view">
    <div class="backdrop" @click="goBack" />
    
    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('about.title') }}</div>
        <button class="closeBtn" @click="goBack" aria-label="Close">
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
        <!-- Logo & Version -->
        <SettingsCard>
          <div class="logo-section">
            <div class="logo-container">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="app-logo">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h2 class="app-name">Namaz+</h2>
            <p class="app-version">{{ $t('about.version') }} 1.0.0 (2026)</p>
            <p class="description-text">
              {{ $t('about.description') }}
            </p>
          </div>
        </SettingsCard>

        <!-- Mission -->
        <SettingsCard>
           <div class="section-title">{{ $t('about.missionTitle') }}</div>
           <div class="text-block">
             {{ $t('about.missionText') }}
           </div>
        </SettingsCard>

        <!-- Features -->
        <SettingsCard>
          <div class="section-title">{{ $t('about.featuresTitle') }}</div>
          <div class="features-list">
             <div class="feature-item" v-for="feature in localizedFeatures" :key="feature">
               <span class="feature-bullet">•</span>
               <span class="feature-text">{{ feature }}</span>
             </div>
          </div>
        </SettingsCard>

        <!-- Contacts -->
        <SettingsCard>
          <div class="section-title">{{ $t('about.contactsTitle') }}</div>
          <SettingsRow 
            icon="info"
            :title="$t('about.supportEmail')"
            subtitle="karimovdalerkhuja@gmail.com"
            @click="openEmail"
          />
          <SettingsRow 
            icon="help"
            :title="$t('about.telegramChannel')"
            subtitle="@namaz_khujand_bot"
            @click="openTg"
          />
        </SettingsCard>

        <div class="footer">
          <p>© 2026 Namaz+. {{ $t('about.allRightsReserved') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SettingsCard from '../profile/components/SettingsCard.vue';
import SettingsRow from '../profile/components/SettingsRow.vue';

const router = useRouter();
const { t } = useI18n();

const localizedFeatures = computed(() => [
  t('about.featureList.times'),
  t('about.featureList.qibla'),
  t('about.featureList.dhikr'),
  t('about.featureList.multilingual'),
  t('about.featureList.notifications'),
]);

function goBack() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function openEmail() {
  window.location.href = 'mailto:karimovdalerkhuja@gmail.com';
}

function openTg() {
  window.open('https://t.me/namaz_khujand_bot', '_blank');
}
</script>

<style scoped>
.about-view {
  position: fixed;
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
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 20px;
}

.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  text-align: center;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: rgba(251, 191, 36, 0.1);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.app-name {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 4px 0;
  color: #fff;
}

.app-version {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px 0;
}

.description-text {
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.section-title {
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.text-block {
  padding: 16px;
  font-size: 15px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

.features-list {
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.feature-bullet {
  color: #fbbf24;
  font-size: 18px;
}

.feature-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.footer {
  text-align: center;
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  margin-top: 8px;
  flex-shrink: 0;
}
</style>
