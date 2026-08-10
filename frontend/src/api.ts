export type DeveloperRow = {
  name: string
  tasks: number
  points: number
  piece: number
  fixed: number
  total: number
  activeDays: number
  commits: number
}

export type ExcludedSummary = {
  outside_period: number
  rejected: number
  duplicate: number
  invalid_status: number
  unknown_assignee: number
  no_median: number
  commit_outside_period: number
  unknown_commit_author: number
}

export type ExcludedTask = {
  key: string
  reason: string
}

export type ExcludedCommit = {
  sha: string
  author: string
  reason: string
}

export type TaskRecord = {
  key: string
  project: string | null
  type: string | null
  status: string | null
  estimate: number | null
  points: number | null
  assignee: string | null
  inProgressAt: string | null
  resolvedAt: string | null
  payrollStatus: 'Included' | 'Excluded'
  reason: string | null
}

export type CommitRecord = {
  sha: string
  author: string
  repo: string | null
  branch: string | null
  date: string | null
  message: string | null
  payrollStatus: 'Included' | 'Excluded'
  reason: string | null
}

export type PayrollResponse = {
  month: string
  period: {
    start: string
    end: string
  }
  totals: {
    tasks: number
    points: number
    piece: number
    fixed: number
    total: number
  }
  developers: DeveloperRow[]
  tasks: TaskRecord[]
  commits: CommitRecord[]
  excluded: {
    summary: ExcludedSummary
    tasks: ExcludedTask[]
    commits: ExcludedCommit[]
  }
}

export const DEFAULT_MONTH = '2026-07'

/** Months that have interesting fixture coverage. */
export const MONTH_OPTIONS = [
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
] as const

export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-').map(Number)
  if (!year || !mon) return month
  return new Date(Date.UTC(year, mon - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export async function fetchPayroll(month: string): Promise<PayrollResponse> {
  const res = await fetch(`/api/payroll?month=${encodeURIComponent(month)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}
