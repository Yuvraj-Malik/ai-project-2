import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/about', label: 'About' },
  { to: '/', label: 'Command Deck' },
  { to: '/predict', label: 'Predict Lab' },
  { to: '/live', label: 'Live Analysis' },
  { to: '/evaluation', label: 'Evaluation' },
  { to: '/methodology', label: 'Methodology' },
]

function Shell({ children, onLogout }) {
  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <header className="topbar">
        <div>
          <span className="eyebrow">Rolls Royce Engine AI</span>
          <strong className="brand-mark">LSTM Control Center</strong>
        </div>

        <nav className="nav-pills" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-pill active' : 'nav-pill')}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
          <button className="nav-pill logout-btn" onClick={onLogout}>Exit</button>
        </nav>
      </header>

      <main className="dashboard">{children}</main>
    </div>
  )
}

export default Shell
