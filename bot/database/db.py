"""Подключение к базе данных."""
import sqlite3
import threading
from config.settings import DB_PATH

db_lock = threading.RLock()


def get_conn():
    """Получить соединение с базой данных."""
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Создаёт таблицы users/subscribers/stats и базовые ключи статистики."""
    from config.logging_config import logger
    
    with db_lock:
        conn = get_conn()
        try:
            conn.executescript("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    telegram_id INTEGER UNIQUE NOT NULL,
                    username TEXT,
                    first_name TEXT,
                    city TEXT DEFAULT 'Худжанд',
                    notifications_enabled INTEGER DEFAULT 1,
                    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                    last_active TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
                );

                CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);

                CREATE TABLE IF NOT EXISTS stats (
                    key   TEXT PRIMARY KEY,
                    value INTEGER NOT NULL
                );

                INSERT OR IGNORE INTO stats (key, value) VALUES
                    ('total_users', 0),
                    ('active_users', 0),
                    ('blocked_users', 0),
                    ('messages_sent', 0);
            """)
            conn.commit()
            logger.info("SQLite DB initialized")
        finally:
            conn.close()


