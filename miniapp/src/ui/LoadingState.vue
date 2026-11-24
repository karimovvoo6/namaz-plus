<template>
  <div class="loading-state">
    <div class="spinner">
      <div class="ring"></div>
      <div class="dot"></div>
      <div class="mosque-icon">🕌</div>
    </div>
    <p class="text">{{ $t('common.loading') }}...</p>
  </div>
</template>

<style scoped>
.loading-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  z-index: 100;
  color: #fff;
}

.spinner {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #1f8a5b;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.dot {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #1f8a5b;
  border-radius: 50%;
  top: 0;
  box-shadow: 0 0 15px #1f8a5b;
}

.mosque-icon {
  font-size: 32px;
  animation: pulse 2s ease-in-out infinite;
}

.text {
  margin-top: 24px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.5px;
  opacity: 0.9;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}
</style>
