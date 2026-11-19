
from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from app.models.repuesto import RepuestoRead
from app.services.repuesto_service import RepuestoService


router = APIRouter(
    prefix="/api/v1/repuestos",
    tags=["Repuestos"]
)

service = RepuestoService()


@router.get(
    "",
    response_model=list[RepuestoRead]
)
def listar_repuestos(
    buscar: str | None = None,
    session: Session = Depends(get_session)
):

    return service.listar(session, buscar)


@router.get(
    "/{repuesto_id}",
    response_model=RepuestoRead
)
def obtener_repuesto(
    repuesto_id: int,
    session: Session = Depends(get_session)
):

    return service.obtener_por_id(
        session,
        repuesto_id
    )
