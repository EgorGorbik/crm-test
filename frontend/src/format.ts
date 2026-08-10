export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toLocaleString('en-US', { maximumFractionDigits: 1 })
}

export function reasonLabel(reason: string): string {
  const map: Record<string, string> = {
    outside_period: 'Outside period',
    rejected: 'Rejected',
    duplicate: 'Duplicate',
    not_payable_status: 'Non-payable status',
    unknown_assignee: 'Unknown assignee',
    no_median: 'No median',
    unknown_author: 'Unknown author',
    commit_outside_period: 'Outside period',
    unknown_commit_author: 'Unknown author',
  }
  return map[reason] ?? reason
}
