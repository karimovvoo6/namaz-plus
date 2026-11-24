<template>
  <div class="hud-view">
    <div class="hud-top" v-if="showNext">
      <span class="hud-label">{{ $t('prayers.next') }}</span>
      <span class="hud-dot">•</span>
      <span class="hud-name">{{ prettyName(nextPrayer.name) }}</span>
      <span v-if="nextPrayer.tomorrow" class="hud-tomorrow">{{ $t('prayers.tomorrow') }}</span>
      <span class="hud-dot">·</span>
      <span class="hud-at">{{ nextPrayer.at }}</span>
    </div>
    <div class="hud-timer" v-if="showTimer">
      <div class="timer-digits">
        <span class="digit-box" :key="timer">{{ timer }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { NextPrayer } from '../../../stores/prayerStore';

defineProps<{
  nextPrayer: NextPrayer;
  timer: string;
  showNext: boolean;
  showTimer: boolean;
}>();

const { t } = useI18n();

function prettyName(name: NextPrayer['name']) {
  return t(`prayers.${name}`);
}
</script>

<style scoped>
.hud-view {
  width: 100%;
  max-width: 430px;
  display: grid;
  place-items: center;
  gap: 16px;
  text-align: center;
}

.hud-top {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  gap: 8px;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.hud-dot {
  opacity: 0.5;
}

.hud-name {
  text-transform: capitalize;
}

.hud-tomorrow {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 400;
}

.hud-timer {
  color: #fff;
  font-weight: 800;
  font-size: min(20vw, 84px);
  line-height: 1;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.timer-digits {
  display: inline-flex;
}

.digit-box {
  display: inline-block;
  animation: tickFade 0.5s ease-out;
}

@keyframes tickFade {
  0% { transform: translateY(5px); opacity: 0.7; }
  100% { transform: translateY(0); opacity: 1; }
}

@media (max-width: 480px) {
  .hud-timer {
    font-size: 72px;
  }
}
</style>
