# Deployment Guide (Render, Vercel, Netlify)

This repository contains two parts:

- `miniapp` - Vue + Vite frontend (работает автономно или в связке с ботом)
- `bot` - Telegram bot + scheduler + FastAPI (долгоживущий процесс для уведомлений в Telegram)

---

## 1) Автономный запуск сайта (Frontend only - 100% бесплатно)

Сайт работает автономно напрямую с сервисом времени и геопозицией. Бэкенд поднимать **не нужно**.

### Деплой на Render (Static Site):
1. Зайдите на [render.com](https://render.com) и нажмите **New +** -> **Static Site**.
2. Подключите ваш GitHub/GitLab репозиторий.
3. Заполните поля:
   - **Name:** `namaz-plus` (любое)
   - **Root Directory:** `miniapp`
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. В разделе **Redirects / Rewrites** (в левом меню настроек сервиса):
   - **Source:** `/*`
   - **Destination:** `/index.html`
   - **Action:** `Rewrite`
5. Нажмите **Create Static Site**.

*(Или выберите **New + -> Blueprint** — проект автоматически настроится по файлу `render.yaml`).*

---

## 2) Фронтенд на Vercel

1. Import the repository into Vercel.
2. Set **Root Directory** to `miniapp`.
3. Keep the default Vite build:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

`miniapp/vercel.json` уже настроен для SPA-маршрутов (`/namaz`, `/quran/1`, etc.).

---

## 3) Фронтенд на Netlify

1. Import the repository into Netlify.
2. Set **Base/Package directory** to `miniapp`.
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy.

`miniapp/netlify.toml` уже настроен для SPA fallback.

---

## 4) Подключение Telegram-бота к сайту (Mini App)

Когда сайт задеплоен (например, `https://namaz-plus.onrender.com` или `https://namaz-plus.vercel.app`):
1. Откройте в Telegram [@BotFather](https://t.me/BotFather).
2. Выберите вашего бота через `/mybots` -> выберите бота -> **Bot Settings** -> **Menu Button** -> **Configure menu button**.
3. Отправьте ссылку на ваш сайт: `https://YOUR_SITE.onrender.com` и название кнопки, например `🕌 Namaz+`.
4. Теперь кнопка Mini App появится у всех пользователей прямо в окне чата!
