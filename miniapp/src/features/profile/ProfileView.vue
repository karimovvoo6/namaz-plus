<template>
  <div class="profileRoot">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('profile.title') }}</div>

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

      <div class="scroll">
        <!-- 1) Войти / Профиль -->
        <SettingsCard>
          <SettingsRow
            v-if="!profileStore.isAuthenticated"
            icon="user"
            :title="$t('profile.login')"
            :subtitle="$t('profile.loginSubtitle')"
            @click="handleLogin"
          />
          <SettingsRow
            v-else
            icon="user"
            :title="profileStore.user?.first_name || $t('profile.userProfile')"
            :subtitle="profileStore.user?.username ? `@${profileStore.user.username}` : ''"
            @click="handleLogin"
          />
        </SettingsCard>

        <!-- 2) Location & Language -->
        <SettingsCard>
          <SettingsRow
            icon="location"
            :title="$t('location.current')"
            :value="locationDisplay"
            @click="handleLocation"
          />
          <SettingsRow
            icon="globe"
            :title="$t('profile.language')"
            :value="languageDisplay"
            @click="handleLanguage"
          />
        </SettingsCard>

        <!-- 3) Main settings group -->
        <SettingsCard>
          <SettingsRow
            icon="moon"
            :title="$t('profile.prayerTime')"
            @click="handlePrayerTime"
          />
          <SettingsRow
            icon="bell"
            :title="$t('profile.notifications')"
            @click="handleNotifications"
          />
          <SettingsRow
            icon="image"
            :title="$t('profile.appearance')"
            :subtitle="$t('profile.appearanceSubtitle')"
            @click="handleAppearance"
          />
          <SettingsRow
            icon="widgets"
            :title="$t('profile.widgets')"
            @click="handleWidgets"
          />
        </SettingsCard>

        <!-- 4) About / FAQ -->
        <SettingsCard>
          <SettingsRow
            icon="info"
            :title="$t('profile.about')"
            @click="handleAbout"
          />
          <SettingsRow
            icon="help"
            :title="$t('profile.faq')"
            @click="handleFaq"
          />
        </SettingsCard>

        <div class="spacer" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useLocationStore } from '../../stores/locationStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { useProfileStore } from '../../stores/profileStore';
import SettingsCard from './components/SettingsCard.vue';
import SettingsRow from './components/SettingsRow.vue';

const router = useRouter();
const { t } = useI18n();
const locationStore = useLocationStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();

const locationDisplay = computed(() => {
  return locationStore.displayName || t('location.auto');
});

const languageDisplay = computed(() => {
  return settingsStore.languageName;
});

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

function handleLogin() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  // TODO: Реализовать логин
  console.log('[profile] login');
}

function handleLocation() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/location');
}

function handleLanguage() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/language');
}

function handlePrayerTime() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/prayer-settings');
}

function handleNotifications() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/notifications');
}

function handleAppearance() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/appearance');
}

function handleWidgets() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/widgets');
}

function handleAbout() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/about');
}

function handleFaq() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  router.push('/faq');
}
</script>

<style scoped>
.profileRoot {
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
}

.scroll {
  flex: 1;
  padding-bottom: 8px;
  display: grid;
  gap: 12px;
}

.spacer {
  height: 10px;
}
</style>
