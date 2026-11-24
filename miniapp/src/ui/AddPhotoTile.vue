<template>
  <button class="add-photo-tile" @click="handleClick">
    <input
      ref="fileInput"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      class="file-input"
      @change="handleFileChange"
    />
    <div class="add-icon">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 5v14M5 12h14"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <div class="add-text">Добавить фото</div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const emit = defineEmits<{
  add: [base64: string];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

function handleClick() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result === 'string') {
      emit('add', result);
    }
  };
  reader.readAsDataURL(file);
  
  // Reset input
  if (target) {
    target.value = '';
  }
}
</script>

<style scoped>
.add-photo-tile {
  width: 120px;
  height: 160px;
  min-width: 120px;
  border-radius: 16px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.add-photo-tile:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.08);
}

.file-input {
  display: none;
}

.add-icon {
  color: rgba(255, 255, 255, 0.7);
}

.add-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}
</style>
