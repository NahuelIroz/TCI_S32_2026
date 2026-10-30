

export type TipoNotificacionCorreo =
  | "incidente"
  | "cambio_parte"
  | "solicitud_compra"
  | "informe_resolucion"
  | "alerta_umbral"
  | "liberacion_reserva";

export interface CorreoNotificacion {
  id: string;
  tipo: TipoNotificacionCorreo;
  asunto: string;
  destinatarios: string[];
  cuerpo: string;
  fecha: string;
  leido: boolean;
  meta?: Record<string, string | number>;
}

export interface PuertoNotificaciones {
  enviarNotificacion(
    tipo: TipoNotificacionCorreo,
    asunto: string,
    destinatarios: string[],
    cuerpo: string,
    meta?: Record<string, string | number>
  ): CorreoNotificacion;
  obtenerHistorial(): CorreoNotificacion[];
  marcarComoLeido(id: string): void;
}

class AdaptadorFalsoNotificaciones implements PuertoNotificaciones {
  private historial: CorreoNotificacion[] = [
    {
      id: "MAIL-2026-001",
      tipo: "alerta_umbral",
      asunto: " ALERTA RN-02: Stock mínimo alcanzado para Válvula Solenoide Festo",
      destinatarios: ["encargados@planta.farmacia.com", "compras@planta.farmacia.com"],
      cuerpo: "El repuesto SKU-VLV-420 ha alcanzado el umbral mínimo (2 restantes, mínimo 5). Incluido en lista de reposición.",
      fecha: "Hoy 08:30",
      leido: false,
    },
    {
      id: "MAIL-2026-002",
      tipo: "solicitud_compra",
      asunto: " URGENTE RN-04: Pedido de compra PED-2026-012 (Correa Dentada Sincrónica)",
      destinatarios: [
        "encargado.manana@planta.farmacia.com",
        "encargado.tarde@planta.farmacia.com",
        "encargado.noche@planta.farmacia.com",
        "gerencia@planta.farmacia.com",
      ],
      cuerpo: "Se ha emitido un pedido con prioridad URGENTE debido a quiebre de stock en compresores principales.",
      fecha: "Ayer 15:10",
      leido: true,
    },
    {
      id: "MAIL-2026-003",
      tipo: "incidente",
      asunto: "INCIDENTE RN-09: Nueva falla reportada en Envasadora Rotativa #03",
      destinatarios: ["mantenimiento@planta.farmacia.com", "supervisores@planta.farmacia.com"],
      cuerpo: "Incidencia INC-1042 reportada por operario Juan Pérez. Fuga de lubricante y vibración.",
      fecha: "Ayer 18:00",
      leido: true,
    },
  ];

  enviarNotificacion(
    tipo: TipoNotificacionCorreo,
    asunto: string,
    destinatarios: string[],
    cuerpo: string,
    meta?: Record<string, string | number>
  ): CorreoNotificacion {
    const nuevoCorreo: CorreoNotificacion = {
      id: `MAIL-2026-0${this.historial.length + 10}`,
      tipo,
      asunto,
      destinatarios,
      cuerpo,
      fecha: "Recién (" + new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }) + ")",
      leido: false,
      meta,
    };

    this.historial = [nuevoCorreo, ...this.historial];
    console.info(`[RN-09 MOCK EMAIL ADAPTER] Enviando a: ${destinatarios.join(", ")} | Asunto: ${asunto}`);
    return nuevoCorreo;
  }

  obtenerHistorial(): CorreoNotificacion[] {
    return this.historial;
  }

  marcarComoLeido(id: string): void {
    this.historial = this.historial.map((c) =>
      c.id === id ? { ...c, leido: true } : c
    );
  }
}

export const servicioNotificaciones: PuertoNotificaciones = new AdaptadorFalsoNotificaciones();
