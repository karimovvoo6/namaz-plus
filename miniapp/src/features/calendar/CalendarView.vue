<template>
  <div class="calendar-view">
    <div class="bg" :style="themeStore.backgroundStyle" />

    <div class="content">
      <div class="top-bar">
        <button class="back-btn" @click="close" aria-label="Назад">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M19 12H5M12 19l-7-7 7-7"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <div class="title">{{ $t('calendar.title') }}</div>
        <div style="width: 40px"></div>
      </div>

      <div class="calendar-content">
        <!-- 1) Карточка выбранного / сегодняшнего дня -->
        <div class="today-section">
          <div class="date-card">
            <div class="gregorian-date">{{ selectedGregorianFormatted }}</div>
            <div class="hijri-date">{{ selectedHijriFormatted }}</div>

            <!-- Бейдж исламского события на выбранный день (если есть) -->
            <div v-if="selectedDayEvent" class="holiday-badge">
              <span class="holiday-icon">🌙</span>
              <span class="holiday-text">{{ selectedDayEvent.name }}</span>
            </div>

            <!-- Кнопка возврата к сегодняшнему дню, если выбран другой день -->
            <button
              v-if="!isSameDay(selectedDate, now)"
              class="today-btn"
              @click="selectToday"
            >
              {{ currentLocale === 'tj' ? 'Ба имрӯз' : currentLocale === 'en' ? 'Today' : 'Сегодня' }}
            </button>
          </div>
        </div>

        <!-- 2) Интерактивная сетка месяца -->
        <div class="calendar-grid-card">
          <!-- Шапка навигации по месяцам -->
          <div class="month-nav">
            <button class="nav-btn" @click="prevMonth" aria-label="Предыдущий месяц">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="month-title-wrap">
              <div class="month-title">{{ currentMonthTitle }}</div>
              <div class="month-hijri-sub">{{ currentMonthHijriSub }}</div>
            </div>
            <button class="nav-btn" @click="nextMonth" aria-label="Следующий месяц">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 18l6-6-6-6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Дни недели -->
          <div class="weekdays-row">
            <span
              v-for="(dayName, index) in weekdayNames"
              :key="dayName"
              class="weekday-col"
              :class="{ 'friday': index === 4 }"
            >
              {{ dayName }}
            </span>
          </div>

          <!-- Сетка дней -->
          <div class="days-grid">
            <div
              v-for="day in monthDays"
              :key="day.dateKey"
              class="day-cell"
              :class="{
                'not-current-month': !day.isCurrentMonth,
                'is-today': isSameDay(day.date, now),
                'is-selected': isSameDay(day.date, selectedDate),
                'has-event': Boolean(day.holiday)
              }"
              @click="onSelectDay(day.date)"
            >
              <div class="gregorian-num">{{ day.date.getDate() }}</div>
              <div class="hijri-num">{{ day.hijriDay }}</div>
              <div v-if="day.holiday" class="event-dot" :title="day.holiday.name"></div>
            </div>
          </div>
        </div>

        <!-- 3) Блок исламских событий и священных дат -->
        <div class="events-section">
          <div class="events-card">
            <div class="events-header">
              <span class="events-icon">🌙</span>
              <span class="events-title">
                {{ currentLocale === 'tj' ? 'Рӯйдодҳои муҳими исломӣ' : currentLocale === 'en' ? 'Important Islamic Dates' : 'Памятные исламские даты' }}
              </span>
            </div>

            <div class="events-list">
              <div
                v-for="item in localizedHolidays"
                :key="item.key"
                class="event-item"
              >
                <div class="event-left">
                  <div class="event-hijri-tag">{{ item.hijriText }}</div>
                </div>
                <div class="event-right">
                  <div class="event-name">{{ item.name }}</div>
                  <div class="event-desc">{{ item.desc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '../../stores/settingsStore';
import { useThemeStore } from '../../stores/themeStore';

const router = useRouter();
const { t } = useI18n();
const settingsStore = useSettingsStore();
const themeStore = useThemeStore();

const now = ref(new Date());
const selectedDate = ref(new Date());

// Просмотр года и месяца в сетке
const viewYear = ref(now.value.getFullYear());
const viewMonth = ref(now.value.getMonth()); // 0-indexed

const currentLocale = computed(() => settingsStore.language || 'ru');

/* ===== ИСЛАМСКИЕ ПРАЗДНИКИ (Хиджра) ===== */
interface IslamicHolidayDef {
  key: string;
  month: number; // 1-12
  day: number;
  hijriRu: string;
  hijriTj: string;
  hijriEn: string;
  nameRu: string;
  nameTj: string;
  nameEn: string;
  descRu: string;
  descTj: string;
  descEn: string;
}

const ISLAMIC_HOLIDAYS: IslamicHolidayDef[] = [
  {
    key: 'muharram',
    month: 1,
    day: 1,
    hijriRu: '1 Мухаррам',
    hijriTj: '1 Муҳаррам',
    hijriEn: '1 Muharram',
    nameRu: 'Исламский Новый год',
    nameTj: 'Соли нави ҳиҷрӣ',
    nameEn: 'Islamic New Year',
    descRu: 'Начало нового года по мусульманскому календарю (Хиджра)',
    descTj: 'Оғози соли нави ҳиҷрӣ',
    descEn: 'Beginning of the new Hijri year',
  },
  {
    key: 'ashura',
    month: 1,
    day: 10,
    hijriRu: '10 Мухаррам',
    hijriTj: '10 Муҳаррам',
    hijriEn: '10 Muharram',
    nameRu: 'День Ашура',
    nameTj: 'Рӯзи Ошӯро',
    nameEn: 'Day of Ashura',
    descRu: 'Благословенный день поста и поминания пророков',
    descTj: 'Рӯзи мубораки рӯза ва ёдбуди паёмбарон',
    descEn: 'Blessed day of fasting and historic deliverance',
  },
  {
    key: 'mawlid',
    month: 3,
    day: 12,
    hijriRu: '12 Раби аль-Авваль',
    hijriTj: '12 Рабеъ-ул-аввал',
    hijriEn: '12 Rabi al-Awwal',
    nameRu: 'Мавлид ан-Наби',
    nameTj: 'Мавлуди Паёмбар (с)',
    nameEn: 'Mawlid an-Nabi',
    descRu: 'День рождения Пророка Мухаммада ﷺ',
    descTj: 'Зодрӯзи ҳазрати Муҳаммад ﷺ',
    descEn: 'Observance of the birthday of Prophet Muhammad ﷺ',
  },
  {
    key: 'miraj',
    month: 7,
    day: 27,
    hijriRu: '27 Раджаб',
    hijriTj: '27 Раҷаб',
    hijriEn: '27 Rajab',
    nameRu: 'Исра и Мирадж',
    nameTj: 'Шаби Меъроҷ',
    nameEn: 'Isra and Mi\'raj',
    descRu: 'Ночь чудесного перенесения и вознесения Пророка ﷺ',
    descTj: 'Сафари шабона ва болоравии Паёмбар ﷺ ба осмон',
    descEn: 'Night of the miraculous Journey and Ascension',
  },
  {
    key: 'baraat',
    month: 8,
    day: 15,
    hijriRu: '15 Шаабан',
    hijriTj: '15 Шаъбон',
    hijriEn: '15 Sha\'ban',
    nameRu: 'Ночь Бараат',
    nameTj: 'Шаби Бароат',
    nameEn: 'Laylat al-Bara\'at',
    descRu: 'Благословенная ночь молитв и прощения грехов',
    descTj: 'Шаби бобаракати омурзиш ва тоат',
    descEn: 'Night of records and seeking forgiveness',
  },
  {
    key: 'ramadan_start',
    month: 9,
    day: 1,
    hijriRu: '1 Рамадан',
    hijriTj: '1 Рамазон',
    hijriEn: '1 Ramadan',
    nameRu: 'Начало месяца Рамадан',
    nameTj: 'Оғози моҳи Рамазон',
    nameEn: 'First Day of Ramadan',
    descRu: 'Первый день священного мусульманского поста',
    descTj: 'Рӯзи нахустини рӯзаи фарз',
    descEn: 'Beginning of the holy month of fasting',
  },
  {
    key: 'qadr',
    month: 9,
    day: 27,
    hijriRu: '27 Рамадан',
    hijriTj: '27 Рамазон',
    hijriEn: '27 Ramadan',
    nameRu: 'Ночь аль-Кадр (Предопределения)',
    nameTj: 'Шаби Қадр',
    nameEn: 'Laylat al-Qadr',
    descRu: 'Священная ночь ниспослания Корана, лучше 1000 месяцев',
    descTj: 'Шаби нузули Қуръони Карим, беҳтар аз ҳазор моҳ',
    descEn: 'The Night of Power, better than a thousand months',
  },
  {
    key: 'eid_fitr',
    month: 10,
    day: 1,
    hijriRu: '1 Шавваль',
    hijriTj: '1 Шаввол',
    hijriEn: '1 Shawwal',
    nameRu: 'Ураза-Байрам (Ид аль-Фитр)',
    nameTj: 'Иди Рамазон (Иди Фитр)',
    nameEn: 'Eid al-Fitr',
    descRu: 'Праздник окончания священного месяца поста Рамадан',
    descTj: 'Иди саиди анҷоми моҳи мубораки Рамазон',
    descEn: 'Festival marking the end of Ramadan',
  },
  {
    key: 'arafah',
    month: 12,
    day: 9,
    hijriRu: '9 Зуль-Хиджа',
    hijriTj: '9 Зулҳиҷҷа',
    hijriEn: '9 Dhu al-Hijjah',
    nameRu: 'День Арафа',
    nameTj: 'Рӯзи Арафа',
    nameEn: 'Day of Arafah',
    descRu: 'День стояния на горе Арафат, великий день Хаджа',
    descTj: 'Рӯзи истодан дар кӯҳи Арафот ҳангоми Ҳаҷ',
    descEn: 'The pinnacle day of the Hajj pilgrimage',
  },
  {
    key: 'eid_adha',
    month: 12,
    day: 10,
    hijriRu: '10 Зуль-Хиджа',
    hijriTj: '10 Зулҳиҷҷа',
    hijriEn: '10 Dhu al-Hijjah',
    nameRu: 'Курбан-Байрам (Ид аль-Адха)',
    nameTj: 'Иди Қурбон (Иди Азҳо)',
    nameEn: 'Eid al-Adha',
    descRu: 'Праздник жертвоприношения и благодарности Всевышнему',
    descTj: 'Иди бузурги қурбонӣ ва саховату раҳмат',
    descEn: 'Feast of the Sacrifice',
  },
];

/* ===== ФУНКЦИИ ВЫЧИСЛЕНИЯ ХИДЖРЫ ===== */
function getHijriParts(d: Date): { month: number; day: number; year: number } {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-nu-latn', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }).formatToParts(d);
    const m = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10);
    const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
    const y = parseInt(parts.find((p) => p.type === 'year')?.value || '1448', 10);
    return { month: m, day, year: y };
  } catch {
    return { month: 1, day: d.getDate(), year: 1448 };
  }
}

