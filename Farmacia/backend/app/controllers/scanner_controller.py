"""Controlador para resolver lecturas del escáner QR."""

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models.scanner import ScannerResultado
from app.services.scanner_service import ScannerService


router = APIRouter(
    prefix="/api/v1/scanner",
    tags=["Escáner QR"]
)

service = ScannerService()


@router.get(
    "/{codigo}",
    response_model=ScannerResultado,
    summary="Resolver código QR"
)
def resolver_codigo_qr(
    codigo: str,
    session: Session = Depends(get_session)
):
    """
    Recibe el texto leído por el escáner QR y devuelve la entidad
    correspondiente (Repuesto o Máquina) con sus datos en tiempo real.
    Si no se encuentra nada, retorna encontrado=false en lugar de lanzar un 404.
    """
    return service.resolver_codigo(session, codigo)
