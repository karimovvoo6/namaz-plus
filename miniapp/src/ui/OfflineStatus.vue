<template>
  <Transition name="fade">
    <div v-if="!isOnline" class="offline-status">
      <div class="offline-card">
        <div class="offline-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55" />
            <path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0122.58 9" />
            <path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
            <path d="M8.53 16.11a6 6 0 016.95 0" />
            <path d="M12 20h.01" />
          </svg>
        </div>
        <div class="offline-content">
          <div class="offline-title">{{ $t('common.offline') }}</div>
          <div class="offline-text">{{ $t('common.offline_message') }}</div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isOnline = ref(navigator.onLine);

function updateOnlineStatus() {
  isOnline.value = navigator.onLine;
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});
</script>

<style scoped>
.offline-status {
  position: fixed;
  top: 24px;
  left: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  justify-content: center;
  pointer-events: none;
}

.offline-card {
  background: rgba(220, 38, 38, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
  max-width: 400px;
  width: 100%;
}

.offline-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.offline-content {
  flex: 1;
}

.offline-title {
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 2px;
}

.offline-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  line-height: 1.3;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
