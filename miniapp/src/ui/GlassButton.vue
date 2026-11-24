<template>
  <button
    :class="['glass-button', { 'glass-button--capsule': capsule }]"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  capsule?: boolean;
}>();

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style scoped>
.glass-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  padding: 0;
  margin: 0;
  font-family: inherit;
  font-size: inherit;
  line-height: 1;
}

.glass-button:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.glass-button:active {
  transform: scale(0.98);
  background: rgba(255, 255, 255, 0.15);
}

.glass-button--capsule {
  border-radius: 20px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.3px;
}
</style>
