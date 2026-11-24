"""Клавиатуры бота."""
from telebot.types import ReplyKeyboardMarkup, KeyboardButton
from config.settings import BTN_NAMAZ, BTN_WEEK, BTN_NOTIFY_ON, BTN_NOTIFY_OFF, BTN_HELP


def create_main_keyboard():
    """Создает главную клавиатуру с кнопками."""
    from telebot.types import WebAppInfo
    from config.settings import MINIAPP_URL, BTN_OPEN_APP
    
    markup = ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    markup.add(
        KeyboardButton(BTN_NAMAZ),
        KeyboardButton(BTN_WEEK),
        KeyboardButton(BTN_NOTIFY_ON),
        KeyboardButton(BTN_NOTIFY_OFF),
        KeyboardButton(BTN_HELP)
    )
    return markup


