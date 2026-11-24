import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Widget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const useWidgetsStore = defineStore('widgets', () => {
  const widgets = ref<Widget[]>([
    {
      id: 'next-prayer',
      name: 'Следующий намаз',
      description: 'Показывать следующий намаз на главном экране',
      enabled: true,
    },
    {
      id: 'timer',
      name: 'Таймер до намаза',
      description: 'Отсчёт времени до следующего намаза',
      enabled: true,
    },
  ]);

  function toggleWidget(widgetId: string, enabled: boolean) {
    const widget = widgets.value.find((w) => w.id === widgetId);
    if (widget) {
      widget.enabled = enabled;
      saveToStorage();
    }
  }

  function isWidgetEnabled(widgetId: string): boolean {
    const widget = widgets.value.find((w) => w.id === widgetId);
    return widget?.enabled ?? false;
  }

  function saveToStorage() {
    localStorage.setItem('widgets', JSON.stringify(widgets.value));
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('widgets');
      if (stored) {
        const parsed = JSON.parse(stored);
        widgets.value = parsed.map((w: Widget) => ({
          ...widgets.value.find((defaultW) => defaultW.id === w.id) || w,
          enabled: w.enabled,
        }));
      }
    } catch (err) {
      console.error('Failed to load widgets from storage:', err);
    }
  }

  return {
    widgets,
    toggleWidget,
    isWidgetEnabled,
    loadFromStorage,
  };
});
