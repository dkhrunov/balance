# Model selection for agents

How to pick a Cursor agent model by task type for Balance. Prices are **$/1M tokens (input / output)** from [Cursor Models & Pricing](https://cursor.com/docs/models). Thinking variants usually cost more in practice (reasoning tokens bill as output).

**Rule of thumb:** decision artifacts (ADR / ERD / SSD) → stronger thinking; implementation → coding-balanced models; many small iterations → cheapest that still follows repo rules.

Within each task, models are listed **expensive → cheaper**. Same list price (e.g. Opus line at $5 / $25) is ordered by preferred freshness / effort.

| Task | Model | Price $/1M (in / out) |
| ---- | ----- | --------------------- |
| **ADR / ERD (architecture)** | Claude Fable 5.1 thinking | $10 / $50 |
| | Claude Opus 5 thinking | $5 / $25 |
| | Claude Opus 4.8 thinking | $5 / $25 |
| | Claude Opus 4.7 thinking xhigh | $5 / $25 |
| | Claude 4.6 Opus max thinking | $5 / $25 |
| | Claude 4.5 Opus thinking | $5 / $25 |
| | GPT-5.6 Sol | $4 / $20 |
| | Claude 4.6 Sonnet thinking | $3 / $15 |
| | Claude 4.5 Sonnet thinking | $3 / $15 |
| **SSD (sequence / scenarios)** | Claude Opus 5 thinking | $5 / $25 |
| | Claude Opus 4.8 thinking | $5 / $25 |
| | Claude Opus 4.7 thinking xhigh | $5 / $25 |
| | Claude 4.6 Opus max thinking | $5 / $25 |
| | Claude 4.5 Opus thinking | $5 / $25 |
| | GPT-5.6 Sol | $4 / $20 |
| | Claude Sonnet 5 thinking | $2 / $10 |
| | Claude 4.6 Sonnet thinking | $3 / $15 |
| | Claude 4.5 Sonnet thinking | $3 / $15 |
| **FE/BE code (hard: money / sync / schema)** | Claude Opus 5 thinking | $5 / $25 |
| | Claude Opus 4.8 thinking | $5 / $25 |
| | Claude Opus 4.7 thinking xhigh | $5 / $25 |
| | Claude 4.6 Opus max thinking | $5 / $25 |
| | Claude 4.5 Opus thinking | $5 / $25 |
| | GPT-5.6 Sol | $4 / $20 |
| | GPT-5.3 Codex | $1.75 / $14 |
| | Claude Sonnet 5 thinking | $2 / $10 |
| **FE/BE code (typical feature)** | GPT-5.6 Sol | $4 / $20 |
| | Claude 4.6 Sonnet thinking | $3 / $15 |
| | Claude 4.5 Sonnet thinking | $3 / $15 |
| | GPT-5.3 Codex | $1.75 / $14 |
| | Claude Sonnet 5 thinking | $2 / $10 |
| | GPT-5.6 Terra | $2 / $12 |
| | Grok 4.7 high-fast | $4 / $12 |
| | Grok 4.5 high | $2 / $6 |
| | GPT-5.6 Luna | $0.20 / $1.20 |
| **Small fixes / tight iteration loops** | GPT-5.6 Terra | $2 / $12 |
| | Grok 4.5 high | $2 / $6 |
| | GPT-5.6 Luna | $0.20 / $1.20 |

## Defaults for Balance

| Role | Prefer first | Budget fallback |
| ---- | ------------ | --------------- |
| ADR / ERD | Opus 5 | Opus 4.5 / Sol |
| SSD | Opus 5 | Sonnet 5 |
| FE/BE hard | Opus 5 / Codex | Sonnet 5 |
| FE/BE typical | Codex / Sonnet 5 | Terra / Luna |
| Small fixes | Luna | — |

## Notes

- Prefer **decision first, code second**: ADR/ERD/SSD on a thinking Opus (or Sol), then FE/BE on Codex / Sonnet — do not mix “design the schema and implement UI” in one cheap pass.
- **Fable 5.1** only when the ADR is genuinely high-stakes (sync conflicts, irreversible schema forks). For ordinary code it is ~2–2.5× Opus cost.
- Raise the model class when the failure mode is **money, sync, or schema integrity**; keep cheaper models for UI polish and mechanical edits.
- Prices and available slugs change; re-check Cursor docs when the catalog updates.
