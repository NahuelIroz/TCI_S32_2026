import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Incident, Machine, Part, User } from "./types";
import { AppLayout } from "./AppLayout";
import { Badge, Button, Card, Field, Icon, KPI, PageHeader } from "./UI";
import "./styles.css";

// Datos de muestra para desarrollar las pantallas antes de conectar la API.
const initialParts: Part[] = [
  { id:"REP-0047", name:"Rodamiento 6205", stock:12, min:5, location:"Est. A-3 / P-2", status:"OK", machines:["B-005","FR-003","C-012"] },
  { id:"REP-0123", name:"Correa B-123", stock:3, min:5, location:"Est. B-1 / P-4", status:"Bajo", machines:["B-005","C-015"] },
  { id:"REP-0187", name:"Filtro de aire", stock:25, min:10, location:"Est. C-2 / P-3", status:"OK", machines:["FR-003","C-012"] },
  { id:"REP-0098", name:"Válvula solenoide", stock:0, min:5, location:"Est. A-1 / P-4", status:"Crítico", machines:["FR-009"] },
  { id:"REP-0330", name:"Junta tórica", stock:18, min:10, location:"Est. B-3 / P-4", status:"OK", machines:["C-015"] },
  { id:"REP-0456", name:"Bomba de agua", stock:7, min:10, location:"Est. C-1 / P-1", status:"Bajo", machines:["M-003"] }
];

const machines: Machine[] = [
  { id:"FR-003", name:"Fraccionador 3", status:"Operativa", area:"Fraccionamiento", last:"12/09/2026" },
  { id:"B-005", name:"Banda transportadora 5", status:"Mantenimiento", area:"Producción", last:"10/09/2026" },
  { id:"C-012", name:"Caldera 12", status:"Operativa", area:"Servicios", last:"11/09/2026" },
  { id:"C-015", name:"Compresor 15", status:"Operativa", area:"Servicios", last:"08/09/2026" },
  { id:"M-003", name:"Bomba de agua 3", status:"Fuera de servicio", area:"Planta", last:"06/09/2026" }
];

const incidents: Incident[] = [
  { id:"INC-0045", machine:"FR-003", description:"Fuga de líquido", status:"En proceso", priority:"Alta", date:"20/09/2026 09:15" },
  { id:"INC-0044", machine:"B-005", description:"Ruido anormal", status:"Abierta", priority:"Media", date:"19/09/2026 14:20" },
  { id:"INC-0043", machine:"M-003", description:"No enciende", status:"En proceso", priority:"Baja", date:"18/09/2026 11:03" },
  { id:"INC-0042", machine:"C-012", description:"Temperatura alta", status:"Cerrada", priority:"Media", date:"17/09/2026 08:50" }
];

function Dashboard({parts, onNavigate}: {parts: Part[]; onNavigate: (id: string) => void}) {
  const low = parts.filter(p=>p.stock<=p.min).length;
  return <div>
    <PageHeader title="¡Hola, Juan!" subtitle="Resumen general de la operación de mantenimiento." />
    <div className="kpis">
      <KPI label="Total repuestos" value="1.248" icon="▣"/>
      <KPI label="Stock bajo" value={low} icon="⚠" tone="danger"/>
      <KPI label="Incidencias abiertas" value="6" icon="!" tone="warning"/>
      <KPI label="Máquinas operativas" value="12 / 14" icon="✓" tone="success"/>
    </div>
    <div className="grid-2">
      <Card title="Estado de máquinas"><Donut/></Card>
      <Card title="Últimas incidencias" action={<Button variant="link" onClick={()=>onNavigate("incidents")}>Ver todas →</Button>}>
        <IncidentTable rows={incidents.slice(0,4)} />
      </Card>
    </div>
    <div className="grid-2">
      <Card title="Alertas de stock"><StockAlerts parts={parts.filter(p=>p.stock<=p.min).slice(0,4)} onSelect={()=>onNavigate("stock")}/></Card>
      <Card title="Mantenimientos próximos"><MaintenanceList/></Card>
    </div>
  </div>;
}

