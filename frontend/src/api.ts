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

export type PayrollResponse = {
  totals: {
    tasks: number
    points: number
    piece: number
    fixed: number
    total: number
  }
  developers: DeveloperRow[]
  excluded: {
    summary: ExcludedSummary
    tasks: { key: string; reason: string }[]
    commits: { sha: string; author: string; reason: string }[]
  }
}

export async function fetchPayroll(month: string): Promise<PayrollResponse> {
  const res = await fetch(`/api/payroll?month=${encodeURIComponent(month)}`)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }
  return res.json()
}
