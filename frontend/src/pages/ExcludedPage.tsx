import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { PayrollResponse } from '../api'
import { PageHeader } from '../components/PageHeader'
import { reasonLabel } from '../format'
import { usePayroll } from '../PayrollContext'

type ReasonRow = { label: string; count: number; group: 'Tasks' | 'Commits' }

export function ExcludedPage() {
  const data = useOutletContext<PayrollResponse>()
  const { monthLabel } = usePayroll()
  const { summary, tasks, commits } = data.excluded
  const total = tasks.length + commits.length

  const taskReasons: ReasonRow[] = useMemo(
    () => [
      { label: 'Outside period', count: summary.outside_period, group: 'Tasks' },
      { label: 'Rejected', count: summary.rejected, group: 'Tasks' },
      { label: 'Duplicate', count: summary.duplicate, group: 'Tasks' },
      { label: 'Non-payable status', count: summary.not_payable_status, group: 'Tasks' },
      { label: 'Unknown assignee', count: summary.unknown_assignee, group: 'Tasks' },
      { label: 'No median', count: summary.no_median, group: 'Tasks' },
    ],
    [summary],
  )

  const commitReasons: ReasonRow[] = useMemo(
    () => [
      {
        label: 'Outside period',
        count: summary.commit_outside_period,
        group: 'Commits' as const,
      },
      {
        label: 'Unknown author',
        count: summary.unknown_commit_author,
        group: 'Commits' as const,
      },
    ],
    [summary],
  )

  return (
    <section className="page">
      <PageHeader title="Excluded Records" />

      <div className="excluded-hero">
        <div className="excluded-count">{total} records excluded</div>
        <p>These items were not included in {monthLabel} payroll totals.</p>
      </div>

      <div className="reason-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Tasks</h2>
          </div>
          <ul className="reason-list">
            {taskReasons.map((r) => (
              <li key={r.label}>
                <span>{r.label}</span>
                <strong>{r.count}</strong>
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <div className="panel-head">
            <h2>Commits</h2>
          </div>
          <ul className="reason-list">
            {commitReasons.map((r) => (
              <li key={r.label}>
                <span>{r.label}</span>
                <strong>{r.count}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <h2>Details</h2>
        </div>
        <ul className="excluded-details">
          {tasks.map((t) => (
            <li key={`task-${t.key}`}>
              <code>{t.key}</code>
              <span className="tag">Task</span>
              <span className="reason-code">{t.reason}</span>
              <span className="muted">{reasonLabel(t.reason)}</span>
            </li>
          ))}
          {commits.map((c) => (
            <li key={`commit-${c.sha}`}>
              <code title={c.sha}>{c.sha.slice(0, 8)}</code>
              <span className="tag">Commit</span>
              <span className="reason-code">{c.reason}</span>
              <span className="muted">
                {c.author} · {reasonLabel(c.reason)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
