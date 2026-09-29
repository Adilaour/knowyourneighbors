import { NavLink } from 'react-router-dom'
import AppRoutes from './routes'

export default function App() {
  return (
    <div className="app">
      <header className="app__header">
        <span className="app__logo">🏘️ KnowYourNeighbors</span>
        <nav className="app__nav">
          <NavLink to="/map" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Karte
          </NavLink>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Kontakte
          </NavLink>
          <NavLink to="/admin/contacts" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Kontakte verwalten
          </NavLink>
          <NavLink to="/admin/houses" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Häuser verwalten
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? 'is-active' : '')}>
            Einstellungen
          </NavLink>
        </nav>
      </header>
      <main className="app__main">
        <AppRoutes />
      </main>
    </div>
  )
}
