import { useMemo, useState, type ReactNode } from 'react'

export type SortDir = 'asc' | 'desc'

type Column<T> = {
  key: keyof T & string
  label: string
  align?: 'left' | 'right'
  render?: (row: T) => ReactNode
}

type Props<T extends Record<string, unknown>> = {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  defaultSortKey: keyof T & string
  defaultSortDir?: SortDir
  onRowClick?: (row: T) => void
  selectedKey?: string | null
  footer?: ReactNode
}

export function SortableTable<T extends Record<string, unknown>>({
  rows,
  columns,
  rowKey,
  defaultSortKey,
  defaultSortDir = 'asc',
  onRowClick,
  selectedKey,
  footer,
}: Props<T>) {
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDir, setSortDir] = useState<SortDir>(defaultSortDir)

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

  function onSort(key: keyof T & string) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(typeof rows[0]?.[key] === 'string' ? 'asc' : 'desc')
    }
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === 'right' ? 'num' : undefined}
              >
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
          {sorted.map((row) => {
            const key = rowKey(row)
            return (
              <tr
                key={key}
                className={[
                  onRowClick ? 'clickable' : '',
                  selectedKey === key ? 'selected' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'num' : undefined}
                  >
                    {col.render
                      ? col.render(row)
                      : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            )
          })}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="empty">
                No records
              </td>
            </tr>
          )}
        </tbody>
        {footer}
      </table>
    </div>
  )
}
