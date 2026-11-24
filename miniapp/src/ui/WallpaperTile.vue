<template>
  <div
    class="wallpaper-tile"
    :class="{ active: isActive, 'is-gradient': wallpaper.type === 'gradient' }"
    :style="tileStyle"
    @click="$emit('select')"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div v-if="wallpaper.type === 'gradient'" class="gradient-overlay" />
    <div v-if="wallpaper.type === 'image' && wallpaper.url" class="image-overlay" />
    
    <div v-if="isActive" class="check-badge">
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
    
    <div class="tile-name">{{ wallpaper.name }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Wallpaper } from '@/stores/appearanceStore';


const props = defineProps<{
  wallpaper: Wallpaper;
  isActive: boolean;
}>();

const emit = defineEmits<{
  select: [];
  preview: [];
}>();

const tileStyle = computed(() => {
  if (props.wallpaper.type === 'gradient' && props.wallpaper.gradient) {
    return {
      background: props.wallpaper.gradient,
    };
  }
  if (props.wallpaper.type === 'image' && props.wallpaper.url) {
    return {
      backgroundImage: `url(${props.wallpaper.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  return {};
});

let touchStartTime = 0;

function handleTouchStart() {
  touchStartTime = Date.now();
}

function handleTouchEnd() {
  const touchDuration = Date.now() - touchStartTime;
  if (touchDuration > 300) {
    // Long press - show preview
    emit('preview');
  }
}
</script>

<style scoped>
.wallpaper-tile {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  display: flex;
  align-items: flex-end;
  padding: 12px;
}

.wallpaper-tile:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.wallpaper-tile.active {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3), 0 8px 24px rgba(0, 0, 0, 0.4);
}

.gradient-overlay,
.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, transparent 50%);
  pointer-events: none;
}

.check-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #1f8a5b;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}

.tile-name {
  position: relative;
  z-index: 1;
  color: rgba(255, 255, 255, 0.95);
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