function Login({onLogin}: {onLogin: () => void}) {
  const [user,setUser]=useState("");
  const [password,setPassword]=useState("");
  return <main className="login-screen"><section className="login-panel"><div className="login-logo"><span className="brand-mark">✚</span><div><strong>Mantenimiento Pharma</strong><small>Stock · Incidencias · Trazabilidad</small></div></div><form className="login-form" onSubmit={event=>{event.preventDefault();onLogin();}}><label className="login-field"><span>Usuario</span><input value={user} onChange={event=>setUser(event.target.value)} placeholder="Ingresá tu usuario" autoComplete="username" required /></label><label className="login-field"><span>Contraseña</span><input type="password" value={password} onChange={event=>setPassword(event.target.value)} placeholder="Ingresá tu contraseña" autoComplete="current-password" required /></label><Button type="submit">Ingresar</Button><button type="button" className="text-button">¿Olvidaste tu contraseña?</button></form><small className="login-foot">Acceso seguro · Planta farmacéutica</small></section></main>;
}

function MobileMenu({user,parts,onNavigate}: {user: User; parts: Part[]; onNavigate: (id: string) => void}) {
  const low=parts.filter(part=>part.stock<=part.min).length;
  const actions=[
    ["scan","Escanear repuesto","Ver stock y usar repuestos","scan"],
    ["incident","Reportar incidencia","Máquina + foto + descripción","new-incident"],
    ["stock","Consultar stock","Buscar por código o nombre","stock"],
    ["alert","Mis incidencias","Ver reportes del equipo","incidents"],
    ["camera","Reconocer por foto","Identificar un repuesto","photo-identify"],
    ["calendar","Planificar mantenimiento","Ver tareas y reservas","maintenance"]
  ];
  return <div className="mobile-home"><div className="mobile-welcome"><div className="avatar">JP</div><div><small>Buen día,</small><h1>{user.name}</h1><span>{user.role}</span></div><button className="icon-button" onClick={()=>onNavigate("alerts")} aria-label="Ver alertas"><Icon name="alert"/><i>{low}</i></button></div><div className="mobile-menu-grid">{actions.map(([icon,title,description,id])=><button className="mobile-menu-card" key={id} onClick={()=>onNavigate(id)}><span className="menu-icon"><Icon name={icon}/></span><span className="menu-copy"><b>{title}</b><small>{description}</small></span><span className="menu-arrow">›</span></button>)}</div><button className="mobile-alert-strip" onClick={()=>onNavigate("alerts")}><span className="alert-mark">!</span><span><b>{low} repuestos requieren atención</b><small>Revisar alertas de stock</small></span><span>›</span></button></div>;
}

function Alerts({parts,onSelectPart,onNavigate}: {parts: Part[]; onSelectPart: (part: Part) => void; onNavigate: (id: string) => void}) {
  const low=parts.filter(part=>part.stock<=part.min);
  return <div><PageHeader title="Alertas de stock" subtitle={`${low.length} repuestos por debajo del mínimo configurado.`}/><div className="alerts-screen-list">{low.map(part=><button className="alert-card" key={part.id} onClick={()=>onSelectPart(part)}><span className="alert-icon">!</span><span className="alert-info"><b>{part.name}</b><small>{part.id} · {part.location}</small></span><strong>{part.stock} <small>mín. {part.min}</small></strong></button>)}</div><Button variant="secondary" onClick={()=>onNavigate("purchases")}>Ver lista de compras</Button></div>;
}

function PhotoIdentify({parts,onSelect}: {parts: Part[]; onSelect: (part: Part) => void}) {
  const [photo,setPhoto]=useState<string|null>(null);
  const identified=parts.find(part=>part.id==="REP-0187")??parts[0];
  return <div><PageHeader title="Reconocer repuesto" subtitle="Tomá una foto o elegí una imagen para identificar la pieza."/><Card className="photo-card"><label className="photo-upload"><input type="file" accept="image/*" capture="environment" onChange={event=>{const file=event.target.files?.[0];if(file)setPhoto(URL.createObjectURL(file));}}/><span className="photo-icon">▧</span><b>{photo?"Cambiar foto":"Tomar foto o cargar imagen"}</b><small>JPG o PNG · Usá una imagen nítida del repuesto</small></label>{photo&&<div className="photo-result"><img src={photo} alt="Foto del repuesto cargada"/><div><span className="eyebrow">REPUESTO IDENTIFICADO</span><h2>{identified.name}</h2><p>{identified.id} · {identified.stock} unidades · {identified.location}</p><Button onClick={()=>onSelect(identified)}>Ver detalle</Button></div></div>}</Card></div>;
}

