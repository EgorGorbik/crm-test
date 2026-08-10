import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  DEFAULT_MONTH,
  fetchPayroll,
  formatMonthLabel,
  type PayrollResponse,
} from './api'

type PayrollState = {
  month: string
  monthLabel: string
  setMonth: (month: string) => void
  data: PayrollResponse | null
  loading: boolean
  error: string | null
  reload: () => void
}

const PayrollContext = createContext<PayrollState | null>(null)

export function PayrollProvider({ children }: { children: ReactNode }) {
  const [month, setMonth] = useState(DEFAULT_MONTH)
  const [data, setData] = useState<PayrollResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchPayroll(month)
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
  }, [month, tick])

  return (
    <PayrollContext.Provider
      value={{
        month,
        monthLabel: formatMonthLabel(month),
        setMonth,
        data,
        loading,
        error,
        reload: () => setTick((n) => n + 1),
      }}
    >
      {children}
    </PayrollContext.Provider>
  )
}

export function usePayroll(): PayrollState {
  const ctx = useContext(PayrollContext)
  if (!ctx) throw new Error('usePayroll must be used within PayrollProvider')
  return ctx
}
