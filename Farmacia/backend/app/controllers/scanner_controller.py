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
    """Resuelve un código QR y devuelve información sobre la entidad encontrada."""
    return service.resolver_codigo(session, codigo)
