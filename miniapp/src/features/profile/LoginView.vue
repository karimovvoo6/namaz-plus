<template>
  <div class="login-view">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ isAuthenticated ? $t('profile.title') : $t('profile.login') }}</div>
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
        <!-- Не авторизован -->
        <div v-if="!isAuthenticated" class="login-section">
          <div class="login-icon">👤</div>
          <div class="login-text">{{ $t('profile.loginSubtitle') }}</div>
          <button class="login-button" @click="handleLogin">
            {{ $t('profile.login') }}
          </button>
        </div>

        <!-- Авторизован -->
        <div v-else class="profile-section">
          <div class="profile-header">
            <div class="avatar" :style="avatarStyle">
              <img v-if="user?.photo_url" :src="user.photo_url" :alt="user.first_name" />
              <div v-else class="avatar-placeholder">
                {{ user?.first_name?.[0]?.toUpperCase() || 'U' }}
              </div>
            </div>
            <div class="profile-info">
              <div class="profile-name">
                {{ user?.first_name }} {{ user?.last_name || '' }}
              </div>
              <div v-if="user?.username" class="profile-username">@{{ user.username }}</div>
            </div>
          </div>

          <SettingsCard>
            <SettingsRow
              icon="user"
              :title="$t('profile.logout')"
              @click="handleLogout"
            />
          </SettingsCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useProfileStore } from '../../stores/profileStore';
import SettingsCard from './components/SettingsCard.vue';
import SettingsRow from './components/SettingsRow.vue';

const router = useRouter();
const { t } = useI18n();

const profileStore = useProfileStore();

const isAuthenticated = computed(() => profileStore.isAuthenticated);
const user = computed(() => profileStore.user);

const avatarStyle = computed(() => {
  if (user.value?.photo_url) return {};
  // Генерируем цвет на основе ID пользователя
  const colors = ['#1f8a5b', '#d8b04b', '#2563eb', '#7c3aed', '#dc2626'];
  const colorIndex = (user.value?.id || 0) % colors.length;
  return { backgroundColor: colors[colorIndex] };
});

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/profile');
}

async function handleLogin() {
  try {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
    await profileStore.loginWithTelegram();
    // Закрываем экран после успешного входа
    close();
  } catch (err) {
    console.error('Login error:', err);
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(t('profile.loginError'));
    }
  }
}

function handleLogout() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  profileStore.logout();
}
</script>

<style scoped>
.login-view {
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

.login-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 40px 20px;
  min-height: 300px;
}

.login-icon {
  font-size: 64px;
  opacity: 0.8;
}

.login-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 15px;
  text-align: center;
  line-height: 1.5;
}

.login-button {
  padding: 14px 32px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 16px;
  color: rgba(255, 255, 255, 0.95);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.2s ease;
}

.login-button:hover {
  background: rgba(255, 255, 255, 0.20);
  transform: scale(1.02);
}

.login-button:active {
  transform: scale(0.98);
}

.profile-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.95);
  font-size: 24px;
  font-weight: 700;
}

.profile-info {
  flex: 1;
  min-width: 0;
}

.profile-name {
  color: rgba(255, 255, 255, 0.95);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
}

.profile-username {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin-top: 4px;
}
</style>
