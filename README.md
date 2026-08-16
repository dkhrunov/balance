# Balance

Offline-first multi-user finance app (multi-currency, sync, operation attribution). Spec: [`docs/requirements/SPEC.md`](./docs/requirements/SPEC.md). Agent rules: [`AGENTS.md`](./AGENTS.md). Task queue: [`TASKS.md`](./TASKS.md).

## Prerequisites

- **Node.js 22+** (see [`.nvmrc`](./.nvmrc)): `nvm use`
- npm (comes with Node)
- **Docker** + Docker Compose (local PostgreSQL)

```bash
npm install
```

## Workspace layout

```text
apps/
  web/    # React + Vite + TypeScript (env: .env / VITE_*)
  api/    # NestJS + TypeScript (env: .env — DB, JWT, …)
libs/
  contracts/  # Shared FE↔BE TypeScript contracts (stub)
  domain/     # Domain primitives (stub)
```

Import shared code via `@balance/contracts`, `@balance/domain`. App env/secrets stay in each app — no shared `libs/config`.

## Local PostgreSQL

```bash
# Optional: override compose defaults
cp .env.example .env

# Start Postgres (port 5432 by default)
docker compose up -d

# Wait until healthy, then:
docker compose ps
```

API connection settings live in `apps/api/.env` (copy from `apps/api/.env.example`). Defaults match Compose. Do not commit `.env` files.

```bash
cp apps/api/.env.example apps/api/.env
```

Stop / remove the container (volume kept):

```bash
docker compose down
```

## Start apps locally

In two terminals (Node 22), with Postgres running:

```bash
# API — http://localhost:3000/api
npx nx serve api

# Web — http://localhost:4200 (proxies /api → :3000)
npx nx serve web
```

Or via npm scripts: `npm run start:api` and `npm run start:web`.

## Useful Nx commands

```bash
npx nx graph
npx nx build web
npx nx build api
npx nx run-many -t build --projects=web,api
npx nx run-many -t lint,typecheck
```

## Self-hosted (server requirements)

Draft sizing for a single-node Docker Compose deploy (API + PostgreSQL + static web). Numbers will change when Redis, queues, replicas, or heavier sync load are added — treat this as a starting point, not a guarantee.

|              | Minimum                                                 | Recommended                                     |
| ------------ | ------------------------------------------------------- | ----------------------------------------------- |
| **CPU**      | 1 vCPU                                                  | 2 vCPU                                          |
| **RAM**      | 2 GB                                                    | 4 GB                                            |
| **Disk**     | 20 GB SSD                                               | 40 GB SSD (or more if you keep long DB backups) |
| **OS**       | Linux x86_64 (Ubuntu 22.04+ / Debian 12+ or equivalent) | same                                            |
| **Software** | Docker Engine + Docker Compose                          | same                                            |
| **Network**  | HTTPS reverse proxy (e.g. Caddy / nginx) + outbound DNS | same; stable public IP or DNS                   |

**Notes**

- Minimum is aimed at a small personal / household income–expense tracker with a few concurrent users. Expect tight headroom when Postgres and the API share one VM.
- Recommended leaves room for OS, Docker, Postgres shared buffers, and occasional migrations / backups without swapping.
- Disk grows with transaction history and backup retention; plan capacity separately from the app image size.
- Multi-node, HA Postgres, or extra services (Redis, workers) are out of scope for this draft.
