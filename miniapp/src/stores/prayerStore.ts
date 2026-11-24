import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLocationStore } from './locationStore';
import { useSettingsStore } from './settingsStore';

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'tahajjud';

export interface PrayerTime {
  name: PrayerName;
  at: string; // HH:MM
}

export type NextPrayer = PrayerTime & { tomorrow: boolean };

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud'];

// ✅ Адрес API твоего бота (можешь менять в .env)
const BOT_API_BASE = import.meta.env.VITE_BOT_API_BASE ?? 'http://localhost:8080';

function normalizeHHMM(value: string): string {
  const v = (value ?? '').trim();
  return v.slice(0, 5);
}

type BotApiResponse = {
  source: string;
  date: string;
  city?: string;
  timings: {
    Fajr: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
};

function toPrayerListFromBot(t: BotApiResponse['timings']): PrayerTime[] {
  return [
    { name: 'fajr', at: normalizeHHMM(t.Fajr) },
    { name: 'dhuhr', at: normalizeHHMM(t.Dhuhr) },
    { name: 'asr', at: normalizeHHMM(t.Asr) },
    { name: 'maghrib', at: normalizeHHMM(t.Maghrib) },
    { name: 'isha', at: normalizeHHMM(t.Isha) },
  ];
}

function formatISODate(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function calculateTahajjud(maghribHHMM: string, fajrHHMM: string): string {
  const mParts = maghribHHMM.split(':').map(Number);
  const fParts = fajrHHMM.split(':').map(Number);
  const mH = mParts[0] ?? 0;
  const mM = mParts[1] ?? 0;
  const fH = fParts[0] ?? 0;
  const fM = fParts[1] ?? 0;
  const maghribMins = mH * 60 + mM;
  const fajrMins = fH * 60 + fM + (24 * 60);
  const nightDuration = fajrMins - maghribMins;
  const lastThirdMins = fajrMins - Math.floor(nightDuration / 3);
  const tH = Math.floor(lastThirdMins / 60) % 24;
  const tM = lastThirdMins % 60;
  return `${String(tH).padStart(2, '0')}:${String(tM).padStart(2, '0')}`;
}

const defaultPrayers: PrayerTime[] = [
  { name: 'fajr', at: '00:00' },
  { name: 'dhuhr', at: '00:00' },
  { name: 'asr', at: '00:00' },
  { name: 'maghrib', at: '00:00' },
  { name: 'isha', at: '00:00' },
];

export const usePrayerStore = defineStore('prayer', () => {
  const prayers = ref<PrayerTime[]>([...defaultPrayers]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const selectedPrayer = ref<PrayerTime | null>(null);


  const byName = computed<Record<PrayerName, PrayerTime | undefined>>(() => {
    const map = {} as Record<PrayerName, PrayerTime | undefined>;
    for (const p of prayers.value) map[p.name] = p;
    return map;
  });

  // ✅ ВАЖНО: теперь shuroiulamo ветка берёт данные из API твоего бота
  async function fetchFromBotApi(lat: number, lng: number, date: Date): Promise<PrayerTime[]> {
    const base = BOT_API_BASE === '/api' ? '' : BOT_API_BASE;
    const url = new URL(`${base}/api/prayer-times`, window.location.origin);
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lng', String(lng));
    url.searchParams.set('date', formatISODate(date));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Bot API HTTP ${res.status}`);

      const data = (await res.json()) as BotApiResponse;

      if (!data?.timings?.Fajr) throw new Error('Bot API: invalid response');

      return toPrayerListFromBot(data.timings);
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Превышено время ожидания. Проверьте интернет.');
      }
      throw err;
    }
  }

  // ✅ Прямой запрос к Aladhan API (работает автономно без бэкенда)
  async function fetchFromAladhan(lat: number, lng: number, date: Date): Promise<PrayerTime[]> {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;

    const url = new URL(`https://api.aladhan.com/v1/timings/${dateStr}`);
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set('method', '3'); // Muslim World League (MWL)
    url.searchParams.set('school', '1'); // Hanafi

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const res = await fetch(url.toString(), { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`Aladhan API HTTP ${res.status}`);

      const data = await res.json();
      const timings = data?.data?.timings;

      if (!timings?.Fajr) throw new Error('Aladhan API: invalid response');

      return [
        { name: 'fajr', at: normalizeHHMM(timings.Fajr) },
        { name: 'dhuhr', at: normalizeHHMM(timings.Dhuhr) },
        { name: 'asr', at: normalizeHHMM(timings.Asr) },
        { name: 'maghrib', at: normalizeHHMM(timings.Maghrib) },
        { name: 'isha', at: normalizeHHMM(timings.Isha) },
      ];
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error('Превышено время ожидания. Проверьте интернет.');
      }
      throw err;
    }
  }

  async function fetchPrayerTimes(lat: number, lng: number, date: Date = new Date()) {
    error.value = null;

    if (!navigator.onLine) {
      error.value = 'Нет подключения к интернету';
      prayers.value = [...defaultPrayers];
      return;
    }

    isLoading.value = true;
    const settingsStore = useSettingsStore();

    try {
      let list: PrayerTime[];

      // Проверяем, настроен ли отдельный бэкенд бота (полный URL, отличный от localhost)
      const hasCustomBotApi =
        Boolean(BOT_API_BASE) &&
        !BOT_API_BASE.includes('localhost') &&
        BOT_API_BASE !== '/api' &&
        (BOT_API_BASE.startsWith('http://') || BOT_API_BASE.startsWith('https://'));

      if (settingsStore.prayerTimesSource === 'shuroiulamo' && hasCustomBotApi) {
        try {
          list = await fetchFromBotApi(lat, lng, date);
        } catch (botErr) {
          console.warn('Bot API unavailable, falling back to direct Aladhan API:', botErr);
          list = await fetchFromAladhan(lat, lng, date);
        }
      } else {
        list = await fetchFromAladhan(lat, lng, date);
      }

      const maghrib = list.find(p => p.name === 'maghrib');
      const fajr = list.find(p => p.name === 'fajr');

      if (settingsStore.tahajjudEnabled && maghrib && fajr) {
        list.push({
          name: 'tahajjud',
          at: calculateTahajjud(maghrib.at, fajr.at)
        });
      }

      list.sort((a, b) => PRAYER_ORDER.indexOf(a.name) - PRAYER_ORDER.indexOf(b.name));
      console.log('DEBUG: Final prayer list length:', list.length, 'Tahajjud enabled:', settingsStore.tahajjudEnabled);
      prayers.value = list;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки времени намаза';
      prayers.value = [...defaultPrayers];
      console.error('Failed to fetch prayer times:', err);
    } finally {
      isLoading.value = false;
    }
  }

  async function updatePrayerTimes(date: Date = new Date()) {
    const locationStore = useLocationStore();
    const lat = locationStore.currentLocation?.latitude ?? 40.2856;
    const lng = locationStore.currentLocation?.longitude ?? 69.6229;

    await fetchPrayerTimes(lat, lng, date);
  }

  function selectPrayer(prayer: PrayerTime | null) {
    selectedPrayer.value = prayer;
  }

  return {
    prayers,
    byName,
    isLoading,
    error,
    selectedPrayer,
    fetchPrayerTimes,
    updatePrayerTimes,
    selectPrayer,
  };
});
