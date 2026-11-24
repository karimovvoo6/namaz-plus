<template>
  <div class="toggle-row">
    <div class="toggle-label">
      <div class="toggle-title">{{ title }}</div>
      <div v-if="subtitle" class="toggle-subtitle">{{ subtitle }}</div>
    </div>

    <label class="toggle-switch">
      <input
        type="checkbox"
        :checked="modelValue"
        @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
      />
      <span class="slider" />
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  modelValue: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: boolean];
}>();
</script>

<style scoped>
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: transparent;
  width: 100%;
  position: relative;
}

/* Remove default top border */
.toggle-row + .toggle-row {
  border-top: none;
}

/* Inset line starting from left padding */
.toggle-row:not(:first-child)::before {
  content: "";
  position: absolute;
  top: 0;
  left: 16px;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.toggle-label {
  flex: 1;
  padding-right: 16px;
}

.toggle-title {
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  font-weight: 600; /* Matching WidgetsView/PrayerSettings style */
}

.toggle-subtitle {
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  margin-top: 2px;
  line-height: 1.4;
}

.toggle-switch {
  position: relative;
  width: 50px;
  height: 30px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.3s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1f8a5b;
}

input:checked + .slider:before {
  transform: translateX(20px);
}
</style>
