"""Сервис уведомлений о времени намаза."""
import threading
import time
import telebot
from datetime import datetime, timedelta
from config.settings import TAJIKISTAN_TZ, PRAYER_NAMES
from config.logging_config import logger
from services.prayer_api import get_prayer_times
from database.models import get_subscribers, mark_user_blocked, inc_messages_sent

_notify_lock = threading.RLock()

# кэш timings на сутки
_cached_timings = {"date": None, "timings": None}

# заранее вычисленные события на сутки:
# список dict: {"at": datetime, "text": str}
_daily_events: list[dict] = []
_events_date: str | None = None

# время последней проверки, чтобы не слать одно и то же дважды
_last_check: datetime | None = None


def _today_key() -> str:
    """Ключ для текущего дня."""
    return datetime.now(TAJIKISTAN_TZ).strftime("%Y-%m-%d")


def get_timings_cached_today():
    """Вернёт timings на сегодня, обновит кэш только если день сменился/кэша нет."""
    today = _today_key()
    if _cached_timings["date"] != today or _cached_timings["timings"] is None:
        timings = get_prayer_times()
        if timings:
            _cached_timings["date"] = today
            _cached_timings["timings"] = timings
            logger.info("Timings cached for today.")
        else:
            # не затираем прошлый кэш, если API временно упало
            logger.warning("Failed to refresh timings cache (API error).")
    return _cached_timings["timings"]


def rebuild_daily_events_if_needed():
    """Построить события уведомлений на текущий день (если день сменился или пусто)."""
    global _daily_events, _events_date

    today = _today_key()
    if _events_date == today and _daily_events:
        return

    timings = get_timings_cached_today()
    if not timings:
        logger.error("Cannot rebuild daily events: timings is None.")
        return

    now = datetime.now(TAJIKISTAN_TZ)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    events: list[dict] = []
    for prayer_en, prayer_ru in PRAYER_NAMES.items():
        hh, mm = map(int, timings[prayer_en][:5].split(":"))
        prayer_dt = day_start.replace(hour=hh, minute=mm)

        # за 10 минут
        events.append({
            "at": prayer_dt - timedelta(minutes=10),
            "text": f"🔔 *Напоминание*! Время намаза {prayer_ru} наступит через 10 минут, в {timings[prayer_en][:5]}."
        })
        # в момент
        events.append({
            "at": prayer_dt,
            "text": f"🕌 *Время намаза {prayer_ru} ({timings[prayer_en][:5]}) настало!*"
        })

    # сортируем по времени
    events.sort(key=lambda x: x["at"])

    _daily_events = events
    _events_date = today
    logger.info(f"Daily events rebuilt for {today}: {len(events)} events.")


def send_message_batched(bot: telebot.TeleBot, user_ids: list[int], text: str):
    """Отправка пачками + обработка блокировок."""
    if not user_ids:
        return

    batch_size = 50
    pause_seconds = 0.4

    sent_ok = 0

    for i in range(0, len(user_ids), batch_size):
        chunk = user_ids[i:i + batch_size]
        for user_id in chunk:
            try:
                bot.send_message(user_id, text, parse_mode='Markdown')
                sent_ok += 1
            except telebot.apihelper.ApiTelegramException as e:
                if "Forbidden: bot was blocked by the user" in str(e):
                    logger.warning(f"User {user_id} blocked the bot. Marking is_blocked.")
                    mark_user_blocked(user_id)
                else:
                    logger.error(f"Failed to send message to {user_id}: {e}")
            except Exception as e:
                logger.error(f"Failed to send message to {user_id}: {e}")

        time.sleep(pause_seconds)

    if sent_ok:
        inc_messages_sent(sent_ok)


def send_due_events(bot: telebot.TeleBot):
    """
    Частая проверка (например раз в 20-30 секунд):
    отправляет события, которые попали в окно между _last_check и now.
    """
    global _last_check

    with _notify_lock:
        rebuild_daily_events_if_needed()

        if not _daily_events:
            return

        now = datetime.now(TAJIKISTAN_TZ)

        # Первое включение: ставим last_check на "только что", чтобы не слать старые события
        if _last_check is None:
            _last_check = now
            return

        start = _last_check
        end = now
        _last_check = now

        due = [e for e in _daily_events if start < e["at"] <= end]
        if not due:
            return

        user_ids = get_subscribers()  # один раз на все события окна
        for e in due:
            logger.info(f"Sending event scheduled at {e['at'].strftime('%H:%M:%S')}")
            send_message_batched(bot, user_ids, e["text"])


