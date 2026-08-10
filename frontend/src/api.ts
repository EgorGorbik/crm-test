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

export const PAYROLL_MONTH = '2026-07'
export const PAYROLL_MONTH_LABEL = 'July 2026'

export async function fetchPayroll(
  month: string = PAYROLL_MONTH,
): Promise<PayrollResponse> {
  const res = await fetch(`/api/payroll?month=${encodeURIComponent(month)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}
