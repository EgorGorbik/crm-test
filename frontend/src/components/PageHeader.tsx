import type { ReactNode } from 'react'
import { usePayroll } from '../PayrollContext'

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  const { monthLabel } = usePayroll()
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p className="page-sub">
          {subtitle ?? `Selected month: ${monthLabel}`}
        </p>
      </div>
      {actions}
    </header>
  )
}
