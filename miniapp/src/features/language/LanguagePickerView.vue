<template>
  <div class="language-picker">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('language.title') }}</div>
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
        <div class="options">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="option"
            :class="{ active: settingsStore.language === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <div class="option-content">
              <div class="option-name">{{ lang.name }}</div>
              <div class="option-native">{{ lang.native }}</div>
            </div>
            <div v-if="settingsStore.language === lang.code" class="check">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M20 6L9 17l-5-5"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProfileStore } from '../../stores/profileStore';
import type { Language } from '../../stores/settingsStore';


const router = useRouter();
const { locale, t } = useI18n();

const settingsStore = useSettingsStore();
const profileStore = useProfileStore();


const languages = computed(() => [
  { code: 'ru' as Language, name: t('language.russian'), native: 'Русский' },
  { code: 'tj' as Language, name: t('language.tajik'), native: 'Тоҷикӣ' },
  { code: 'en' as Language, name: t('language.english'), native: 'English' },
]);

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/profile');
}

function selectLanguage(lang: Language) {
  settingsStore.setLanguage(lang);
  locale.value = lang;
  
  if (profileStore.user?.id) {
    settingsStore.syncWithBackend(profileStore.user.id);
  }
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}


</script>

<style scoped>
.language-picker {
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
  padding: 8px 0;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  color: rgba(255, 255, 255, 0.92);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.option:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

.option.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.25);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.option-name {
  font-size: 15px;
  font-weight: 600;
}

.option-native {
  font-size: 13px;
  opacity: 0.7;
}

.check {
  color: rgba(255, 255, 255, 0.9);
  flex-shrink: 0;
}
</style>
