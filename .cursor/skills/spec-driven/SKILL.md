---
name: spec-driven
description: Balance spec-driven cycle. Use before a task that changes behavior, a contract, or an invariant. Covers the task-to-acceptance cycle, the missing-spec stop, when to update a spec, and when to write an ADR.
---

# Spec-driven (Balance)

This skill is the only write-up of the SDD cycle.

A spec states behavior and invariants (`docs/requirements/`). An ADR states why a stack or pattern was chosen (`docs/architecture/adr/`). Do not restate the stack in a spec.

## Cycle

**Task → spec → code → update the spec → acceptance.**

1. Take the next task from `TASKS.md`.
2. Read every requirements file that task cites.
3. If the task and those specs contradict each other on the behavior to build, or the cited specs contradict each other, **stop**. Ask the user which one to follow, or to describe a new behavior. Do not code. Record the chosen behavior in the spec before starting.
4. If no spec describes the behavior, **stop**. Ask the user to describe the specification. Do not code.
5. Record the user's description in `docs/requirements/` (new file from `docs/requirements/_template.md`, or an edit of the cited file). Only then start the task.
6. Implement against that spec.
7. Update every spec whose behavior, contract, or invariant changed.
8. Mark the task done only when its Acceptance is met.

## Stop-gate

- A new area with no requirements file is a stop. Do not invent the spec and continue in the same step. Ask the user to describe it, write that description down, then implement.
- A contradiction on the behavior to build is a stop. That includes a task against a spec, and two specs against each other. Do not pick a side. Ask the user which decision to follow, or to describe a new one. Write that choice into the spec, then implement.
- Shipping behavior that breaks an Accepted ADR is a stop. Ask whether to follow the ADR or to record a new decision. Do not quietly ignore the ADR or edit it in place.
- If a cited spec leaves a behavior unspecified, do not hide it as an unwritten assumption. Ask. After the user confirms a small assumption, add it to the spec before coding.

## When to update a spec

- Update the spec when any of these change: product or UX behavior, a domain invariant, a DTO or API, authz or concurrency, or the product boundary in `scope.md`.
- On the touched files set `implementation` (`none` | `partial` | `done` | `na`). Set `verified_at` (`YYYY-MM-DD`) after the code matches the spec. Do not put task ids in frontmatter. The queue stays in `TASKS.md`.
- A living spec matches the shipped behavior. After the change, the file describes what the system does now, not the previous rule.

## When not to update a spec

- Skip the spec for an internal rename, UI cosmetics, a refactor that does not change the contract or behavior, or a library swap that does not change behavior. A library or pattern change with lasting consequences is an ADR, not a spec.

## When to write an ADR

- Write an ADR when there are two or more reasonable alternatives with long-term consequences, or when an Accepted decision changes (new file, old one `Superseded`).
- Do not write an ADR for an MCP or skill choice, a single UI widget, or a local refactor inside an accepted approach. How to add one: `docs/architecture/adr/README.md`.

## Where to look

- The capability map is the index in `docs/requirements/README.md` plus `scope.md`. Success for a task is its Acceptance in `TASKS.md` and a spec whose `implementation` and `verified_at` match the code.
