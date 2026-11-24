import { createRouter, createWebHistory } from 'vue-router';
import NamazView from './features/namaz/NamazView.vue';
import ProfileView from './features/profile/ProfileView.vue';
import LoginView from './features/profile/LoginView.vue';
import LocationPickerView from './features/location/LocationPickerView.vue';
import LanguagePickerView from './features/language/LanguagePickerView.vue';
import PrayerSettingsView from './features/prayer/PrayerSettingsView.vue';
import NotificationsSettingsView from './features/notifications/NotificationsSettingsView.vue';
import AppearanceView from './features/appearance/AppearanceView.vue';
import WidgetsView from './features/widgets/WidgetsView.vue';
import QiblaView from './features/qibla/QiblaView.vue';
import AllahNamesView from './features/allahNames/AllahNamesView.vue';
import DhikrView from './features/dhikr/DhikrView.vue';
import DhikrCounterView from './features/dhikr/DhikrCounterView.vue';
import CalendarView from './features/calendar/CalendarView.vue';
import QuranView from './features/quran/QuranView.vue';
import SurahDetailView from './features/quran/SurahDetailView.vue';
import AboutView from './features/about/AboutView.vue';
import FaqView from './features/faq/FaqView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/namaz' },
    { path: '/namaz', component: NamazView },
    { path: '/profile', component: ProfileView },
    { path: '/login', component: LoginView },
    { path: '/location', component: LocationPickerView },
    { path: '/language', component: LanguagePickerView },
    { path: '/prayer-settings', component: PrayerSettingsView },
    { path: '/notifications', component: NotificationsSettingsView },
    { path: '/appearance', component: AppearanceView },
    { path: '/widgets', component: WidgetsView },
    { path: '/qibla', component: QiblaView },
    { path: '/allah-names', component: AllahNamesView },
    { path: '/dhikr', component: DhikrView },
    { path: '/dhikr/:id', component: DhikrCounterView },
    { path: '/calendar', component: CalendarView },
    { path: '/quran', component: QuranView },
    { path: '/quran/:id', component: SurahDetailView },
    { path: '/about', component: AboutView },
    { path: '/faq', component: FaqView },
  ],
});