function Donut() {
  return <div className="donut-wrap"><div className="donut"><div>86%<small>operativas</small></div></div><div className="legend"><span>● Operativas <b>12</b></span><span>● En mantenimiento <b>1</b></span><span>● Fuera de servicio <b>1</b></span></div></div>;
}

function IncidentTable({rows}: {rows: Incident[]}) {
  return <div className="table-wrap"><table><thead><tr><th>ID</th><th>Máquina</th><th>Descripción</th><th>Estado</th><th>Fecha</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td><b>{r.id}</b></td><td>{r.machine}</td><td>{r.description}</td><td><Badge tone={r.status==="Cerrada"?"success":r.status==="Abierta"?"danger":"warning"}>{r.status}</Badge></td><td>{r.date}</td></tr>)}</tbody></table></div>;
}

function StockAlerts({parts,onSelect}: {parts: Part[]; onSelect: () => void}) {
  return <div className="alert-list">{parts.map(p=><div className="alert-row" key={p.id} onClick={onSelect}><div><b>{p.name}</b><small>{p.id} · {p.location}</small></div><strong className="danger-text">{p.stock} / mín. {p.min}</strong></div>)}</div>;
}

function MaintenanceList() {
  const rows=[["15/10/2026","Mantenimiento preventivo","Fraccionador 3"],["22/10/2026","Cambio de filtros","Compresor 15"],["30/10/2026","Revisión de caldera","Caldera 12"]];
  return <div className="list">{rows.map(r=><div className="list-row" key={r[0]}><span className="date">{r[0]}</span><div><b>{r[1]}</b><small>{r[2]}</small></div><span>→</span></div>)}</div>;
}

function Stock({parts,onNavigate,onSelectPart}: {parts: Part[]; onNavigate: (id: string) => void; onSelectPart: (part: Part) => void}) {
  const [q,setQ]=useState(""); const [filter,setFilter]=useState("Todos");
  const filtered=parts.filter(p=>(`${p.id} ${p.name} ${p.location}`.toLowerCase().includes(q.toLowerCase())) && (filter==="Todos" || (filter==="Bajo" && p.stock<=p.min) || p.status===filter));
  return <div><PageHeader title="Stock de repuestos" subtitle="Consulta y gestión del inventario en tiempo real."
    actions={<><Button variant="secondary" onClick={()=>onNavigate("scan")}>▦ Escanear</Button><Button onClick={()=>onNavigate("stock-entry")}>+ Ingresar repuesto</Button></>}/>
    <Card><div className="filters"><input placeholder="Buscar por código, nombre o descripción..." value={q} onChange={e=>setQ(e.target.value)}/><select value={filter} onChange={e=>setFilter(e.target.value)}><option>Todos</option><option>OK</option><option>Bajo</option><option>Crítico</option></select><Button variant="secondary">Filtros</Button></div>
      <div className="table-wrap"><table><thead><tr><th>Código</th><th>Repuesto</th><th>Stock actual</th><th>Stock mínimo</th><th>Ubicación</th><th>Estado</th><th></th></tr></thead>
      <tbody>{filtered.map(p=><tr key={p.id} onClick={()=>onSelectPart(p)} className="clickable"><td><b>{p.id}</b></td><td>{p.name}</td><td><b>{p.stock}</b></td><td>{p.min}</td><td>{p.location}</td><td><Badge tone={p.stock===0?"danger":p.stock<=p.min?"warning":"success"}>{p.stock===0?"Crítico":p.stock<=p.min?"Bajo":"OK"}</Badge></td><td>⋮</td></tr>)}</tbody></table></div>
    </Card>
  </div>;
}

