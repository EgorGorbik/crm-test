import type { ReactNode } from 'react'
import { PAYROLL_MONTH_LABEL } from '../api'

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p className="page-sub">
          {subtitle ?? `Selected month: ${PAYROLL_MONTH_LABEL}`}
        </p>
      </div>
      {actions}
    </header>
  )
}
