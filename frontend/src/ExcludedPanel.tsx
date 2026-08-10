import type { ExcludedSummary, PayrollResponse } from './api'

const LABELS: { key: keyof ExcludedSummary; label: string }[] = [
  { key: 'outside_period', label: 'Tasks outside period' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'duplicate', label: 'Duplicate' },
  { key: 'invalid_status', label: 'Invalid status' },
  { key: 'unknown_assignee', label: 'Unknown assignee' },
  { key: 'no_median', label: 'No median (missing estimate)' },
  { key: 'commit_outside_period', label: 'Commits outside period' },
  { key: 'unknown_commit_author', label: 'Unknown commit author' },
]

type Props = {
  excluded: PayrollResponse['excluded']
}

export function ExcludedPanel({ excluded }: Props) {
  const totalExcluded =
    Object.values(excluded.summary).reduce((a, b) => a + b, 0)

  return (
    <section className="excluded">
      <h2>Excluded records ({totalExcluded})</h2>
      <p className="excluded-note">
        Not included in payroll. Counts by reason:
      </p>
      <ul className="excluded-summary">
        {LABELS.map(({ key, label }) => (
          <li key={key}>
            <span>{label}</span>
            <strong>{excluded.summary[key]}</strong>
          </li>
        ))}
      </ul>

      <details>
        <summary>Task details ({excluded.tasks.length})</summary>
        <ul className="excluded-list">
          {excluded.tasks.map((t) => (
            <li key={t.key}>
              <code>{t.key}</code> — {t.reason}
            </li>
          ))}
        </ul>
      </details>

      <details>
        <summary>Commit details ({excluded.commits.length})</summary>
        <ul className="excluded-list">
          {excluded.commits.map((c) => (
            <li key={c.sha}>
              <code>{c.sha.slice(0, 8)}</code> ({c.author}) — {c.reason}
            </li>
          ))}
        </ul>
      </details>
    </section>
  )
}
