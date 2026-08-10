type Props = {
  included?: boolean
  reason?: string
}

export function PayrollStatus({ included, reason }: Props) {
  if (included) {
    return (
      <span className="status status-ok">
        <span className="status-main">Included</span>
      </span>
    )
  }
  return (
    <span className="status status-bad">
      <span className="status-main">Excluded</span>
      {reason && <span className="status-reason">{reason}</span>}
    </span>
  )
}
