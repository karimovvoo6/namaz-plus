"""API для получения времени намаза."""
import requests
import json
from datetime import datetime, timedelta
from config.settings import KHUJAND_LAT, KHUJAND_LNG, TAJIKISTAN_TZ, PRAYER_NAMES
from config.logging_config import logger

# In-memory cache for prayer times by date string ('dd-mm-YYYY')
_timings_cache = {}


def get_prayer_times(date=None):
    """Получить время намаза на определенную дату."""
    if date is None:
        date = datetime.now(TAJIKISTAN_TZ)
    
    date_str = date.strftime('%d-%m-%Y')
    if date_str in _timings_cache:
        logger.info(f"Cache hit for date: {date_str}")
        return _timings_cache[date_str]

    for attempt in range(1, 4):
        try:
            url = f"https://api.aladhan.com/v1/timings/{date_str}"
            params = {
                'latitude': KHUJAND_LAT,
                'longitude': KHUJAND_LNG,
                'method': 3,  # Muslim World League (MWL) method - closer to Shuroi Ulamo
                'school': 1   # Hanafi school
            }

            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                logger.error(f"HTTP ошибка {response.status_code} при попытке {attempt}/3")
                continue

            data = response.json()
            if data.get('code') == 200:
                timings = data['data']['timings']
                _timings_cache[date_str] = timings
                return timings

            logger.error(f"API ошибка: {data} при попытке {attempt}/3")
            continue

        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка сети (таймаут/недоступен) при получении времени намаза (попытка {attempt}/3): {e}")
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка декодирования JSON (попытка {attempt}/3): {e}")
        except Exception as e:
            logger.error(f"Неожиданная ошибка получения времени намаза (попытка {attempt}/3): {e}")
            
        import time
        if attempt < 3:
            time.sleep(1)  # пауза перед следующей попыткой

    logger.error("Все 3 попытки получить данные о намазе завершились неудачно.")
    return None


def format_prayer_times_message(timings):
    """Форматировать сообщение с временем намаза."""
    if not timings:
        return "⚠ Не удалось получить данные. Попробуйте позже."

    current_time = datetime.now(TAJIKISTAN_TZ)
    date_str = current_time.strftime('%d.%m.%Y (%A)')

    days_ru = {
        'Monday': 'Понедельник',
        'Tuesday': 'Вторник',
        'Wednesday': 'Среда',
        'Thursday': 'Четверг',
        'Friday': 'Пятница',
        'Saturday': 'Суббота',
        'Sunday': 'Воскресенье'
    }
    for eng, ru in days_ru.items():
        date_str = date_str.replace(eng, ru)

    message = "🕌 *Время намаза в Худжанде*\n"
    message += f"📅 {date_str}\n\n"

    main_prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    current_time_str = current_time.strftime('%H:%M')
    next_prayer = None

    for prayer in main_prayers:
        time_str = timings[prayer][:5]
        prayer_name = PRAYER_NAMES[prayer]

        if not next_prayer and current_time_str < time_str:
            next_prayer = (prayer_name, time_str)
            message += f"▶️ *{prayer_name}: {time_str}* ⏰\n"
        else:
            message += f"{prayer_name}: {time_str}\n"

    message += f"\n🕐 Текущее время: {current_time_str}"

    if next_prayer:
        message += f"\n⏭️ Следующий: {next_prayer[0]} в {next_prayer[1]}"
    else:
        tomorrow = current_time + timedelta(days=1)
        tomorrow_timings = get_prayer_times(tomorrow)
        if tomorrow_timings:
            fajr_time = tomorrow_timings['Fajr'][:5]
            message += f"\n⏭️ Следующий: {PRAYER_NAMES['Fajr']} завтра в {fajr_time}"

    return message


def get_weekly_schedule():
    """Получить расписание на неделю."""
    message = "📅 *Расписание намаза на неделю*\n\n"

    for i in range(7):
        date = datetime.now(TAJIKISTAN_TZ) + timedelta(days=i)
        timings = get_prayer_times(date)

        if not timings and i == 0:
            # Если даже на первый день нет данных, возвращаем сообщение об ошибке
            return "⚠ Не удалось получить данные. Попробуйте позже."

        if timings:
            day_name = date.strftime('%A')
            days_ru = {
                'Monday': 'ПН', 'Tuesday': 'ВТ', 'Wednesday': 'СР',
                'Thursday': 'ЧТ', 'Friday': 'ПТ', 'Saturday': 'СБ', 'Sunday': 'ВС'
            }
            day_ru = days_ru.get(day_name, day_name)
            date_str = date.strftime(f'{day_ru} %d.%m')

            if i == 0:
                date_str += " (сегодня)"
            elif i == 1:
                date_str += " (завтра)"

            message += f"*{date_str}*\n"

            main_prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
            times = [timings[p][:5] for p in main_prayers]
            message += f"`{' | '.join(times)}`\n\n"

    message += "🌅Бомдод | ☀️Пешин | 🌤️Аср | 🌇Шом | 🌙Хуфтан"
    return message


def get_prayer_times_by_coords(lat: float, lng: float, date_iso: str):
    """
    date_iso: 'YYYY-MM-DD'
    Возвращает timings как aladhan: dict с ключами 'Fajr', 'Dhuhr', ...
    """
    for attempt in range(1, 4):
        try:
            # ISO -> dd-mm-YYYY
            yyyy, mm, dd = date_iso.split("-")
            date_str = f"{dd}-{mm}-{yyyy}"

            url = f"https://api.aladhan.com/v1/timings/{date_str}"
            params = {
                'latitude': lat,
                'longitude': lng,
                'method': 3,  # Muslim World League (MWL) method
                'school': 1   # Hanafi
            }

            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                logger.error(f"HTTP ошибка {response.status_code} по координатам при попытке {attempt}/3")
                continue

            data = response.json()
            if data.get('code') == 200:
                return data['data']['timings']

            logger.error(f"API ошибка: {data} при попытке {attempt}/3")
            continue

        except requests.exceptions.RequestException as e:
            logger.error(f"Ошибка сети по координатам (попытка {attempt}/3): {e}")
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка JSON по координатам (попытка {attempt}/3): {e}")
        except Exception as e:
            logger.error(f"Ошибка get_prayer_times_by_coords (попытка {attempt}/3): {e}")
            
        import time
        if attempt < 3:
            time.sleep(1)

    logger.error("Все 3 попытки получить данные о намазе по координатам завершились неудачно.")
    return None