function findHolidayForDate(d: Date): { name: string; desc: string } | null {
  const h = getHijriParts(d);
  const found = ISLAMIC_HOLIDAYS.find(
    (item) => item.month === h.month && item.day === h.day
  );
  if (!found) return null;

  if (currentLocale.value === 'tj') {
    return { name: found.nameTj, desc: found.descTj };
  }
  if (currentLocale.value === 'en') {
    return { name: found.nameEn, desc: found.descEn };
  }
  return { name: found.nameRu, desc: found.descRu };
}

/* ===== ВЫЧИСЛЯЕМЫЕ СВОЙСТВА ===== */
const selectedGregorianFormatted = computed(() => {
  return new Intl.DateTimeFormat(
    settingsStore.language === 'tj' ? 'tg-TJ' : settingsStore.language,
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  ).format(selectedDate.value);
});

const selectedHijriFormatted = computed(() => {
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return formatter.format(selectedDate.value);
  } catch (err) {
    return t('calendar.hijriFallback');
  }
});

const selectedDayEvent = computed(() => {
  return findHolidayForDate(selectedDate.value);
});

/* Заголовок текущего месяца в сетке */
const currentMonthTitle = computed(() => {
  const d = new Date(viewYear.value, viewMonth.value, 1);
  return new Intl.DateTimeFormat(
    settingsStore.language === 'tj' ? 'tg-TJ' : settingsStore.language,
    { month: 'long', year: 'numeric' }
  ).format(d);
});

