"""Главный файл запуска бота."""
import sys
import threading
import time
import logging
import schedule
import telebot
from telebot.types import BotCommand

from config.settings import BOT_TOKEN
from config.logging_config import logger
from database.db import init_db
from handlers.message_handlers import register_handlers
from services.notification_service import send_due_events, rebuild_daily_events_if_needed, _notify_lock

# Создаём экземпляр бота
bot = telebot.TeleBot(BOT_TOKEN)


def run_scheduler():
    """Запускает планировщик задач в отдельном потоке."""
    try:
        # Частая проверка (окно по _last_check), можно 20-30 сек
        schedule.every(20).seconds.do(lambda: send_due_events(bot))
        logger.info("Планировщик уведомлений запущен (every 20 seconds).")

        while True:
            schedule.run_pending()
            time.sleep(1)

    except Exception as e:
        logger.error(f"Ошибка в планировщике: {e}")
        sys.exit(1)


def main():
    """Главная функция запуска бота."""
    try:
        init_db()

        # Регистрация обработчиков
        register_handlers(bot)

        # Вместо списка команд устанавливаем кнопку Mini App в меню (слева от ввода)
        from telebot.types import MenuButtonWebApp, WebAppInfo
        from config.settings import MINIAPP_URL
        
        bot.set_chat_menu_button(menu_button=MenuButtonWebApp(
            type="web_app",
            text="🕌 Namaz+",
            web_app=WebAppInfo(url=MINIAPP_URL)
        ))
        
        # Удаляем старые команды, если они были (чтобы не путать)
        bot.delete_my_commands()
        
        logger.info("Кнопка Mini App в меню установлена, старые команды удалены.")

        # Подготовим события на сегодня заранее (не обязательно, но полезно)
        with _notify_lock:
            rebuild_daily_events_if_needed()

        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()

        logger.info("Бот запущен. Ожидание сообщений...")
        bot.infinity_polling(logger_level=logging.INFO)

    except Exception as e:
        logger.error(f"Критическая ошибка: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()


