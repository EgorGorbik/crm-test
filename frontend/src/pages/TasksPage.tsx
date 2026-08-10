import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { PayrollResponse, TaskRecord } from '../api'
import { SortableTable } from '../components/SortableTable'
import { PageHeader } from '../components/PageHeader'
import { PayrollStatus } from '../components/PayrollStatus'
import { formatNumber } from '../format'

type TaskRow = TaskRecord & {
  estimateLabel: string
  resolvedLabel: string
  reasonKey: string
}

function dash(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export function TasksPage() {
  const data = useOutletContext<PayrollResponse>()

  const rows: TaskRow[] = useMemo(
    () =>
      data.tasks.map((t) => ({
        ...t,
        estimateLabel:
          t.estimate === null || t.estimate === undefined
            ? t.points != null
              ? `median → ${formatNumber(t.points)}`
              : '—'
            : formatNumber(t.estimate),
        resolvedLabel: t.resolvedAt
          ? t.resolvedAt.replace('T', ' ').replace('Z', '')
          : '—',
        reasonKey: t.reason ?? '',
      })),
    [data.tasks],
  )

  const included = rows.filter((r) => r.payrollStatus === 'Included').length
  const excluded = rows.length - included

  return (
    <section className="page">
      <PageHeader
        title="Tasks"
        subtitle={`${rows.length} tasks · ${included} included · ${excluded} excluded`}
      />

      <div className="panel">
        <div className="panel-head">
          <h2>All tasks</h2>
        </div>
        <SortableTable<TaskRow>
          rows={rows}
          rowKey={(r) => r.key}
          defaultSortKey="key"
          columns={[
            { key: 'key', label: 'Key', render: (r) => <code>{r.key}</code> },
            { key: 'project', label: 'Project', render: (r) => dash(r.project) },
            { key: 'type', label: 'Type', render: (r) => dash(r.type) },
            { key: 'status', label: 'Status', render: (r) => dash(r.status) },
            {
              key: 'estimateLabel',
              label: 'Estimate',
              align: 'right',
              render: (r) => r.estimateLabel,
            },
            {
              key: 'assignee',
              label: 'Assignee',
              render: (r) => dash(r.assignee),
            },
            {
              key: 'resolvedLabel',
              label: 'Resolved At',
              render: (r) => r.resolvedLabel,
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
