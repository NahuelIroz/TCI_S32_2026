import type { ReactNode } from "react";
import type { User } from "./types";
import { Icon } from "./UI";

interface AppLayoutProps {
  active: string;
  title: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
  onScan: () => void;
  onNotifications: () => void;
  onProfile: () => void;
  user: User;
}

function Sidebar({ active, onNavigate, user }: Pick<AppLayoutProps, "active" | "onNavigate" | "user">) {
  const items = [
    ["home", "Inicio", "dashboard"], ["stock", "Stock", "stock"], ["incident", "Incidencias", "incidents"],
    ["alert", "Alertas", "alerts"], ["wrench", "Mantenimientos", "maintenance"], ["cart", "Compras", "purchases"],
    ["machine", "Máquinas", "machines"], ["report", "Reportes", "reports"], ["settings", "Configuración", "settings"]
  ];

  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark">✚</div><div><strong>Mantenimiento</strong><small>PHARMA</small></div></div>
    <nav>{items.map(([icon, label, id]) => <button key={id} className={active === id ? "nav-item active" : "nav-item"} onClick={() => onNavigate(id)}><Icon name={icon}/><span>{label}</span></button>)}</nav>
    <div className="sidebar-user"><div className="avatar">JP</div><div><b>{user.name}</b><small>{user.role}</small></div></div>
  </aside>;
}

function Topbar({ title, onScan, onNotifications, onProfile }: Pick<AppLayoutProps, "title" | "onScan" | "onNotifications" | "onProfile">) {
  return <header className="topbar"><div className="mobile-title">{title}</div><div className="search-global"><Icon name="search"/><input placeholder="Buscar en el sistema..." /></div><div className="top-actions"><button onClick={onScan} title="Escanear" aria-label="Escanear"><Icon name="scan"/></button><button onClick={onNotifications} title="Notificaciones" aria-label="Notificaciones">🔔</button><button className="profile-mini" onClick={onProfile} aria-label="Perfil">JP</button></div></header>;
}

function MobileNav({ active, onNavigate }: Pick<AppLayoutProps, "active" | "onNavigate">) {
  const items = [["home", "Inicio", "mobile-menu"], ["scan", "Escanear", "scan"], ["stock", "Stock", "stock"], ["incident", "Incidencias", "incidents"], ["settings", "Más", "more"]];
  return <nav className="mobile-nav" aria-label="Navegación principal móvil">{items.map(([icon, label, id]) => <button key={id} className={active === id || (id === "mobile-menu" && active === "dashboard") ? "mobile-nav-item active" : "mobile-nav-item"} onClick={() => onNavigate(id === "more" ? "mobile-menu" : id)}><Icon name={icon}/><span>{label}</span></button>)}</nav>;
}

export function AppLayout({ active, title, onNavigate, children, onScan, onNotifications, onProfile, user }: AppLayoutProps) {
  return <div className="app-shell"><Sidebar active={active} onNavigate={onNavigate} user={user}/><div className="main"><Topbar title={title} onScan={onScan} onNotifications={onNotifications} onProfile={onProfile}/><main className="content">{children}</main></div><MobileNav active={active} onNavigate={onNavigate}/></div>;
}