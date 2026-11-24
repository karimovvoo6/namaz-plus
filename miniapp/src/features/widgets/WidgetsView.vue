<template>
  <div class="widgets-view">
    <div class="backdrop" @click="close" />

    <div class="sheet" @click.stop>
      <header class="header">
        <div class="title">{{ $t('widgets.title') }}</div>
        <button class="closeBtn" @click="close" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </header>

      <div class="content">
        <SettingsCard>
          <SettingsToggleRow
            v-for="widget in widgetsStore.widgets"
            :key="widget.id"
            :title="getWidgetName(widget.id)"
            :subtitle="getWidgetDesc(widget.id)"
            :model-value="widget.enabled"
            @update:model-value="(val) => handleToggleWidget(widget.id, val)"
          />
        </SettingsCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useWidgetsStore } from '../../stores/widgetsStore';
import SettingsCard from '../profile/components/SettingsCard.vue';
import SettingsToggleRow from '../profile/components/SettingsToggleRow.vue';

const router = useRouter();
const { t } = useI18n();
const widgetsStore = useWidgetsStore();

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/profile');
}

function getWidgetName(widgetId: string): string {
  if (widgetId === 'next-prayer') return t('widgets.nextPrayer');
  if (widgetId === 'timer') return t('widgets.timer');
  return widgetId;
}

function getWidgetDesc(widgetId: string): string {
  if (widgetId === 'next-prayer') return t('widgets.nextPrayerDesc');
  if (widgetId === 'timer') return t('widgets.timerDesc');
  return '';
}

function handleToggleWidget(widgetId: string, enabled: boolean) {
  widgetsStore.toggleWidget(widgetId, enabled);
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}
</script>

<style scoped>
.widgets-view {
  position: absolute;
  inset: 0;
  z-index: 50;
}

.backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.sheet {
  position: absolute;
  inset: 0;
  padding: max(14px, env(safe-area-inset-top)) 14px max(14px, env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #141e23f2;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px;
}

.title {
  color: rgba(255, 255, 255, 0.92);
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 0.2px;
}

.closeBtn {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  display: grid;
  place-items: center;
  cursor: pointer;
}

.content {
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
