<template>
  <button
    class="wallpaper-circle"
    :class="{ active: isActive }"
    :style="{ background: wallpaper.gradient || 'transparent' }"
    @click="$emit('select')"
  >
    <div v-if="isActive" class="check-badge">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
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
</template>

<script setup lang="ts">
import type { Wallpaper } from '../stores/appearanceStore';

defineProps<{
  wallpaper: Wallpaper;
  isActive: boolean;
}>();

defineEmits<{
  select: [];
}>();
</script>

<style scoped>
.wallpaper-circle {
  position: relative;
  width: 80px;
  height: 80px;
  min-width: 80px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.wallpaper-circle:hover {
  transform: scale(1.05);
}

.wallpaper-circle.active {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.check-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #1f8a5b;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}
</style>
