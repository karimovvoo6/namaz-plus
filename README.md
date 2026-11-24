# Namaz(plus) - Продакшн-реди решение

Современная система для отслеживания времени намаза с Telegram-ботом и Mini App.

## 🚀 Быстрый запуск (Docker)

Проект готов к запуску одной командой:

1. Скопируйте `.env.example` в `.env` и заполните `BOT_TOKEN`:
   ```bash
   cp .env.example .env
   ```

2. Запустите инфраструктуру:
   ```bash
   docker compose up --build
   ```

Система автоматически:
- Поднимет базу данных PostgreSQL.
- Применит миграции базы данных.
- Запустит Telegram-бота.
- Запустит API-сервер на порту 8080 (бэкенд).
- Запустит Mini App на порту 3000 (фронтенд).


## 🛠 Технологический стек

- **Backend**: Python 3.11+, aiogram 3.x, FastAPI, SQLAlchemy 2.0 (Async), PostgreSQL.
- **Frontend**: Vue 3, Vite, TypeScript.
- **Infrastructure**: Docker, Docker Compose, Alembic.

## 📁 Структура проекта

- `app/`: Исходный код бэкенда.
  - `api/`: Эндпоинты FastAPI.
  - `db/`: Модели базы данных и миграции.
  - `handlers/`: Обработчики команд бота.
  - `services/`: Бизнес-логика (Prayer API, уведомления).
- `namaz-miniapp/`: Исходный код Mini App.

## 📡 API Endpoints

- `GET /health` - Проверка состояния.
- `GET /api/prayer-times` - Получение времени намаза по координатам.
- `GET /api/user/{id}` - Информация о пользователе.
- `POST /api/user/{id}/settings` - Обновление настроек.

## 📝 Лицензия
MIT

