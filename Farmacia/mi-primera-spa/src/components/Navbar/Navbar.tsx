import { useState, useEffect, useRef } from "react";
import { getAccionesParaRol, tienePermiso, type PerfilUsuario, type AccionPerfil } from "../../auth/permisos";
import ActionIcon from "../icons/ActionIcon";
import "./Navbar.css";

interface Props {
  usuario: PerfilUsuario;
  pantallaActual: string;
  onInicio: () => void;
  onAccion: (id: string) => void;
  onCerrarSesion?: () => void;
}
const destinos: Record<string, string> = {
  "reportar-incidencia": "incidencia", "mis-incidencias": "misIncidencias",
  "gestionar-incidencias": "gestionIncidencias", "escanear-qr": "scan",
  "ingresar-stock": "ingresarStock", "consultar-stock": "stock",
  "registrar-uso": "registrarUso", "pedidos-compra": "pedidosCompra",
  "gestionar-compras": "gestionarCompras", "cargar-stock-recibido": "cargarStockRecibido",
  "supervisar-tareas": "supervisarTareas", "gestionar-repuestos": "gestionarRepuestos",
  "gestionar-maquinas": "gestionarMaquinas", "tableros-seguimiento": "tablerosSeguimiento",
  "visualizar-incidencias": "visualizarIncidencias", "estado-maquinas": "estadoMaquinas",
  "estadisticas-historicos": "estadisticasHistoricos", "notificaciones-compras": "notificacionesCompras",
  "trazabilidad": "trazabilidad", "alta-maquinaria": "altaMaquinaria",
};
function grupo(a: AccionPerfil) {
  if (a.permiso.startsWith("incidencias")) return "Incidencias";
  if (a.permiso.startsWith("compras")) return "Compras";
  if (a.permiso.startsWith("stock") || a.permiso.startsWith("repuestos") || a.id === "registrar-uso") return "Stock";
  if (a.permiso.startsWith("maquinas")) return "Equipos";
  return "Seguimiento";
}
export default function Navbar({ usuario, pantallaActual, onInicio, onAccion, onCerrarSesion }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const cerrar = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) { setPanel(null); setAbierto(false); } };
    const tecla = (e: KeyboardEvent) => { if (e.key === "Escape") { setPanel(null); setAbierto(false); } };
    document.addEventListener("pointerdown", cerrar);
    document.addEventListener("keydown", tecla);
    return () => { document.removeEventListener("pointerdown", cerrar); document.removeEventListener("keydown", tecla); };
  }, []);
  const acciones = getAccionesParaRol(usuario.rol).filter(a => tienePermiso(usuario.rol, a.permiso));
  if (usuario.rol === "ENCARGADO") acciones.push(
    { id: "trazabilidad", permiso: "stock.consultar", titulo: "Trazabilidad", descripcion: "", icono: "stock", color: "teal" },
    { id: "alta-maquinaria", permiso: "maquinas.gestionar", titulo: "Nueva máquina", descripcion: "", icono: "machine", color: "teal" }
  );
  const grupos = [...new Set(acciones.map(grupo))];
  const navegar = (fn: () => void) => { setAbierto(false); setPanel(null); fn(); window.scrollTo(0, 0); };
  const opcion = (a: AccionPerfil) => <button key={a.id} type="button" className="pn-option" aria-current={destinos[a.id] === pantallaActual ? "page" : undefined} onClick={() => navegar(() => onAccion(a.id))}><ActionIcon name={a.icono}/><span>{a.titulo}</span></button>;
  return <header className="pn-header" ref={ref}>
    <div className="pn-inner">
      <button className="pn-brand" type="button" onClick={() => navegar(onInicio)}><span className="pn-mark">+</span><span><strong>Pharma</strong><small>Gestión de mantenimiento</small></span></button>
      <button type="button" className="pn-toggle" aria-label="Menú de navegación" aria-expanded={abierto} aria-controls="pn-navigation" onClick={() => {setAbierto(!abierto); setPanel(null);}}>{abierto ? "✕" : "☰"}</button>
      <nav id="pn-navigation" className={`pn-nav ${abierto ? "pn-open" : ""}`} aria-label="Navegación principal">
        <button type="button" className="pn-link" aria-current={pantallaActual === "home" ? "page" : undefined} onClick={() => navegar(onInicio)}>Inicio</button>
        {grupos.map(g => <div className="pn-group" key={g}>
          <button type="button" className={`pn-link ${acciones.some(a => grupo(a) === g && destinos[a.id] === pantallaActual) ? "pn-active" : ""}`} aria-expanded={panel === g} onClick={() => setPanel(panel === g ? null : g)}>{g} <span aria-hidden="true">⌄</span></button>
          {panel === g && <div className="pn-dropdown">{acciones.filter(a => grupo(a) === g).map(opcion)}</div>}
        </div>)}
        <div className="pn-group pn-profile"><button type="button" className="pn-user" aria-expanded={panel === "perfil"} onClick={() => setPanel(panel === "perfil" ? null : "perfil")}><span className="pn-avatar">{usuario.avatar}</span><span><strong>{usuario.nombre}</strong><small>{usuario.rol}</small></span><span>⌄</span></button>
          {panel === "perfil" && <div className="pn-dropdown pn-profile-menu"><span className="pn-profile-info">{usuario.titulo} · {usuario.turno}</span>{onCerrarSesion && <button type="button" className="pn-option pn-logout" onClick={() => {if (window.confirm("¿Deseás cerrar la sesión actual?")) navegar(onCerrarSesion);}}>Cerrar sesión</button>}</div>}
        </div>
      </nav>
    </div>
  </header>;
}
