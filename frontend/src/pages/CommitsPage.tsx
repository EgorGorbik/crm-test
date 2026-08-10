import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { CommitRecord, PayrollResponse } from '../api'
import { SortableTable } from '../components/SortableTable'
import { PageHeader } from '../components/PageHeader'
import { PayrollStatus } from '../components/PayrollStatus'

type CommitRow = CommitRecord & {
  shortSha: string
  dateLabel: string
  reasonKey: string
}

function dash(value: string | null | undefined): string {
  if (!value) return '—'
  return value
}

export function CommitsPage() {
  const data = useOutletContext<PayrollResponse>()

  const rows: CommitRow[] = useMemo(
    () =>
      data.commits.map((c) => ({
        ...c,
        shortSha: c.sha.slice(0, 8),
        dateLabel: c.date
          ? c.date.replace('T', ' ').replace('Z', '')
          : '—',
        reasonKey: c.reason ?? '',
      })),
    [data.commits],
  )

  const included = rows.filter((r) => r.payrollStatus === 'Included').length
  const excluded = rows.length - included

  return (
    <section className="page">
      <PageHeader
        title="Commits"
        subtitle={`${rows.length} commits · ${included} included · ${excluded} excluded`}
      />

      <div className="panel">
        <div className="panel-head">
          <h2>All commits</h2>
        </div>
        <SortableTable<CommitRow>
          rows={rows}
          rowKey={(r) => r.sha}
          defaultSortKey="dateLabel"
          defaultSortDir="desc"
          columns={[
            {
              key: 'shortSha',
              label: 'SHA',
              render: (r) => <code title={r.sha}>{r.shortSha}</code>,
            },
            { key: 'author', label: 'Author' },
            {
              key: 'repo',
              label: 'Repository',
              render: (r) => dash(r.repo),
            },
            {
              key: 'branch',
              label: 'Branch',
              render: (r) => dash(r.branch),
            },
            {
              key: 'dateLabel',
              label: 'Date',
              render: (r) => r.dateLabel,
            },
            {
              key: 'message',
              label: 'Message',
              render: (r) => dash(r.message),
            },
            {
              key: 'payrollStatus',
              label: 'Payroll Status',
              render: (r) => (
                <PayrollStatus
                  included={r.payrollStatus === 'Included'}
                  reason={r.reason ?? undefined}
                />
              ),
            },
          ]}
        />
      </div>
    </section>
  )
}
