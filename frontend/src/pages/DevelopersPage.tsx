import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import type { DeveloperRow, PayrollResponse } from '../api'
import { SortableTable } from '../components/SortableTable'
import { PageHeader } from '../components/PageHeader'
import { formatMoney, formatNumber } from '../format'

export function DevelopersPage() {
  const data = useOutletContext<PayrollResponse>()
  const [selected, setSelected] = useState<DeveloperRow | null>(null)

  return (
    <section className="page">
      <PageHeader
        title="Developers"
        subtitle={`${data.developers.length} developers · click a row for details`}
      />

      <div className="panel">
        <SortableTable<DeveloperRow>
          rows={data.developers}
          rowKey={(r) => r.name}
          defaultSortKey="name"
          defaultSortDir="asc"
          selectedKey={selected?.name ?? null}
          onRowClick={(row) =>
            setSelected((prev) => (prev?.name === row.name ? null : row))
          }
          columns={[
            { key: 'name', label: 'Name' },
            {
              key: 'fixed',
              label: 'Fixed',
              align: 'right',
              render: (r) => formatMoney(r.fixed),
            },
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

      {selected && (
        <div className="drawer-backdrop" onClick={() => setSelected(null)}>
          <aside
            className="drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-head">
              <h2>Developer</h2>
              <button
                type="button"
                className="ghost"
                onClick={() => setSelected(null)}
              >
                Close
              </button>
            </div>
            <div className="drawer-title">{selected.name}</div>
            <dl className="kv">
              <div>
                <dt>Fixed</dt>
                <dd>{formatMoney(selected.fixed)}</dd>
              </div>
              <div>
                <dt>Piece</dt>
                <dd>{formatMoney(selected.piece)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd>{formatMoney(selected.total)}</dd>
              </div>
              <div>
                <dt>Tasks</dt>
                <dd>{formatNumber(selected.tasks)}</dd>
              </div>
              <div>
                <dt>Points</dt>
                <dd>{formatNumber(selected.points)}</dd>
              </div>
              <div>
                <dt>Active Days</dt>
                <dd>{formatNumber(selected.activeDays)}</dd>
              </div>
              <div>
                <dt>Commits</dt>
                <dd>{formatNumber(selected.commits)}</dd>
              </div>
            </dl>
            <p className="hint">
              Task/commit lists per developer are not returned by the current
              API.
            </p>
          </aside>
        </div>
      )}
    </section>
  )
}
