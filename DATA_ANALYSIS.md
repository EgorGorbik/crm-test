# Data Analysis

Synthetic fixtures in `data/` are for local development and testing only.
The original assignment input files were not provided.

## Summary

| Dataset | Count |
|---------|-------|
| developers | 7 |
| tasks | 30 |
| commits | 32 |

Run:

```bash
python3 scripts/analyze_data.py
```

## Developers

| name | gitLogin | fixed |
|------|----------|-------|
| Anna Kowalski | anna.kowalski | 2500 |
| Boris Nguyen | boris.nguyen | 2200 |
| Clara Mendes | clara.mendes | 2800 |
| Diego Alvarez | diego.alvarez | 2100 |
| Elena Volkov | elena.volkov | 2400 |
| Farid Hassan | farid.hassan | 2300 |
| Greta Lindqvist | greta.lindqvist | 2600 |

## Valid July tasks (payable candidates)

Done/Closed in July 2026 with known assignees and (usually) estimates:

- Stories / Bugs / Tasks / Improvements across all seven developers
- Mixed estimates: 1, 2, 3, 4, 5, 6, 8 — enough duplicates to verify medians by hand

## Intentionally problematic records

### Outside period

| key | status | resolvedAt | expected reason |
|-----|--------|------------|-----------------|
| CRM-201 | Done | 2026-08-03 | `outside_period` |
| CRM-202 | Closed | 2026-06-28 | `outside_period` |
| CRM-401 | Done | 2026-06-25 | `outside_period` (also feeds Bug median) |
| CRM-402 | Closed | 2026-08-05 | `outside_period` |
| CRM-403 | Done | 2026-05-20 | `outside_period` (also feeds Bug median) |

### Status exclusions

| key | status | expected reason |
|-----|--------|-----------------|
| CRM-203 | Rejected | `rejected` |
| CRM-204 | Duplicate | `duplicate` |
| CRM-205 | In Progress | `invalid_status` |

### Unknown assignee

| key | assignee | expected reason |
|-----|----------|-----------------|
| CRM-206 | Unknown Contractor | `unknown_assignee` |

### Missing estimates (median cases)

| key | type | notes |
|-----|------|-------|
| CRM-301 | Bug | median from all Bug estimates in `tasks.json` |
| CRM-302 | Story | median from all Story estimates |
| CRM-303 | Task | median from all Task estimates |
| CRM-304 | Spike | **no** Spike estimates anywhere → `no_median` |

Median uses **all** estimated tasks of the same type, including outside July.

Approximate medians from fixtures:

- Bug estimates: `[1,1,2,2,2,3,3,4,5,8,8]` → median **3**
- Story estimates: `[3,5,5,5,5,8,8]` → median **5**
- Task estimates: `[2,3,3,4,6]` → median **3**

### Commits

| case | detail |
|------|--------|
| Same-day burst | Anna: 5 commits on 2026-07-05 |
| Multi-day July | Anna also on 07-10 (2) and 07-20 (1) → commits=8, activeDays=3 |
| Outside July | June, August, May commits present |
| Unknown author | `external.contractor` on 2026-07-12 |
| Multiple repos | `crm-frontend`, `crm-backend`, `crm-infra` |
| Multiple branches | `main`, `develop`, `feature/*`, `hotfix/*` |

## Analyzer checklist coverage

- [x] multiple developers
- [x] Done + Closed in July
- [x] varied types and estimates
- [x] outside_period (Aug Done, Jun Closed, other months)
- [x] rejected / duplicate / In Progress
- [x] unknown assignee
- [x] missing estimates with computable median
- [x] Spike with impossible median
- [x] unknown commit author
- [x] commits outside July
- [x] multi-commit same day → activeDays < commits
