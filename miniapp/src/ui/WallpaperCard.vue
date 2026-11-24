<template>
  <button
    class="wallpaper-card"
    :class="{ active: isActive }"
    :style="cardStyle"
    @click="$emit('select')"
  >
    <div class="card-overlay" />

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
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Wallpaper } from '../stores/appearanceStore';

const props = defineProps<{
  wallpaper: Wallpaper;
  isActive: boolean;
}>();

defineEmits<{
  select: [];
}>();

const cardStyle = computed(() => {
  if (props.wallpaper.type === 'gradient' && props.wallpaper.gradient) {
    return { background: props.wallpaper.gradient };
  }
  if ((props.wallpaper.type === 'image' || props.wallpaper.type === 'user-image' || props.wallpaper.type === 'ai') && props.wallpaper.url) {
    return {
      backgroundImage: `url(${props.wallpaper.url})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  // Fallback для AI/Classic с градиентом
  if (props.wallpaper.gradient) {
    return { background: props.wallpaper.gradient };
  }
  return {};
});
</script>

<style scoped>
.wallpaper-card {
  position: relative;
  width: 120px;
  height: 160px;
  min-width: 120px;
  border-radius: 16px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  flex-shrink: 0;
}

.wallpaper-card:hover {
  transform: scale(1.02);
}

.wallpaper-card.active {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.3) 100%);
  pointer-events: none;
}

/* .premium-badge removed */


.check-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  color: #1f8a5b;
  display: grid;
  place-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 2;
}
</style>
