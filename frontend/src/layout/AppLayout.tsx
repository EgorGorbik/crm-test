import { NavLink, Outlet } from 'react-router-dom'
import { usePayroll } from '../PayrollContext'

const NAV = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/developers', label: 'Developers' },
  { to: '/tasks', label: 'Tasks' },
  { to: '/commits', label: 'Commits' },
  { to: '/excluded', label: 'Excluded', accent: true },
]

export function AppLayout() {
  const { loading, error, data, monthLabel } = usePayroll()
  const excludedCount = data
    ? data.excluded.tasks.length + data.excluded.commits.length
    : 0

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <div>
            <div className="brand-title">Payroll</div>
            <div className="brand-sub">Internal CRM</div>
          </div>
        </div>

        <div className="nav-label">Navigation</div>
        <nav className="nav">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  'nav-link',
                  isActive ? 'active' : '',
                  item.accent ? 'accent' : '',
                ]
                  .filter(Boolean)
                  .join(' ')
              }
            >
              <span>{item.label}</span>
              {item.accent && excludedCount > 0 && (
                <span className="nav-badge">{excludedCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">Period: {monthLabel}</div>
      </aside>

      <div className="main">
        {loading && <div className="banner">Loading payroll data…</div>}
        {error && (
          <div className="banner error">
            {error}. Is the API running on port 8000?
          </div>
        )}
        {data && <Outlet context={data} />}
      </div>
    </div>
  )
}