function PartDetail({part,onBack,onNavigate}: {part: Part; onBack: () => void; onNavigate: (id: string) => void}) {
  return <div><PageHeader title={part.name} subtitle={`Stock · ${part.id}`} actions={<Button variant="secondary" onClick={onBack}>← Volver</Button>}/>
    <div className="detail-grid"><Card><div className="part-hero"><div className="part-image">⚙</div><div><h2>{part.name}</h2><p>{part.id}</p><Badge tone={part.stock<=part.min?"warning":"success"}>{part.stock<=part.min?"Stock bajo":"En stock"}</Badge></div><div className="location-box">📍 <b>{part.location}</b><small>Ubicación actual</small></div></div>
      <div className="tabs"><b>Historial</b><span>Máquinas</span><span>Características</span><span>Documentos</span></div>
      <Button variant="link" onClick={()=>onNavigate("traceability")}>Ver trazabilidad completa →</Button>
      <TraceTable/></Card>
      <Card title="Acciones"><Button onClick={()=>onNavigate("use-part")}>Registrar uso</Button><Button variant="secondary" onClick={()=>onNavigate("reservation")}>Reservar repuesto</Button><Button variant="secondary" onClick={()=>onNavigate("purchase")}>Generar pedido de compra</Button><Button variant="secondary" onClick={()=>onNavigate("scan")}>Ver código / escanear</Button></Card>
    </div>
  </div>;
}

function TraceTable(){ const rows=[["12/09/2026","Compra","+50","Proveedor: Metalúrgica S.A."],["14/09/2026","Recepción","+50","Depósito"],["18/09/2026","Uso","-2","FR-003"],["20/09/2026","Uso","-1","B-005"]]; return <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Origen / Destino</th></tr></thead><tbody>{rows.map((r,i)=><tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td className={r[2][0]==="-"?"danger-text":"success-text"}><b>{r[2]}</b></td><td>{r[3]}</td></tr>)}</tbody></table></div>; }

function Traceability({part,onBack}: {part: Part; onBack: () => void}) {
  return <div><PageHeader title={`Trazabilidad · ${part.id}`} subtitle="Historia completa del repuesto, desde la compra hasta su utilización." actions={<Button variant="secondary" onClick={onBack}>← Volver al repuesto</Button>}/>
    <Card><div className="timeline">{[
      ["12/09/2026","Compra","Proveedor Metalúrgica S.A.","+50"],
      ["14/09/2026","Recepción","Depósito · Estantería A-3","+50"],
      ["18/09/2026","Uso","Fraccionador FR-003","-2"],
      ["20/09/2026","Uso","Banda B-005","-1"]
    ].map((x,i)=><div className="timeline-item" key={i}><div className="timeline-dot">{i+1}</div><div><b>{x[1]}</b><small>{x[0]} · {x[2]}</small></div><strong className={x[3][0]==="-"?"danger-text":"success-text"}>{x[3]}</strong></div>)}</div><div className="location-banner">📍 Ubicación actual: <b>{part.location}</b></div></Card>
  </div>;
}

function Scan({parts,onSelect,onNavigate}: {parts: Part[]; onSelect: (part: Part) => void; onNavigate: (id: string) => void}) {
  const [scanned,setScanned]=useState<Part|null>(null);
  return <div><PageHeader title="Escanear repuesto" subtitle="Leé el QR o código de barras para obtener la información completa."/>
    <div className="scan-layout"><Card><div className="scanner"><div className="scan-frame">▦</div><p>Apuntá la cámara al código</p><Button onClick={()=>setScanned(parts[0])}>Simular escaneo</Button></div></Card>
      <Card title={scanned?"Repuesto encontrado":"Esperando escaneo"}>{scanned ? <><div className="scan-result"><b>{scanned.name}</b><small>{scanned.id}</small><strong>{scanned.stock} unidades</strong><span>{scanned.location}</span></div><Button onClick={()=>onSelect(scanned)}>Ver detalle</Button><Button variant="secondary" onClick={()=>onNavigate("use-part")}>Registrar uso</Button></> : <div className="empty">Escaneá un código para ver sus datos.</div>}</Card>
    </div>
  </div>;
}

