import { useEffect, useState } from 'react'
import { fetchPayroll, type PayrollResponse } from './api'
import { ExcludedPanel } from './ExcludedPanel'
import { PayrollTable } from './PayrollTable'
import './App.css'

const MONTH = '2026-07'

function App() {
  const [data, setData] = useState<PayrollResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPayroll(MONTH)
      .then((payload) => {
        if (!cancelled) {
          setData(payload)
          setError(null)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load payroll')
          setData(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totalsRow = data
    ? {
        name: 'Totals',
        tasks: data.totals.tasks,
        points: data.totals.points,
        piece: data.totals.piece,
        fixed: data.totals.fixed,
        total: data.totals.total,
        activeDays: 0,
        commits: 0,
      }
    : null

  return (
    <main className="page">
      <header>
        <h1>Payroll — July 2026</h1>
        <p className="subtitle">
          Piece rate: estimate × 25. Fixed monthly amount included per developer.
        </p>
      </header>

      {loading && <p className="status">Loading…</p>}
      {error && (
        <p className="status error">
          {error}. Is the API running on port 8000?
        </p>
      )}

      {data && (
        <>
          <PayrollTable rows={data.developers} totals={totalsRow} />
          <ExcludedPanel excluded={data.excluded} />
        </>
      )}
    </main>
  )
}

export default App
