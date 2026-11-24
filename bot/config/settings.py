"""Настройки и константы бота."""
import os
import pytz
from dotenv import load_dotenv

# Загружаем переменные из .env файла
load_dotenv()

# Токен бота - только из переменной окружения
BOT_TOKEN = os.getenv('BOT_TOKEN')
if not BOT_TOKEN:
    raise ValueError("Токен бота не найден! Установите переменную окружения BOT_TOKEN.")

# Координаты Худжанда
KHUJAND_LAT = 40.2856
KHUJAND_LNG = 69.6229

# Часовой пояс Таджикистана
TAJIKISTAN_TZ = pytz.timezone('Asia/Dushanbe')

# Намозҳо (таджикский)
PRAYER_NAMES = {
    'Fajr': '🌅 Бомдод',
    'Dhuhr': '☀️ Пешин',
    'Asr': '🌤️ Аср',
    'Maghrib': '🌇 Шом',
    'Isha': '🌙 Хуфтан'
}

# Тексты для кнопок
BTN_NAMAZ = '🕌 Сегодня'
BTN_WEEK = '📅 Неделя'
BTN_NOTIFY_ON = '🔔 Вкл. уведомления'
BTN_NOTIFY_OFF = '🔕 Выкл. уведомления'
BTN_HELP = '📖 Помощь'
BTN_OPEN_APP = '🚀 Открыть Namaz+'

# URL Mini App
MINIAPP_URL = os.getenv('MINIAPP_URL', 'https://t.me/your_bot/app') # Замените на ваш URL


# Пути данных
DATA_DIR = os.getenv('RENDER_DISK_PATH', '.')
os.makedirs(DATA_DIR, exist_ok=True)

# SQLite база
DB_PATH = os.path.join(DATA_DIR, 'bot.db')


