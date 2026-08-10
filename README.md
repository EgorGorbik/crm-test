# Payroll

Full-stack test assignment: calculate developer payroll from tracker tasks and git commits.

Stack: **Python / FastAPI** + **React / TypeScript (Vite)**.

## Run

Two terminals from the repo root:

### Backend

```bash
python3 -m pip install -r backend/requirements.txt && python3 -m uvicorn backend.app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend && npm install && npm run dev
```

Open:

```text
http://localhost:3000
```

Or with Make:

```bash
make backend
make frontend
```

API:

```text
GET /api/payroll?month=2026-07
```

## Data

> The original input data files were not provided with the assignment, so the repository contains synthetic example data used only for local development and testing.

Files:

- `data/devs.json`
- `data/tasks.json`
- `data/commits.json`

## Data quality and decisions

The dataset contains the following edge cases:

- Tasks resolved outside the selected month
- Rejected tasks
- Duplicate tasks
- Tasks with non-payable statuses (e.g. In Progress — not Done/Closed)
- Tasks with unknown assignees
- Tasks without estimates
- Task types without enough data to calculate a median (Spike)
- Commits outside the selected month
- Commits from unknown Git authors
- Multiple commits on the same day (`commits` ≠ `activeDays`)

The payroll calculation handles these cases explicitly instead of silently ignoring them.

Excluded records are returned by the API with their reason so the payroll calculation can be audited.

### Mapping

Exact match only, no fuzzy heuristics:

```text
tasks.assignee  →  devs.name
commits.author  →  devs.gitLogin
```

### Missing estimates

If `estimate` is missing, use the median of **all** estimated tasks of the same `type` in `tasks.json` (not only payable / in-month tasks).

If median cannot be computed → exclude with reason `no_median`.

### Formula

```text
piece = sum(estimate) * 25
total = fixed + piece
```

A task is paid only if:

1. status is `Done` or `Closed`
2. `resolvedAt` is inside the selected month
3. assignee exists in `devs.json`

## Calculation decisions

- Exclusion order: rejected/duplicate → not payable status → outside period → unknown assignee → no median
- `excluded` includes both counts and per-record reasons
- Out-of-period / unknown commits are listed in `excluded` for auditability
- UI month picker calls `?month=YYYY-MM`; fixtures are richest for July 2026

## What I didn't finish

- No auth / Docker / CI (out of scope for the assignment)
- Vite instead of Next.js (allowed; less boilerplate)

## AI usage

Cursor was used to scaffold the project, generate synthetic fixtures with the edge cases above, implement payroll logic, API, UI, and tests. I reviewed the rules myself — especially median scope (all tasks by type, not only July) and exclusion reasons — and checked July totals manually instead of hardcoding an expected payroll number.

## AI mistake

Cursor initially implemented missing-estimate median calculation using only
payable tasks from July.

I caught this during a manual review of the implementation against the
assignment rules. The brief explicitly says that the median must be calculated
from all estimated tasks of the same type in tasks.json.

I added out-of-period Bug tasks (CRM-401 and CRM-403) to the fixtures and
verified that they affected the median while remaining excluded from payroll.