function UsePart({part,onBack,onSaved}: {part: Part; onBack: () => void; onSaved: (quantity: number) => void}) {
  const [qty,setQty]=useState(1); const [machine,setMachine]=useState("FR-003");
  return <FormPage title="Registrar uso de repuesto" subtitle="El stock se descuenta automáticamente al confirmar." onBack={onBack}>
    <div className="form-grid"><Field label="Repuesto" value={`${part.name} (${part.id})`} /><Field label="Cantidad utilizada" value={qty} type="number" onChange={v=>setQty(Math.max(0,Number(v)))}/><Field label="Máquina / Equipo"><select value={machine} onChange={e=>setMachine(e.target.value)}>{machines.map(m=><option key={m.id} value={m.id}>{m.id} · {m.name}</option>)}</select></Field><Field label="Orden / reparación" placeholder="Opcional: OT-0045"/><Field label="Observaciones" placeholder="Detalle del uso" /></div>
    <div className="confirm-box"><span>Stock después del uso</span><strong>{Math.max(0,part.stock-qty)} unidades</strong></div><Button disabled={qty<1||qty>part.stock} onClick={()=>onSaved(qty)}>{qty>part.stock?"Stock insuficiente":"Confirmar uso"}</Button>
  </FormPage>;
}

function IncidentForm({onSaved}: {onSaved: () => void}) {
  return <FormPage title="Nueva incidencia" subtitle="Reportá un problema desde cualquier turno, con foto y máquina identificada." onBack={onSaved}>
    <div className="form-grid"><Field label="Máquina *"><select><option>FR-003 · Fraccionador 3</option><option>B-005 · Banda transportadora 5</option><option>C-012 · Caldera 12</option></select></Field><Field label="Prioridad"><select><option>Alta</option><option>Media</option><option>Baja</option></select></Field><Field label="Descripción *" placeholder="Describí el problema..." /><Field label="Foto / evidencia"><div className="upload">📷 Adjuntar foto</div></Field><Field label="¿Requiere repuestos?"><div className="radio-row"><label><input type="radio" name="r"/> Sí</label><label><input type="radio" name="r"/> No</label></div></Field></div><Button onClick={onSaved}>Enviar incidencia</Button>
  </FormPage>;
}

function Incidents({onNavigate}: {onNavigate: (id: string) => void}) {
  return <div><PageHeader title="Incidencias" subtitle="Gestión de problemas reportados por los operarios." actions={<Button onClick={()=>onNavigate("new-incident")}>+ Nueva incidencia</Button>}/><Card><div className="tabs"><b>Abiertas</b><span>En proceso</span><span>Cerradas</span></div><IncidentTable rows={incidents}/></Card></div>;
}

function Maintenance({onNavigate}: {onNavigate: (id: string) => void}) {
  return <div><PageHeader title="Mantenimientos y reparaciones" subtitle="Planificación, ejecución y seguimiento de tareas." actions={<Button onClick={()=>onNavigate("new-maintenance")}>+ Nuevo mantenimiento</Button>}/><Card><div className="tabs"><b>Próximos</b><span>En curso</span><span>Histórico</span></div><MaintenanceTable/></Card></div>;
}
function MaintenanceTable(){const rows=[["15/10/2026","Preventivo","Línea de envasado 4","FR-003","Alta"],["22/10/2026","Cambio de filtros","Compresor 15","C-015","Media"],["30/10/2026","Revisión","Caldera 12","C-012","Alta"],["05/11/2026","Limpieza de filtros","Envasadora","M-012","Baja"]]; return <div className="table-wrap"><table><thead><tr><th>Fecha</th><th>Tipo</th><th>Tarea</th><th>Máquina</th><th>Prioridad</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td>{r[0]}</td><td>{r[1]}</td><td><b>{r[2]}</b></td><td>{r[3]}</td><td><Badge tone={r[4]==="Alta"?"danger":"warning"}>{r[4]}</Badge></td></tr>)}</tbody></table></div>}

function NewMaintenance({onSaved}: {onSaved: () => void}) {
  return <FormPage title="Registrar reparación / mantenimiento" subtitle="Asociá la tarea a una máquina y registrá los repuestos utilizados." onBack={onSaved}>
    <div className="form-grid"><Field label="Máquina *"><select><option>FR-003 · Fraccionador 3</option><option>C-012 · Caldera 12</option></select></Field><Field label="Supervisor"><select><option>María López</option><option>Carlos Ruiz</option></select></Field><Field label="Técnico"><select><option>Juan Pérez</option><option>Ana García</option></select></Field><Field label="Operación"><select><option>Mantenimiento preventivo</option><option>Reparación correctiva</option></select></Field><Field label="Repuestos utilizados"><input placeholder="Buscar repuesto..."/></Field><Field label="Notas"><textarea placeholder="Observaciones..."/></Field></div><Button onClick={onSaved}>Guardar mantenimiento</Button>
  </FormPage>;
}