/* Подзаголовок месяца по Хиджре */
const currentMonthHijriSub = computed(() => {
  const d = new Date(viewYear.value, viewMonth.value, 15);
  try {
    const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(d);
  } catch {
    return '';
  }
});

/* Названия дней недели (начиная с Пн) */
const weekdayNames = computed(() => {
  if (currentLocale.value === 'tj') {
    return ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шб', 'Як'];
  }
  if (currentLocale.value === 'en') {
    return ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  }
  return ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
});

/* Список праздников на выбранном языке */
const localizedHolidays = computed(() => {
  return ISLAMIC_HOLIDAYS.map((h) => {
    let name = h.nameRu;
    let desc = h.descRu;
    let hijriText = h.hijriRu;

    if (currentLocale.value === 'tj') {
      name = h.nameTj;
      desc = h.descTj;
      hijriText = h.hijriTj;
    } else if (currentLocale.value === 'en') {
      name = h.nameEn;
      desc = h.descEn;
      hijriText = h.hijriEn;
    }

    return {
      key: h.key,
      name,
      desc,
      hijriText,
    };
  });
});

/* Сетка дней месяца */
interface MonthDayItem {
  date: Date;
  dateKey: string;
  isCurrentMonth: boolean;
  hijriDay: number;
  holiday: { name: string; desc: string } | null;
}

