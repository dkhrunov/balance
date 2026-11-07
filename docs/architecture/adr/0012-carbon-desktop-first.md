# ADR-0012: Carbon desktop-first UI

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** `docs/requirements/principles.md`, `docs/requirements/i18n.md`, `docs/requirements/theme.md`
- **Related code:** `apps/web` (`@carbon/react`, SCSS modules)

## Контекст

Нужен предсказуемый enterprise UI без своей design-system. Приёмка — на wide viewport.

## Решение

- Только **IBM Carbon** (`@carbon/react`, charts позже для analytics).
- Styles: **SCSS** + CSS Modules; Carbon стили через `@use '@carbon/react'`.
- Desktop-first: принять на Carbon `lg+` (SideNav, DataTable, forms).
- Перед UI-изменением — исследовать Carbon Foundations / Components / Patterns (+ Carbon MCP / carbon-builder skill).

## Рассмотренные альтернативы

- **Свой UI kit / Tailwind-only** — дублирует Carbon и ломает a11y/tokens.

## Последствия

### Плюсы

- Единый visual/a11y язык; меньше custom CSS.
- Чёткий DoD viewport.

### Минусы и компромиссы

- Carbon ограничения иногда требуют composition, а не CSS-хаков (см. AGENTS hacks stop-gate).

### Дальнейшие шаги

- Нет.
