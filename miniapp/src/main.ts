import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { pinia } from './store';
import { i18n } from './i18n';
import './styles/theme.css';
import './style.css';

// Инициализация Telegram WebApp
if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  window.Telegram.WebApp.expand();
  window.Telegram.WebApp.ready();
}

const app = createApp(App);
app.use(pinia);
app.use(router);
app.use(i18n);

// Загрузка данных из localStorage
import { useLocationStore } from './stores/locationStore';
import { useSettingsStore } from './stores/settingsStore';
import { useProfileStore } from './stores/profileStore';
import { useNotificationStore } from './stores/notificationStore';
import { useAppearanceStore } from './stores/appearanceStore';
import { useWidgetsStore } from './stores/widgetsStore';
import { usePrayerSettingsStore } from './stores/prayerSettingsStore';
import { useDhikrStore } from './stores/dhikrStore';
import { useThemeStore } from './stores/themeStore';


const locationStore = useLocationStore();
const settingsStore = useSettingsStore();
const profileStore = useProfileStore();
const notificationStore = useNotificationStore();
const appearanceStore = useAppearanceStore();
const widgetsStore = useWidgetsStore();
const prayerSettingsStore = usePrayerSettingsStore();
const dhikrStore = useDhikrStore();
const themeStore = useThemeStore();


locationStore.loadFromStorage();
settingsStore.loadFromStorage();
profileStore.loadFromStorage();
notificationStore.loadFromStorage();
appearanceStore.loadFromStorage();
widgetsStore.loadFromStorage();
prayerSettingsStore.loadFromStorage();
dhikrStore.loadFromStorage();
themeStore.loadFromStorage();


// Синхронизация языка с i18n
i18n.global.locale.value = settingsStore.language;

// PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator && !window.Telegram?.WebApp?.initData) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('SW registration failed:', err);
    });
  });
}

app.mount('#app');
