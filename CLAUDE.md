# CLAUDE.md — Fachwerk IssykKul

Контекст проекта для Claude Code. Читай это перед любыми правками.

## Что это
Лендинг + система бронирования для эко-виллы **Fachwerk IssykKul** (Бостери, Иссык-Куль, Кыргызстан).
Бронируется **вся вилла целиком** на диапазон дат (НЕ номера). Язык интерфейса RU + EN.

## Стек
- **Backend:** FastAPI + SQLAlchemy 2 + PostgreSQL + Alembic, JWT-auth (httpOnly cookie), httpx (Telegram), APScheduler. Папка `backend/`.
- **Frontend:** Next.js 16 (App Router, Turbopack) + **Tailwind v4** + TypeScript + next-intl + react-day-picker + date-fns. Папка `frontend/`.
- **Инфра:** Docker Compose (db + backend + frontend + nginx) + Let's Encrypt. Папки `nginx/`, `scripts/`.

## Как запустить локально
```bash
# БД + бэкенд через Docker:
docker compose up db backend

# Фронт отдельно (hot reload):
cd frontend
npm install --legacy-peer-deps
npm run dev      # http://localhost:3000
```
Перед запуском: `cp .env.example .env` и заполнить значения.

## ВАЖНЫЕ ОСОБЕННОСТИ (грабли, на которые уже наступили)

### 1. Tailwind v4 — цвета задаются в CSS, НЕ в tailwind.config.ts
Это Tailwind **v4**. Кастомная палитра живёт в `frontend/app/globals.css` внутри блока `@theme {}` как CSS-переменные:
- `--color-primary: #00332a` → классы `bg-primary`, `text-primary`, `border-primary`
- `--color-on-surface-var` → `text-on-surface-var` и т.д.
Файл `frontend/tailwind.config.ts` для v4 НЕ читается автоматически — не полагайся на него, правь токены в `@theme`.

### 2. Порядок @import в globals.css критичен
Все `@import` должны идти ПЕРВЫМИ строками файла, до `@theme` и любых правил.
Правильный порядок: сначала `@import url(шрифты)`, потом `@import "tailwindcss"`, потом `@theme {}`.
Если поставить шрифты после `@import "tailwindcss"` — CSS-парсер падает («@import must precede all rules»), потому что Tailwind разворачивается в тысячи строк.

### 3. Острые углы — часть дизайна
Все `--radius-*` в `@theme` = 0 (стиль фахверк). Только `rounded-full` оставляем для логотипа-кружка и переключателя языка. Не добавляй скругления без причины.

### 4. Лишний lockfile в корне
Если есть `fachwerk/package-lock.json` (в корне) — удали его. Должен остаться только `fachwerk/frontend/package-lock.json`. Иначе Next.js путается с workspace root.

## Дизайн-токены (бренд)
- Шрифты: **Playfair Display** (заголовки, `font-serif`) + **Montserrat** (текст, `font-sans`)
- Цвета: `primary #00332a` (тёмно-зелёный, CTA/навбар/футер), `forest #1b4a40`, `timber-oak #a68966` (акценты/eyebrow), `surface #fcf9f8`, `earth-sand #f4f1ea`, `on-surface #1b1c1c`, `outline-var #c0c8c4` (рамки)
- Углы острые (radius 0), тени мягкие только под плавающими элементами

## Структура
```
backend/app/
  models.py        # Booking, User
  availability.py  # overlap-логика + истечение pending 24ч
  routers/         # public, auth, admin
  services/telegram.py
frontend/
  app/page.tsx     # лендинг: Hero → AboutVilla → InteriorGallery → LocationSection → Footer
  app/admin/       # login, page (брони), calendar, new (ручная бронь/блокировка)
  components/       # все секции + BookingModal + FloatingBookButton + Header + Footer
  lib/api.ts       # клиент к бэку
  lib/booking-state.tsx  # shared state hero ↔ modal
  messages/        # ru.json, en.json (i18n строки)
```

## Логика бронирования
- Гость выбирает даты в модалке → `POST /api/bookings` → статус `pending` → Telegram владельцу.
- Вилла занята, если на интервале `[заезд,выезд)` есть бронь `pending`/`confirmed`/`blocked` (правило: `existing.check_in < new.check_out AND existing.check_out > new.check_in`). День выезда свободен под новый заезд.
- `pending` держит даты, авто-истекает через 24ч (см. `availability.py` + APScheduler в `main.py`).
- Админ управляет в `/admin`; Telegram = только уведомление.
- `max_guests = 10`.

## PENDING — что ещё не сделано (нужны данные от клиента)
- [ ] Реальные фото → `frontend/public/images/` : `hero.jpg`, `about.jpg`, `interiors/{living,kitchen,bed1,bed2,terrace,bath}.jpg`. Сейчас стоят брендовые градиент-фолбэки, фото просто перекроют их сверху.
- [ ] Реальные тексты RU + перевод EN (сейчас в `messages/*.json` черновые).
- [ ] Цены: `VILLA_PRICE_PER_NIGHT`, `COTTAGE_PRICE_PER_NIGHT` в `.env`.
- [ ] `TELEGRAM_BOT_TOKEN` + `TELEGRAM_OWNER_CHAT_ID`.
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (без него секция локации показывает стилизованный fallback вместо живой карты — это ок).
- [ ] Домен в `nginx/nginx.conf` (заменить `yourdomain.kg`).

## Правила для правок
- Не ломай i18n: любой новый текст добавляй в оба `messages/ru.json` и `messages/en.json`, доставай через `useTranslations`.
- Цвета только через токены из `@theme` (никаких хардкод-хексов в компонентах, кроме SVG-фолбэков).
- Не добавляй localStorage/sessionStorage в компоненты — состояние через React state / context.
- Серверные секреты не коммить: правь `.env`, не `.env.example`.
- После правок фронта проверяй `npm run build` — Turbopack строже dev-режима.
