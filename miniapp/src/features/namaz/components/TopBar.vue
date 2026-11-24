<template>
  <div class="top-bar" @click.stop>
    <div class="top-bar-left">
      <button class="profile-button" @click="handleProfileClick">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>
    </div>

    <div class="top-bar-right" @click="handleLocationClick">
      <div class="location-text">{{ locationText }}</div>
      <div class="hijri-text">{{ hijriText }}</div>
      <div v-if="localTime || makkahTime" class="time-text notranslate" translate="no">
        <span v-if="localTime">{{ $t('time.local') }}: {{ localTime }}</span>
        <span v-if="localTime && makkahTime" class="time-separator"> • </span>
        <span v-if="makkahTime">{{ $t('time.makkah') }}: {{ makkahTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  locationText: string;
  hijriText: string;
  localTime?: string;
  makkahTime?: string;
}>();

const emit = defineEmits<{
  profileClick: [];
  locationClick: [];
}>();

function handleProfileClick() {
  emit('profileClick');
}

function handleLocationClick() {
  emit('locationClick');
}
</script>

<style scoped>
.top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px;
  padding-top: max(20px, calc(env(safe-area-inset-top) + 8px));
  pointer-events: none;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  pointer-events: auto;
}

.profile-button {
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
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0;
  margin: 0;
}

.profile-button:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.profile-button:active {
  transform: scale(0.98);
}

/* .badge removed */


.top-bar-right {
  text-align: right;
  pointer-events: auto;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.top-bar-right:active {
  opacity: 0.7;
}

.location-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hijri-text {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  margin-top: 2px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.time-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.4;
  margin-top: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.time-separator {
  opacity: 0.5;
}
</style>
