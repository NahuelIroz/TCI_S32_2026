import { useState } from 'react'
import '../App.css'
import ReporteIncidencia from './reporte_incidencia'

type ActionIcon = 'scan' | 'report' | 'stock' | 'incidents'

const actions: {
  title: string
  description: string
  icon: ActionIcon
  color: string
}[] = [
  { title: 'Escanear repuesto', description: 'Ver stock y usar repuestos', icon: 'scan', color: 'blue' },
  { title: 'Reportar incidencia', description: 'Foto + máquina + descripción', icon: 'report', color: 'purple' },
  { title: 'Consultar stock', description: 'Buscar por código o nombre', icon: 'stock', color: 'blue' },
  { title: 'Mis incidencias', description: 'Ver estado de mis reportes', icon: 'incidents', color: 'blue' },
]

function ActionSymbol({ name }: { name: ActionIcon }) {
  if (name === 'scan') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 8h3v3H8zM14 8h2M14 11h3M8 14h3v3H8zM14 15v2" /></svg>
  }
  if (name === 'report') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 16h.01" /></svg>
  }
  if (name === 'stock') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h10l4 4v14H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5M8 12h8M8 16h8" /></svg>
  }
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h12a2 2 0 0 1 2 2v13H4V7a2 2 0 0 1 2-2Z" /><path d="M9 5V3h6v2M8 10h8M8 14h8M8 18h5" /></svg>
}

function NavIcon({ name }: { name: 'home' | 'scan' | 'report' | 'more' }) {
  if (name === 'home') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8M5 10v10h5v-6h4v6h5V10" /></svg>
  if (name === 'scan') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M8 9h8M8 12h8M8 15h8" /></svg>
  if (name === 'report') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8M9 12h6" /></svg>
  return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>
}

export default function Home() {
  const [pantalla, setPantalla] = useState<'home' | 'incidencia'>('home')

  if (pantalla === 'incidencia') {
    return <ReporteIncidencia onBack={() => setPantalla('home')} />
  }

  return (
    <div className="pharma-app">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Mantenimiento Pharma, inicio">
          <span className="brand-mark" aria-hidden="true">+</span>
          <span> <strong>MANTENIMIENTO</strong></span>
        </a>
        <nav className="desktop-nav" aria-label="Navegación principal">
          <a className="nav-link active" href="#inicio">Inicio</a>
          <a className="nav-link" href="#acciones">Repuestos</a>
          <a
            className="nav-link"
            href="#incidencias"
            onClick={(event) => {
              event.preventDefault()
              setPantalla('incidencia')
            }}
          >
            Incidencias
          </a>
        </nav>
        <button className="topbar-user" type="button" aria-label="Perfil de Juan Pérez">
          <span className="avatar avatar-small">JP</span>
          <span className="topbar-user-name">Juan Pérez</span>
          <span className="chevron" aria-hidden="true">⌄</span>
        </button>
      </header>

      <main id="inicio" className="dashboard">
        <section className="welcome-card" aria-label="Perfil de usuario">
          <div className="welcome-user">
            <span className="avatar avatar-large">JP</span>
            <div>
              <p className="eyebrow">Panel de mantenimiento</p>
              <h1>Hola, Juan Pérez</h1>
              <p className="user-role">Operario <span>·</span> Turno Mañana</p>
            </div>
          </div>
        </section>

        <section id="acciones" className="quick-actions">
          <div className="section-heading">
            <div>
              <p className="eyebrow">¿Qué necesitás hacer?</p>
            </div>
            <span className="section-note">Seleccioná una opción</span>
          </div>
          <div className="action-grid">
            {actions.map((action) => (
              <button
                className="action-card"
                type="button"
                key={action.title}
                onClick={() => {
                  if (action.icon === 'report') setPantalla('incidencia')
                }}
              >
                <span className={`action-icon ${action.color}`}><ActionSymbol name={action.icon} /></span>
                <span className="action-copy"><strong>{action.title}</strong><span>{action.description}</span></span>
                <span className="action-arrow" aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="dashboard-footer">
          <span><span className="footer-cross">+</span> Mantenimiento</span>
        </footer>
      </main>

      <nav className="mobile-nav" aria-label="Navegación inferior">
        <a className="mobile-nav-item selected" href="#inicio"><NavIcon name="home" /><span>Inicio</span></a>
        <a className="mobile-nav-item" href="#acciones"><NavIcon name="scan" /><span>Escanear</span></a>
        <button
          className="mobile-nav-item"
          type="button"
          onClick={() => setPantalla('incidencia')}
        >
          <NavIcon name="report" /><span>Incidencias</span>
        </button>
        <button className="mobile-nav-item" type="button"><NavIcon name="more" /><span>Más</span></button>
      </nav>
    </div>
  )
}
