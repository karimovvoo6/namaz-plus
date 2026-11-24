<template>
  <Teleport to="#app">
    <Transition name="sheet">
      <div v-if="modelValue" class="bottom-sheet-overlay" @click.self="handleClose">
        <div class="bottom-sheet" :class="{ 'sheet-fullscreen': fullscreen }" @click.stop>
          <div v-if="showHandle" class="sheet-handle" @mousedown="handleDragStart" />
          <div class="sheet-header" v-if="$slots.header || title">
            <slot name="header">
              <div v-if="title" class="sheet-title">{{ title }}</div>
              <button v-if="showClose" class="sheet-close" @click="handleClose" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                  />
                </svg>
              </button>
            </slot>
          </div>
          <div class="sheet-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';


const props = withDefaults(defineProps<{
  modelValue: boolean;
  title?: string;
  showHandle?: boolean;
  showClose?: boolean;
  fullscreen?: boolean;
}>(), {
  showHandle: true,
  showClose: true,
  fullscreen: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

let startY = 0;
let currentY = 0;
let isDragging = false;

function handleClose() {
  emit('update:modelValue', false);
  emit('close');
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

function getClientY(e: MouseEvent | TouchEvent): number {
  if ('touches' in e) {
    const t = e.touches[0] ?? e.changedTouches[0];
    return t?.clientY ?? 0;
  }
  return e.clientY;
}

function handleDragStart(e: MouseEvent | TouchEvent) {
  isDragging = true;
  startY = getClientY(e);
  currentY = startY;
  
  document.addEventListener('mousemove', handleDrag);
  document.addEventListener('mouseup', handleDragEnd);
  document.addEventListener('touchmove', handleDrag);
  document.addEventListener('touchend', handleDragEnd);
}

function handleDrag(e: MouseEvent | TouchEvent) {
  if (!isDragging) return;
  currentY = getClientY(e);
}

function handleDragEnd() {
  if (!isDragging) return;
  
  const diff = currentY - startY;
  if (diff > 100) {
    handleClose();
  }
  
  isDragging = false;
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', handleDragEnd);
}

onMounted(() => {
  if (props.modelValue && window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});

onUnmounted(() => {
  document.removeEventListener('mousemove', handleDrag);
  document.removeEventListener('mouseup', handleDragEnd);
  document.removeEventListener('touchmove', handleDrag);
  document.removeEventListener('touchend', handleDragEnd);
});
</script>

<style scoped>
.bottom-sheet-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.bottom-sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background: rgba(20, 30, 35, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  padding: 12px 16px max(16px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.4);
}

.bottom-sheet.sheet-fullscreen {
  max-height: 100vh;
  border-radius: 0;
}

.sheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 12px;
  cursor: grab;
}

.sheet-handle:active {
  cursor: grabbing;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0 16px;
  min-height: 40px;
}

.sheet-title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.2px;
}

.sheet-close {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sheet-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.sheet-content {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

/* Transitions */
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}

.sheet-enter-active .bottom-sheet,
.sheet-leave-active .bottom-sheet {
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
}

.sheet-enter-from {
  opacity: 0;
}

.sheet-enter-from .bottom-sheet {
  transform: translateY(100%);
}

.sheet-leave-to {
  opacity: 0;
}

.sheet-leave-to .bottom-sheet {
  transform: translateY(100%);
}
</style>