function Purchases({onNavigate}: {onNavigate: (id: string) => void}) {
  const rows=[["REP-0098","Válvula solenoide",5,"Alta","Umbral mínimo"],["REP-0330","Junta tórica",10,"Media","Pedido puntual"],["REP-0187","Filtro de aire",8,"Baja","Previsión demanda"],["REP-0710","Correa transportadora",4,"Media","Umbral mínimo"]];
  return <div><PageHeader title="Lista de compras" subtitle="Pedidos automáticos y puntuales de repuestos." actions={<Button onClick={()=>onNavigate("purchase")}>+ Nuevo pedido</Button>}/><Card><div className="tabs"><b>Pendientes (5)</b><span>En proceso (2)</span><span>Histórico</span></div><div className="table-wrap"><table><thead><tr><th>Repuesto</th><th>Cantidad</th><th>Urgencia</th><th>Origen</th><th>Acción</th></tr></thead><tbody>{rows.map(r=><tr key={r[0]}><td><b>{r[1]}</b><small>{r[0]}</small></td><td>{r[2]}</td><td><Badge tone={r[3]==="Alta"?"danger":"warning"}>{r[3]}</Badge></td><td>{r[4]}</td><td><Button variant="link">Ver</Button></td></tr>)}</tbody></table></div></Card></div>;
}

function PurchaseForm({onSaved}: {onSaved: () => void}) {
  return <FormPage title="Generar pedido de compra" subtitle="Se notificará por correo a los encargados y a gerencia de producción." onBack={onSaved}>
    <div className="notice danger">⚠ El repuesto no tiene stock o alcanzó el umbral mínimo.</div>
    <div className="form-grid"><Field label="Repuesto *"><select><option>REP-0098 · Válvula solenoide</option><option>REP-0456 · Bomba de agua</option></select></Field><Field label="Cantidad sugerida *" value="5"/><Field label="Grado de urgencia"><select><option>Alta</option><option>Media</option><option>Baja</option></select></Field><Field label="Observaciones"><textarea placeholder="Detalle del pedido..."/></Field></div><div className="check-list"><label><input type="checkbox" defaultChecked/> Encargados de turnos</label><label><input type="checkbox" defaultChecked/> Gerencia de producción</label><label><input type="checkbox"/> Compras</label></div><Button onClick={onSaved}>Generar pedido</Button>
  </FormPage>;
}

function StockEntry({onSaved}: {onSaved: () => void}) {
  return <FormPage title="Ingreso de stock" subtitle="Registrá una recepción de compra y asigná su ubicación." onBack={onSaved}>
    <div className="form-grid"><Field label="Proveedor *"><select><option>Metalúrgica S.A.</option><option>Repuestos Pharma SRL</option></select></Field><Field label="Fecha" value="01/10/2026"/><Field label="Escanear / código"><input placeholder="REP-0047"/></Field><Field label="Ubicación"><input placeholder="Estantería A-3 · Pasillo 2"/></Field><Field label="Cantidad"><input type="number" defaultValue="10"/></Field><Field label="Observaciones"><textarea placeholder="Opcional"/></Field></div><Button onClick={onSaved}>Confirmar ingreso</Button>
  </FormPage>;
}

function Reservation({part,onSaved}: {part: Part; onSaved: () => void}) {
  return <FormPage title="Reserva de repuestos" subtitle="Reservá unidades para un mantenimiento preventivo planificado." onBack={onSaved}>
    <div className="notice success">✓ El repuesto quedará bloqueado para otros usos hasta la fecha indicada.</div>
    <div className="form-grid"><Field label="Repuesto" value={`${part.name} · ${part.id}`}/><Field label="Cantidad" type="number" value="2"/><Field label="Fecha de reserva" value="15/10/2026"/><Field label="Motivo"><select><option>Mantenimiento preventivo</option><option>Reparación programada</option></select></Field><Field label="Observaciones"><textarea placeholder="Reservado para..." /></Field></div><Button onClick={onSaved}>Guardar reserva</Button>
  </FormPage>;
}

