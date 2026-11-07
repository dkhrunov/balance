---
id: domain.users-preferences
status: active
applies: [web, server, dto]
implementation: done
verified_at: 2026-11-07
---

# User preferences (backend)

## Назначение

Locale и тема пользователя хранятся на backend (PostgreSQL), а не только в хранилище браузера. Это колонки `users.locale` и `users.theme`, не отдельная таблица.

## Правила и инварианты

- Поля: `locale: 'en' | 'ru'`, `theme: 'light' | 'dark' | 'system'`.
- Значения по умолчанию: locale → дефолтный язык веб-приложения на этапе деплоя; theme → `system`.
- Сохраняются между выходами из системы, новыми сессиями и браузерами.
- Мутация идемпотентна; доступна только владельцу настроек.
- Локальный кэш для первого рендера (first paint) допустим; backend остаётся источником истины.
- API (точные имена могут отличаться): `GET/PUT /users/me/preferences`.

## Контракты

- `@balance/dto/users` (preferences)

## Связанное

- [`i18n.md`](./i18n.md)
- [`theme.md`](./theme.md)
- [`auth-security.md`](./auth-security.md)
