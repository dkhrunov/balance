# ADR-0007: JWT in HttpOnly cookies

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/auth-security.md`
- **Related code:** `apps/server/src/auth`, web auth session

## Контекст

Нужна авторизованная сессия для SPA без хранения access token в доступном из JS месте из-за риска угрозы XSS.

## Решение

- Short-lived access JWT + rotating refresh token.
- Оба только в `HttpOnly`, `Secure`, `SameSite=Strict` cookies (Secure может быть off только для local HTTP).
- Frontend JS не читает и не хранит токены; identity через `GET /auth/me`.
- Refresh: opaque token, hash в PostgreSQL, rotation + reuse detection.
- CSRF: allowlisted `Origin` + CORS credentials на unsafe requests.

## Рассмотренные альтернативы

- **Bearer token в localStorage** — удобнее для клиентов, хуже при XSS.
- **Session cookie only (server session)** — возможно, но JWT access + refresh уже реализованы и соответствуют SPEC.
- **Public registration** — не нужна; users через seed / admin.

## Последствия

### Плюсы

- Токены недоступны JS; модель XSS понятнее.
- Refresh rotation ограничивает replay.

### Минусы и компромиссы

- Нужна проверка CSRF Origin.

### Дальнейшие шаги

- Нет.
