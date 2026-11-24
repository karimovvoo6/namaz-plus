<template>
  <BottomSheet
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    @close="$emit('close')"
    :title="$t('menu.title')"
  >
    <div class="menu-items">
      <button
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        @click="handleItemClick(item)"
      >
        <div class="menu-icon">{{ item.icon }}</div>
        <div class="menu-content">
          <div class="menu-title">{{ item.title }}</div>
          <div class="menu-description">{{ item.description }}</div>
        </div>
        <div class="menu-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </button>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BottomSheet from '../../../ui/BottomSheet.vue';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  close: [];
}>();

const router = useRouter();
const { t } = useI18n();

const menuItems = computed(() => [
  {
    id: 'allah-names',
    title: t('menu.allahNames'),
    description: t('menu.allahNamesDesc'),
    icon: '📿',
    route: '/allah-names',
  },
  {
    id: 'dhikr',
    title: t('menu.dhikr'),
    description: t('menu.dhikrDesc'),
    icon: '🕋',
    route: '/dhikr',
  },
  {
    id: 'calendar',
    title: t('menu.calendar'),
    description: t('menu.calendarDesc'),
    icon: '📅',
    route: '/calendar',
  },
]);

function handleItemClick(item: any) {
  emit('update:modelValue', false);
  emit('close');
  
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
  
  router.push(item.route);
}
</script>

<style scoped>
.menu-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  color: rgba(255, 255, 255, 0.92);
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateX(4px);
}

.menu-icon {
  font-size: 28px;
  line-height: 1;
  flex-shrink: 0;
}

.menu-content {
  flex: 1;
  min-width: 0;
}

.menu-title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.menu-description {
  font-size: 13px;
  opacity: 0.7;
  line-height: 1.4;
}

.menu-arrow {
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}
</style>