const monthDays = computed<MonthDayItem[]>(() => {
  const year = viewYear.value;
  const month = viewMonth.value;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Смещение от понедельника: Mon=0, Tue=1 ... Sun=6
  const startDayOfWeek = (firstDay.getDay() + 6) % 7;
  const days: MonthDayItem[] = [];

  // Дни предыдущего месяца для заполнения первой недели
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, prevMonthLastDay - i);
    const h = getHijriParts(d);
    days.push({
      date: d,
      dateKey: `prev-${d.getTime()}`,
      isCurrentMonth: false,
      hijriDay: h.day,
      holiday: findHolidayForDate(d),
    });
  }

  // Дни текущего месяца
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    const h = getHijriParts(d);
    days.push({
      date: d,
      dateKey: `cur-${d.getTime()}`,
      isCurrentMonth: true,
      hijriDay: h.day,
      holiday: findHolidayForDate(d),
    });
  }

  // Дни следующего месяца для завершения сетки (до полных недель)
  const remainder = days.length % 7;
  if (remainder !== 0) {
    const need = 7 - remainder;
    for (let i = 1; i <= need; i++) {
      const d = new Date(year, month + 1, i);
      const h = getHijriParts(d);
      days.push({
        date: d,
        dateKey: `next-${d.getTime()}`,
        isCurrentMonth: false,
        hijriDay: h.day,
        holiday: findHolidayForDate(d),
      });
    }
  }

  return days;
});

/* ===== ДЕЙСТВИЯ ===== */
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function prevMonth() {
  if (viewMonth.value === 0) {
    viewMonth.value = 11;
    viewYear.value--;
  } else {
    viewMonth.value--;
  }
}

function nextMonth() {
  if (viewMonth.value === 11) {
    viewMonth.value = 0;
    viewYear.value++;
  } else {
    viewMonth.value++;
  }
}

function onSelectDay(d: Date) {
  selectedDate.value = d;
  // Если выбрали день соседнего месяца, переключаем просмотр
  if (d.getMonth() !== viewMonth.value) {
    viewMonth.value = d.getMonth();
    viewYear.value = d.getFullYear();
  }
}

function selectToday() {
  selectedDate.value = new Date();
  viewMonth.value = now.value.getMonth();
  viewYear.value = now.value.getFullYear();
}

