import { createI18n } from 'vue-i18n';
import ru from './locales/ru.json';
import tj from './locales/tj.json';
import en from './locales/en.json';

export type SupportedLocale = 'ru' | 'tj' | 'en';

export const i18n = createI18n({
  
  legacy: false,
  locale: 'ru',
  fallbackLocale: 'ru',
  messages: {
    ru,
    tj,
    en,
  },
});

