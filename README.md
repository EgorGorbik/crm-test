# Payroll — July 2026

Full-stack test assignment: calculate developer payroll from tracker tasks and git commits for **2026-07**.

Stack: **Python / FastAPI** + **React / TypeScript (Vite)**.

## How to run

From the repo root:

```bash
# Backend (http://127.0.0.1:8000)
python3 -m pip install -r backend/requirements.txt
python3 -m uvicorn backend.app.main:app --reload --port 8000
```

```bash
# Frontend (http://localhost:3000) — proxies /api to the backend
cd frontend && npm install && npm run dev
```

Run both from the repository root (backend command must be started in the repo root so `backend.app` and `data/` resolve).

API:

```text
GET /api/payroll?month=2026-07
```

Tests:

```bash
python3 -m pytest -q
```

Data check:

```bash
python3 scripts/analyze_data.py
```

## Data

> The original input data files were not provided with the assignment, so the repository contains synthetic example data used only for local development and testing.

Files:

- `data/devs.json`
- `data/tasks.json`
- `data/commits.json`

See `DATA_ANALYSIS.md` for the intentional edge cases.

## Data quality findings

Fixtures include both normal and dirty records:

| Issue | Example | Handling |
|-------|---------|----------|
| Resolved outside July | CRM-201 (Aug), CRM-202 (Jun) | `excluded.outside_period` |
| Rejected / Duplicate | CRM-203, CRM-204 | `excluded.rejected` / `duplicate` |
| Non-payable status | CRM-205 In Progress | `excluded.invalid_status` |
| Unknown assignee | CRM-206 | `excluded.unknown_assignee` |
| Missing estimate + median | CRM-301/302/303 | median of same `type` across **all** tasks |
| Missing estimate, no median | CRM-304 Spike | `excluded.no_median` |
| Unknown git author | `external.contractor` | `excluded.unknown_commit_author` |
| Commits outside July | Jun / Aug / May | `excluded.commit_outside_period` |

Same-day commit bursts are present (e.g. Anna on 2026-07-05) so `commits` ≠ `activeDays`.

## Calculation rules

Period: **2026-07-01 … 2026-07-31** (inclusive), via `?month=2026-07`.

**Payable task** only if:

1. `status` is `Done` or `Closed`
2. `resolvedAt` falls in the month
3. `assignee` matches `devs.name` exactly
4. estimate is present, **or** a median can be computed for that `type`

Then:

```text
points = sum(resolved estimates)
piece  = points * 25
total  = fixed + piece
```

Missing estimate: median of **all** tasks with the same `type` that have an estimate (not only July / payable). If none exist → exclude with `no_median`.

Mapping (exact, no fuzzy match):

```text
tasks.assignee  -> devs.name
commits.author  -> devs.gitLogin
```

Commits counted only in-month and with a known `gitLogin`.  
`activeDays` = unique calendar days with ≥1 counted commit.

### Decisions on ambiguities

1. **Exclusion order for tasks:** `Rejected`/`Duplicate` → other non-Done/Closed → outside period → unknown assignee → no median.
2. **`excluded` shape:** `summary` counts + detailed `tasks` / `commits` lists (reason per record).
3. **Commits outside period / unknown authors** are listed under `excluded` for transparency (they never affect payroll).
4. **Odd-length medians** use the middle value; even-length use the average of the two middle values.
5. Only month `2026-07` is required by the assignment; the API accepts any `YYYY-MM` against the same fixtures.

## What I didn't finish

- No month picker in the UI (hardcoded July 2026 display; API still accepts `month`).
- No Docker / CI / auth (out of scope per assignment).
- Frontend uses Vite instead of Next.js (allowed; less boilerplate).

## AI usage

Cursor Agent was used end-to-end: scaffolding the repo, inventing synthetic fixtures that cover the required edge cases, writing the data analyzer, implementing the payroll module split (loading / mapping / median / tasks / commits / excluded / aggregation), FastAPI route, React table with sorting + excluded panel, pytest coverage, and this README. Human review focused on matching the assignment rules exactly (especially median scope and exclusion reasons), keeping commits small, and verifying totals against a manual walkthrough of July fixtures rather than hardcoding an expected payroll oracle.

## AI mistake

Early `parse_month` used a hand-rolled “next month − 1 day” via `date.fromordinal(...)`, which was easy to get wrong and harder to read. It was replaced with `calendar.monthrange` before tests ran. Separately, a first instinct was to compute medians only from payable July tasks; re-reading the brief (“use all tasks in `tasks.json`”) caught that — fixtures intentionally include out-of-period Bug estimates (CRM-401, CRM-403) that still affect CRM-301’s median.