function Machines({onNavigate}: {onNavigate: (id: string) => void}) {
  return <div><PageHeader title="Máquinas" subtitle="Equipos de planta y repuestos asociados." actions={<Button onClick={()=>onNavigate("new-machine")}>+ Nueva máquina</Button>}/><Card><div className="table-wrap"><table><thead><tr><th>Código</th><th>Máquina</th><th>Área</th><th>Estado</th><th>Último mantenimiento</th></tr></thead><tbody>{machines.map(m=><tr key={m.id}><td><b>{m.id}</b></td><td>{m.name}</td><td>{m.area}</td><td><Badge tone={m.status==="Operativa"?"success":m.status==="Fuera de servicio"?"danger":"warning"}>{m.status}</Badge></td><td>{m.last}</td></tr>)}</tbody></table></div></Card></div>;
}

function MachineForm({onSaved}: {onSaved: () => void}) {
  return <FormPage title="Registrar máquina" subtitle="Cargá el equipo y definí los repuestos mínimos que necesita." onBack={onSaved}>
    <div className="form-grid"><Field label="Código / QR *" placeholder="Ej. C-015"/><Field label="Nombre *" placeholder="Nombre de la máquina"/><Field label="Área"><select><option>Producción</option><option>Fraccionamiento</option><option>Servicios</option></select></Field><Field label="Descripción"><textarea placeholder="Descripción del equipo"/></Field><Field label="Repuestos obligatorios"><input placeholder="Buscar repuesto..."/></Field></div><Button onClick={onSaved}>Guardar máquina</Button>
  </FormPage>;
}

function Reports() {
  return <div><PageHeader title="Reportes y tableros" subtitle="Indicadores para encargados y gerencia."/><div className="kpis"><KPI label="Stock total" value="1.248"/><KPI label="Valor inventario" value="$ 48,2 M"/><KPI label="Incidencias / mes" value="32"/><KPI label="Disponibilidad" value="96%" tone="success"/></div><div className="grid-2"><Card title="Consumo de repuestos"><BarChart/></Card><Card title="Incidencias por máquina"><BarChart second/></Card></div><Card title="Estado de máquinas"><div className="machine-cards">{machines.map(m=><div className="machine-card" key={m.id}><b>{m.id}</b><span>{m.name}</span><Badge tone={m.status==="Operativa"?"success":m.status==="Fuera de servicio"?"danger":"warning"}>{m.status}</Badge></div>)}</div></Card></div>;
}
function BarChart({second}: {second?: boolean}) { return <div className="bars">{[35,60,48,80,55,72,42].map((h,i)=><div className="bar-col" key={i}><div className="bar" style={{height:`${h}%`}}></div><small>{second?`M-${i+1}`:`S${i+1}`}</small></div>)}</div>; }

function Settings({user}: {user: User}) {
  return <div><PageHeader title="Perfil y configuración" subtitle="Datos personales, notificaciones y seguridad."/><div className="detail-grid"><Card title="Datos personales"><div className="form-grid"><Field label="Nombre" value={user.name}/><Field label="Email" value="juan.perez@planta.com"/><Field label="Turno" value="Mañana"/><Field label="Rol" value={user.role}/></div><Button>Guardar cambios</Button></Card><Card title="Notificaciones"><div className="settings-list"><label><input type="checkbox" defaultChecked/> Alertas de stock</label><label><input type="checkbox" defaultChecked/> Nuevas incidencias</label><label><input type="checkbox" defaultChecked/> Pedidos de compra</label><label><input type="checkbox"/> Resumen diario</label></div></Card></div></div>;
}

function EmailNotification() {
  return <div><PageHeader title="Notificaciones por correo" subtitle="Vista previa de eventos que el sistema envía automáticamente."/><Card><div className="email"><div className="email-head">✉ sistema@planta.com <span>01/10/2026 10:32</span></div><h2>Alerta de stock bajo</h2><p>El repuesto <b>REP-0098 · Válvula solenoide</b> alcanzó el stock mínimo.</p><p><b>Ubicación:</b> Estantería A-1 · Pasillo 4</p><p><b>Máquinas:</b> FR-003, FR-009</p><Button>Ver repuesto en el sistema</Button></div></Card></div>;
}

