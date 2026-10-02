# Тест на знание Данила

Пиксельная Telegram Mini App-викторина на 15 вопросов с общей таблицей результатов.

## Локальный запуск

1. Создайте проект в [Supabase](https://supabase.com/).
2. Откройте `SQL Editor` и выполните файл `supabase/schema.sql`.
3. Скопируйте `.env.example` в `.env.local`.
4. В `Project Settings → API Keys` скопируйте URL проекта и серверный Secret key (`sb_secret_...`) в `.env.local`.
5. Никогда не публикуйте `SUPABASE_SECRET_KEY` и не добавляйте `.env.local` в Git.
6. Выполните:

```powershell
npm install
npm run dev
```

7. Откройте `http://localhost:3000`.

Без настроенного Supabase интерфейс откроется, но начать тест и загрузить рейтинг нельзя.

## Проверки

```powershell
npm run lint
npm run build
```

## Публикация

Разместите проект на Vercel, добавьте там переменные `SUPABASE_URL` и `SUPABASE_SECRET_KEY`, затем укажите полученный HTTPS-адрес как Main Mini App в `@BotFather`.
