"""Модели и функции работы с данными."""
from datetime import datetime
from config.settings import TAJIKISTAN_TZ
from config.logging_config import logger
from database.db import get_conn, db_lock


def upsert_user(message):
    """Создать или обновить пользователя."""
    telegram_id = message.chat.id
    u = message.from_user
    now_local = datetime.now(TAJIKISTAN_TZ).strftime('%Y-%m-%d %H:%M:%S')

    with db_lock:
        conn = get_conn()
        try:
            existing = conn.execute("SELECT 1 FROM users WHERE telegram_id = ?", (telegram_id,)).fetchone()

            conn.execute("""
                INSERT INTO users (telegram_id, username, first_name, city, notifications_enabled, created_at, last_active)
                VALUES (?, ?, ?, 'Худжанд', 1, ?, ?)
                ON CONFLICT(telegram_id) DO UPDATE SET
                    username=excluded.username,
                    first_name=excluded.first_name,
                    last_active=excluded.last_active
            """, (telegram_id, u.username, u.first_name, now_local, now_local))

            if not existing:
                conn.execute("UPDATE stats SET value = value + 1 WHERE key='total_users'")
                conn.execute("UPDATE stats SET value = value + 1 WHERE key='active_users'")

            conn.commit()
        finally:
            conn.close()


def add_subscriber(telegram_id: int) -> bool:
    """Подписать на уведомления. True если включили, False если уже включены."""
    with db_lock:
        conn = get_conn()
        try:
            row = conn.execute("SELECT notifications_enabled FROM users WHERE telegram_id = ?", (telegram_id,)).fetchone()
            if row and int(row["notifications_enabled"]) == 1:
                return False
            
            conn.execute("UPDATE users SET notifications_enabled = 1 WHERE telegram_id = ?", (telegram_id,))
            conn.commit()
            return True
        finally:
            conn.close()


def remove_subscriber(telegram_id: int) -> bool:
    """Отписать от уведомлений. True если отключили, False если уже отключены."""
    with db_lock:
        conn = get_conn()
        try:
            row = conn.execute("SELECT notifications_enabled FROM users WHERE telegram_id = ?", (telegram_id,)).fetchone()
            if row and int(row["notifications_enabled"]) == 0:
                return False
            
            conn.execute("UPDATE users SET notifications_enabled = 0 WHERE telegram_id = ?", (telegram_id,))
            conn.commit()
            return True
        finally:
            conn.close()


def get_subscribers() -> list[int]:
    """Список подписчиков (с включенными уведомлениями)."""
    with db_lock:
        conn = get_conn()
        try:
            rows = conn.execute("SELECT telegram_id FROM users WHERE notifications_enabled = 1").fetchall()
            return [int(r["telegram_id"]) for r in rows]
        finally:
            conn.close()


def mark_user_blocked(telegram_id: int):
    """Пометить пользователя как заблокировавшего бота (отключить уведомления и обновить stats)."""
    with db_lock:
        conn = get_conn()
        try:
            # Считаем, что отключение уведомлений равно блокировке
            row = conn.execute("SELECT notifications_enabled FROM users WHERE telegram_id = ?", (telegram_id,)).fetchone()
            if row and int(row["notifications_enabled"]) == 0:
                return

            conn.execute("UPDATE users SET notifications_enabled = 0 WHERE telegram_id = ?", (telegram_id,))
            conn.execute("UPDATE stats SET value = value + 1 WHERE key='blocked_users'")
            conn.execute("UPDATE stats SET value = CASE WHEN value > 0 THEN value - 1 ELSE 0 END WHERE key='active_users'")
            conn.commit()
        finally:
            conn.close()


def inc_messages_sent(n: int = 1):
    """Счётчик отправленных сообщений (успешных)."""
    with db_lock:
        conn = get_conn()
        try:
            conn.execute("UPDATE stats SET value = value + ? WHERE key='messages_sent'", (n,))
            conn.commit()
        finally:
            conn.close()


