# ADR-0001: Nx monorepo

- **Status:** Accepted
- **Date:** 2026-11-02
- **Deciders:** project
- **Related specs:** — (структура монорепо описана только здесь и в корневом `README.md`; стек — `AGENTS.md` Target Stack)
- **Related code:** `nx.json`, `apps/web`, `apps/server`, `libs/dto`, `libs/domain`

## Контекст

Нужен один репозиторий для web (React), server (NestJS) и shared TypeScript-контрактов без дублирования типов и с явными границами зависимостей.

## Решение

Использовать **Nx** monorepo:

- `apps/web`, `apps/server` — исполняемые приложения;
- `libs/dto`, `libs/domain` — shared libraries;
- env / secrets только внутри apps (нет shared `libs/config`).

## Рассмотренные альтернативы

- **Отдельные репозитории FE/BE** — дублирование DTO, сложнее держать контракт в sync.
- **Turborepo / plain npm workspaces без Nx** — меньше генераторов и enforcement границ; Nx уже выбран в workspace.

## Последствия

### Плюсы

- Единый graph, lint boundaries, общие команды.
- Контракты живут рядом с потребителями.

### Минусы и компромиссы

- Кривая обучения Nx; CI должен учитывать affected projects.

### Дальнейшие шаги

- Нет.
