<template>
  <div class="bottom-bar" @click.stop>

    <GlassButton @click="handleCompassClick">
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
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    </GlassButton>
    <GlassButton @click="handleMenuClick">
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    </GlassButton>
    <GlassButton capsule @click="handleQuranClick">{{ $t('common.quran') }}</GlassButton>
  </div>
</template>

<script setup lang="ts">
import GlassButton from '../../../ui/GlassButton.vue';

const emit = defineEmits<{
  compassClick: [];
  menuClick: [];
  quranClick: [];
}>();

function handleCompassClick() {
  emit('compassClick');
}

function handleMenuClick() {
  emit('menuClick');
}

function handleQuranClick() {
  emit('quranClick');
}
</script>

<style scoped>
.bottom-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 12px 20px;
  padding-bottom: max(28px, calc(env(safe-area-inset-bottom) + 24px));
  gap: 12px;
  pointer-events: none;
}

.bottom-bar > * {
  pointer-events: auto;
}

.bottom-bar > *:nth-child(1) {
  justify-self: start;
}

.bottom-bar > *:nth-child(2) {
  justify-self: center;
}

.bottom-bar > *:nth-child(3) {
  justify-self: end;
}

.bottom-bar :deep(.glass-button) {
  width: 48px;
  height: 48px;
  font-size: 16px;
}

.bottom-bar :deep(.glass-button--capsule) {
  width: auto;
  height: 48px;
  min-width: 80px;
}
</style>
