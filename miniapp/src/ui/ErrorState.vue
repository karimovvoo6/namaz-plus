<template>
  <div class="error-state">
    <div class="card">
      <div class="icon">⚠</div>
      <h2 class="title">{{ title || $t('error.service_unavailable') }}</h2>
      <p class="message">{{ message || $t('error.try_later') }}</p>
      <button class="retry-btn" @click="$emit('retry')">
        {{ $t('common.retry') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title?: string;
  message?: string;
}>();
</script>

<style scoped>
.error-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 100;
  padding: 24px;
}

.card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  padding: 32px;
  text-align: center;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.title {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
}

.message {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  line-height: 1.5;
  margin-bottom: 24px;
}

.retry-btn {
  background: #1f8a5b;
  color: #fff;
  border: none;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-btn:active {
  transform: scale(0.95);
  opacity: 0.9;
}
</style>
