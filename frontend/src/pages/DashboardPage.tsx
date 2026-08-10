import { useOutletContext } from 'react-router-dom'
import { MONTH_OPTIONS, type DeveloperRow, type PayrollResponse } from '../api'
import { SortableTable } from '../components/SortableTable'
import { PageHeader } from '../components/PageHeader'
import { SummaryCards } from '../components/SummaryCards'
import { formatMoney, formatNumber } from '../format'
import { usePayroll } from '../PayrollContext'

export function DashboardPage() {
  const data = useOutletContext<PayrollResponse>()
  const { month, monthLabel, setMonth } = usePayroll()
  const { totals, developers } = data

  return (
    <section className="page">
      <PageHeader
        title={`Payroll — ${monthLabel}`}
        actions={
          <label className="month-picker">
            <span>Month</span>
            <input
              type="month"
              value={month}
              min="2026-01"
              max="2026-12"
              list="payroll-months"
              onChange={(e) => {
                if (e.target.value) setMonth(e.target.value)
              }}
            />
            <datalist id="payroll-months">
              {MONTH_OPTIONS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>
        }
      />

      <SummaryCards
        cards={[
          { label: 'Developers', value: formatNumber(developers.length) },
          { label: 'Paid Tasks', value: formatNumber(totals.tasks) },
          { label: 'Story Points', value: formatNumber(totals.points) },
          { label: 'Fixed', value: formatMoney(totals.fixed) },
          { label: 'Piece Rate', value: formatMoney(totals.piece) },
          {
            label: 'Total Payroll',
            value: formatMoney(totals.total),
            emphasize: true,
          },
        ]}
      />

      <div className="panel">
        <div className="panel-head">
          <h2>Developers</h2>
        </div>
        <SortableTable<DeveloperRow>
          rows={developers}
          rowKey={(r) => r.name}
          defaultSortKey="total"
          defaultSortDir="desc"
          columns={[
            { key: 'name', label: 'Developer' },
            {
              key: 'tasks',
              label: 'Tasks',
              align: 'right',
              render: (r) => formatNumber(r.tasks),
            },
            {
              key: 'points',
              label: 'Points',
              align: 'right',
              render: (r) => formatNumber(r.points),
            },
            {
              key: 'piece',
              label: 'Piece',
              align: 'right',
              render: (r) => formatMoney(r.piece),
            },
            {
              key: 'fixed',
              label: 'Fixed',
              align: 'right',
              render: (r) => formatMoney(r.fixed),
            },
            {
              key: 'total',
              label: 'Total',
              align: 'right',
              render: (r) => formatMoney(r.total),
            },
            {
              key: 'activeDays',
              label: 'Active Days',
              align: 'right',
              render: (r) => formatNumber(r.activeDays),
            },
            {
              key: 'commits',
              label: 'Commits',
              align: 'right',
              render: (r) => formatNumber(r.commits),
            },
          ]}
        />
      </div>
    </section>
  )
}
