---
id: cross.theme
status: active
applies: [web]
implementation: done
verified_at: 2026-11-07
---

# Theme

## Назначение

Carbon-совместимые темы с сохранением выбора на backend.

## Правила и инварианты

- `light` | `dark` | `system` (по умолчанию `system`).
- Совместимость с Carbon themes (white / g10 / g90 / g100); не параллельная палитра.
- `system` → светлая/тёмная тема ОС; реагировать на смену темы в ОС.
- Локальный кэш для первого рендера (first paint) допустим; сохранение настроек — см. [`users-preferences.md`](./users-preferences.md).

## Связанное

- ADR-0012
- [`i18n.md`](./i18n.md)