function close() {
  if (window.history.length > 1) router.back();
  else router.push('/namaz');
}

onMounted(() => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.expand();
  }
});
</script>

<style scoped>
.calendar-view {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  height: 100dvh;
  z-index: 50;
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;
  background: rgba(20, 30, 35, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  padding-top: max(20px, calc(env(safe-area-inset-top) + 8px));
  gap: 12px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: scale(1.05);
}

.title {
  flex: 1;
  color: rgba(255, 255, 255, 0.92);
  font-weight: 700;
  font-size: 18px;
  text-align: center;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.calendar-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: max(32px, calc(env(safe-area-inset-bottom) + 24px));
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

/* 1) Карточка сегодняшнего / выбранного дня */
.today-section {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

.date-card {
  width: 100%;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  text-align: center;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.gregorian-date {
  font-size: 19px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 8px;
  line-height: 1.3;
  text-transform: capitalize;
}

.hijri-date {
  font-size: 17px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  direction: rtl;
  line-height: 1.4;
}

.holiday-badge {
  margin-top: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: rgba(229, 184, 105, 0.2);
  border: 1px solid rgba(229, 184, 105, 0.4);
  border-radius: 20px;
  color: #f7d58b;
  font-size: 13px;
  font-weight: 600;
}

.today-btn {
  margin-top: 12px;
  padding: 6px 16px;
  background: rgba(31, 138, 91, 0.25);
  border: 1px solid rgba(31, 138, 91, 0.5);
  border-radius: 14px;
  color: #4ade80;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.today-btn:hover {
  background: rgba(31, 138, 91, 0.4);
}

/* 2) Карточка сетки месяца */
.calendar-grid-card {
  width: 100%;
  max-width: 500px;
  padding: 20px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 0 4px;
}

.nav-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.month-title-wrap {
  text-align: center;
}

.month-title {
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  text-transform: capitalize;
}

.month-hijri-sub {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 2px;
  direction: rtl;
}

.weekdays-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 8px;
}

.weekday-col {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
  padding: 6px 0;
}

.weekday-col.friday {
  color: #4ade80;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.day-cell {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid transparent;
}

.day-cell:hover {
  background: rgba(255, 255, 255, 0.12);
}

.day-cell.not-current-month {
  opacity: 0.25;
}

.day-cell.is-today {
  background: rgba(31, 138, 91, 0.35);
  border: 1.5px solid #2ebd85;
}

.day-cell.is-selected:not(.is-today) {
  background: rgba(255, 255, 255, 0.2);
  border: 1.5px solid rgba(255, 255, 255, 0.5);
}

.gregorian-num {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.1;
}

.hijri-num {
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.1;
  margin-top: 3px;
}

.event-dot {
  position: absolute;
  bottom: 3px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #f7d58b;
  box-shadow: 0 0 4px #f7d58b;
}

/* 3) Блок исламских событий */
.events-section {
  width: 100%;
  max-width: 500px;
}

.events-card {
  padding: 18px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.events-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.events-icon {
  font-size: 18px;
}

.events-title {
  font-size: 16px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.95);
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  transition: background 0.2s ease;
}

.event-item:hover {
  background: rgba(255, 255, 255, 0.07);
}

.event-left {
  flex-shrink: 0;
  width: 136px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-hijri-tag {
  display: block;
  width: 100%;
  text-align: center;
  padding: 6px 8px;
  background: rgba(229, 184, 105, 0.15);
  border: 1px solid rgba(229, 184, 105, 0.3);
  border-radius: 10px;
  color: #f7d58b;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: -0.2px;
  box-sizing: border-box;
}

.event-right {
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 14px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.92);
  line-height: 1.3;
}

.event-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.35;
  margin-top: 3px;
}

@media (max-width: 380px) {
  .event-item {
    gap: 10px;
    padding: 10px 10px;
  }
  .event-left {
    width: 122px;
  }
  .event-hijri-tag {
    font-size: 10.5px;
    padding: 5px 4px;
  }
  .event-name {
    font-size: 13px;
  }
  .event-desc {
    font-size: 11px;
  }
}
</style>
