"""Servicio de negocio para procesar y resolver lecturas del escáner QR."""

from sqlmodel import Session
from app.models.scanner import ScannerResultado, TipoEntidadQR
from app.repositories.scanner_repository import ScannerRepository
from app.services.repuesto_service import RepuestoService


class ScannerService:

    def __init__(self):
        self.repository = ScannerRepository()
        self.repuesto_service = RepuestoService()

    def resolver_codigo(
        self,
        session: Session,
        codigo: str
    ) -> ScannerResultado:
        codigo_limpio = codigo.strip()

        # 1. Intentar buscar como Repuesto en la base de datos
        repuesto = self.repository.buscar_repuesto(session, codigo_limpio)
        if repuesto:
            repuesto_dto = self.repuesto_service.convertir_respuesta(repuesto)
            return ScannerResultado(
                codigo=codigo_limpio,
                encontrado=True,
                tipo=TipoEntidadQR.REPUESTO,
                mensaje="Repuesto identificado correctamente",
                repuesto=repuesto_dto,
            )

        # 2. Intentar buscar como Máquina en la base de datos
        maquina = self.repository.buscar_maquina(session, codigo_limpio)
        if maquina:
            return ScannerResultado(
                codigo=codigo_limpio,
                encontrado=True,
                tipo=TipoEntidadQR.MAQUINA,
                mensaje="Máquina identificada correctamente",
                maquina=maquina,
            )

        # 3. Código no reconocido
        return ScannerResultado(
            codigo=codigo_limpio,
            encontrado=False,
            tipo=TipoEntidadQR.DESCONOCIDO,
            mensaje=f"No se encontró ningún repuesto ni máquina con el código '{codigo_limpio}'",
        )
