"""Обработчики сообщений бота."""
import telebot
from config.settings import (
    BTN_NAMAZ, BTN_WEEK, BTN_NOTIFY_ON, BTN_NOTIFY_OFF, BTN_HELP
)
from config.logging_config import logger
from database.models import upsert_user, add_subscriber, remove_subscriber
from services.prayer_api import get_prayer_times, format_prayer_times_message, get_weekly_schedule
from utils.keyboards import create_main_keyboard


def register_handlers(bot: telebot.TeleBot):
    """Регистрация всех обработчиков сообщений."""
    
    @bot.message_handler(commands=['start'])
    def start_message(message):
        try:
            upsert_user(message)

            welcome_text = r"""🕌 *Добро пожаловать в бот времени намаза\!*
Этот бот поможет вам узнать точное время намаза в Худжанде, Таджикистан\.
*Доступные команды:*
/namaz \- Время намаза на сегодня
/week \- Расписание на неделю
/notify \- Включить уведомления
/stop\_notify \- Отключить уведомления
/help \- Помощь"""
            bot.send_message(message.chat.id, welcome_text, parse_mode='MarkdownV2', reply_markup=create_main_keyboard())
            logger.info(f"Новый пользователь: {message.from_user.username or message.from_user.id}")
        except Exception as e:
            logger.error(f"Ошибка в start_message: {e}")
            simple_text = """🕌 Добро пожаловать в бот времени намаза!
Доступные команды:
/namaz - Время намаза на сегодня
/week - Расписание на неделю
/notify - Включить уведомления
/stop_notify - Отключить уведомления
/help - Помощь"""
            bot.send_message(message.chat.id, simple_text, reply_markup=create_main_keyboard())

    @bot.message_handler(func=lambda msg: msg.text in ['/help', BTN_HELP])
    def help_message(message):
        try:
            upsert_user(message)

            help_text = r"""📖 *Помощь по использованию бота*

*Команды:*
• `/namaz` или кнопка *🕌 Сегодня* \- Получить время намаза на сегодня\.
• `/week` или кнопка *📅 Неделя* \- Расписание намаза на неделю\.
• `/notify` или кнопка *🔔 Вкл\. уведомления* \- Подписаться на уведомления о времени намаза\.
• `/stop_notify` или кнопка *🔕 Выкл\. уведомления* \- Отписаться от уведомлений\.

*Особенности:*
• Точное время для Худжанда, Таджикистан\.
• Автоматическое определение следующего намаза\.
• Уведомления за 10 минут до и в момент наступления каждого намаза\.
"""
            bot.send_message(message.chat.id, help_text, parse_mode='MarkdownV2', reply_markup=create_main_keyboard())
        except Exception as e:
            logger.error(f"Ошибка в help_message: {e}")
            simple_text = """Помощь по использованию бота

Команды:
• /namaz - Получить время намаза на сегодня
• /week - Расписание на неделю
• /notify - Подписаться на уведомления
• /stop_notify - Отписаться от уведомлений"""
            bot.send_message(message.chat.id, simple_text, reply_markup=create_main_keyboard())

    @bot.message_handler(func=lambda msg: msg.text in ['/namaz', BTN_NAMAZ])
    def send_prayer_times(message):
        try:
            upsert_user(message)

            bot.send_chat_action(message.chat.id, 'typing')
            timings = get_prayer_times()
            response = format_prayer_times_message(timings)
            bot.send_message(message.chat.id, response, parse_mode='Markdown')
            logger.info(f"Отправлено время намаза пользователю {message.from_user.id}")
        except Exception as e:
            logger.error(f"Ошибка в send_prayer_times: {e}")
            bot.send_message(message.chat.id, "⚠ Не удалось получить данные. Попробуйте позже.")

    @bot.message_handler(func=lambda msg: msg.text in ['/week', BTN_WEEK])
    def send_weekly_schedule(message):
        try:
            upsert_user(message)

            bot.send_chat_action(message.chat.id, 'typing')
            response = get_weekly_schedule()
            bot.send_message(message.chat.id, response, parse_mode='Markdown')
            logger.info(f"Отправлено расписание на неделю пользователю {message.from_user.id}")
        except Exception as e:
            logger.error(f"Ошибка в send_weekly_schedule: {e}")
            bot.send_message(message.chat.id, "⚠ Не удалось получить данные. Попробуйте позже.")

    @bot.message_handler(func=lambda msg: msg.text in ['/notify', BTN_NOTIFY_ON])
    def subscribe_notifications(message):
        try:
            upsert_user(message)

            user_id = message.chat.id
            if add_subscriber(user_id):
                bot.send_message(
                    user_id,
                    "✅ Вы подписались на уведомления о времени намаза!\n\n"
                    "Вы будете получать напоминания за 10 минут до и в момент наступления каждого намаза."
                )
                logger.info(f"Пользователь {user_id} подписался на уведомления")
            else:
                bot.send_message(user_id, "ℹ️ Вы уже подписаны на уведомления.")
        except Exception as e:
            logger.error(f"Ошибка в subscribe_notifications: {e}")

    @bot.message_handler(func=lambda msg: msg.text in ['/stop_notify', BTN_NOTIFY_OFF])
    def unsubscribe_notifications(message):
        try:
            upsert_user(message)

            user_id = message.chat.id
            if remove_subscriber(user_id):
                bot.send_message(user_id, "❌ Вы отписались от уведомлений.")
                logger.info(f"Пользователь {user_id} отписался от уведомлений")
            else:
                bot.send_message(user_id, "ℹ️ Вы не были подписаны на уведомления.")
        except Exception as e:
            logger.error(f"Ошибка в unsubscribe_notifications: {e}")


