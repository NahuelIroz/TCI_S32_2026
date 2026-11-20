
from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import get_session
from app.models.repuesto import (
    RepuestoRead,
    RepuestoCreate,
    RepuestoUpdate,
)
from app.services.repuesto_service import RepuestoService


router = APIRouter(
    prefix="/api/v1/repuestos",
    tags=["Repuestos"]
)

service = RepuestoService()


@router.get("", response_model=list[RepuestoRead])
def listar_repuestos(
    buscar: str | None = None,
    incluir_inactivos: bool = False,
    session: Session = Depends(get_session)
):
    return service.listar(session, buscar, incluir_inactivos)


@router.get("/codigo/{codigo}", response_model=RepuestoRead)
def obtener_repuesto_por_codigo(
    codigo: str,
    session: Session = Depends(get_session)
):
    return service.obtener_por_codigo(session, codigo)


@router.post(
    "",
    response_model=RepuestoRead,
    status_code=status.HTTP_201_CREATED
)
def crear_repuesto(
    datos: RepuestoCreate,
    session: Session = Depends(get_session)
):
    return service.crear(session, datos)


@router.get("/{repuesto_id}", response_model=RepuestoRead)
def obtener_repuesto(
    repuesto_id: int,
    session: Session = Depends(get_session)
):
    return service.obtener_por_id(session, repuesto_id)


@router.patch("/{repuesto_id}", response_model=RepuestoRead)
def actualizar_repuesto(
    repuesto_id: int,
    datos: RepuestoUpdate,
    session: Session = Depends(get_session)
):
    return service.actualizar(session, repuesto_id, datos)


@router.patch("/{repuesto_id}/desactivar", response_model=RepuestoRead)
def desactivar_repuesto(
    repuesto_id: int,
    session: Session = Depends(get_session)
):
    return service.cambiar_activo(session, repuesto_id, False)


@router.patch("/{repuesto_id}/reactivar", response_model=RepuestoRead)
def reactivar_repuesto(
    repuesto_id: int,
    session: Session = Depends(get_session)
):
    return service.cambiar_activo(session, repuesto_id, True)