function FormPage({title,subtitle,onBack,children}: {title: string; subtitle?: string; onBack: () => void; children: ReactNode}) { return <div><PageHeader title={title} subtitle={subtitle} actions={<Button variant="secondary" onClick={onBack}>← Volver</Button>}/><Card>{children}</Card></div>; }

function App() {
  const [active,setActive]=useState(()=>window.matchMedia("(max-width: 720px)").matches?"login":"dashboard");
  // App conserva el inventario para que los cambios se reflejen en todas las vistas.
  const [parts,setParts]=useState(initialParts);
  const [selected,setSelected]=useState(initialParts[0]);
  const user={name:"Juan Pérez",role:"Encargado · Turno Mañana"};
  const navigate=(id: string)=>setActive(id);
  const selectPart=(p: Part)=>{setSelected(p);setActive("part-detail");};
  // El router simple cambia pantallas sin agregar una dependencia externa.
  const screen = useMemo(()=>{
    switch(active){
      case "mobile-menu": return <MobileMenu user={user} parts={parts} onNavigate={navigate}/>;
      case "dashboard": return <Dashboard parts={parts} onNavigate={navigate}/>;
      case "stock": return <Stock parts={parts} onNavigate={navigate} onSelectPart={selectPart}/>;
      case "alerts": return <Alerts parts={parts} onSelectPart={selectPart} onNavigate={navigate}/>;
      case "photo-identify": return <PhotoIdentify parts={parts} onSelect={selectPart}/>;
      case "part-detail": return <PartDetail part={selected} onBack={()=>navigate("stock")} onNavigate={navigate}/>;
      case "traceability": return <Traceability part={selected} onBack={()=>navigate("part-detail")}/>;
      case "scan": return <Scan parts={parts} onSelect={selectPart} onNavigate={navigate}/>;
      case "use-part": return <UsePart part={selected} onBack={()=>navigate("part-detail")} onSaved={(quantity)=>{if(quantity<1||quantity>selected.stock)return;const updated={...selected,stock:selected.stock-quantity};setParts(ps=>ps.map(p=>p.id===selected.id?updated:p));setSelected(updated);navigate("part-detail")}}/>;
      case "incidents": return <Incidents onNavigate={navigate}/>;
      case "new-incident": return <IncidentForm onSaved={()=>navigate("incidents")}/>;
      case "maintenance": return <Maintenance onNavigate={navigate}/>;
      case "new-maintenance": return <NewMaintenance onSaved={()=>navigate("maintenance")}/>;
      case "purchases": return <Purchases onNavigate={navigate}/>;
      case "purchase": return <PurchaseForm onSaved={()=>navigate("purchases")}/>;
      case "stock-entry": return <StockEntry onSaved={()=>navigate("stock")}/>;
      case "reservation": return <Reservation part={selected} onSaved={()=>navigate("part-detail")}/>;
      case "machines": return <Machines onNavigate={navigate}/>;
      case "new-machine": return <MachineForm onSaved={()=>navigate("machines")}/>;
      case "reports": return <Reports/>;
      case "settings": return <Settings user={user}/>;
      case "notifications": return <EmailNotification/>;
      default: return <Dashboard parts={parts} onNavigate={navigate}/>;
    }
  },[active,parts,selected]);
  if(active==="login") return <Login onLogin={()=>navigate("mobile-menu")}/>;
  const titles: Record<string,string>={dashboard:"Inicio", "mobile-menu":"Menú principal", stock:"Stock", alerts:"Alertas", scan:"Escanear repuesto", incidents:"Incidencias", maintenance:"Mantenimientos", purchases:"Compras", machines:"Máquinas", reports:"Reportes", settings:"Mi perfil", notifications:"Notificaciones"};
  return <AppLayout active={active} title={titles[active]??"Mantenimiento Pharma"} onNavigate={navigate} user={user}
    onScan={()=>navigate("scan")} onNotifications={()=>navigate("notifications")} onProfile={()=>navigate("settings")}>{screen}</AppLayout>;
}

const rootElement=document.getElementById("root");
if(!rootElement) throw new Error("No se encontró el elemento raíz de la aplicación.");
createRoot(rootElement).render(<App />);
