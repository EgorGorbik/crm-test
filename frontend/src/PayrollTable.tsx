import { useMemo, useState } from 'react'
import type { DeveloperRow } from './api'

type SortKey = keyof DeveloperRow
type SortDir = 'asc' | 'desc'

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Developer' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'points', label: 'Points' },
  { key: 'piece', label: 'Piece' },
  { key: 'fixed', label: 'Fixed' },
  { key: 'total', label: 'Total' },
  { key: 'activeDays', label: 'Active Days' },
  { key: 'commits', label: 'Commits' },
]

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

type Props = {
  rows: DeveloperRow[]
  totals: DeveloperRow | null
}

export function PayrollTable({ rows, totals }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      let cmp = 0
      if (typeof av === 'string' && typeof bv === 'string') {
        cmp = av.localeCompare(bv)
      } else {
        cmp = Number(av) - Number(bv)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, sortDir])

  function onSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key}>
                <button
                  type="button"
                  className={sortKey === col.key ? 'sorted' : ''}
                  onClick={() => onSort(col.key)}
                >
                  {col.label}
                  {sortKey === col.key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={row.name}>
              <td>{row.name}</td>
              <td>{row.tasks}</td>
              <td>{formatNumber(row.points)}</td>
              <td>{formatNumber(row.piece)}</td>
              <td>{formatNumber(row.fixed)}</td>
              <td>{formatNumber(row.total)}</td>
              <td>{row.activeDays}</td>
              <td>{row.commits}</td>
            </tr>
          ))}
        </tbody>
        {totals && (
          <tfoot>
            <tr>
              <td>Totals</td>
              <td>{totals.tasks}</td>
              <td>{formatNumber(totals.points)}</td>
              <td>{formatNumber(totals.piece)}</td>
              <td>{formatNumber(totals.fixed)}</td>
              <td>{formatNumber(totals.total)}</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
