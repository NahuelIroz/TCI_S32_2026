from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlmodel import Session
from app.database import get_session
from app.models.foto_incidencia import FotoIncidenciaRead
from app.services.foto_incidencia_service import FotoIncidenciaService

router = APIRouter(prefix="/api/v1/incidencias", tags=["Fotografías de incidencias"])

def respuesta(foto):
    return FotoIncidenciaRead(id=foto.id, incidencia_id=foto.incidencia_id, nombre_archivo=foto.nombre_archivo, fecha_subida=foto.fecha_subida, url=f"/uploads/incidencias/{foto.nombre_archivo}")

@router.get("/{incidencia_id}/fotos", response_model=list[FotoIncidenciaRead])
def listar_fotos(incidencia_id: int, session: Session = Depends(get_session)):
    try:
        return [respuesta(f) for f in FotoIncidenciaService(session).listar(incidencia_id)]
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@router.post("/{incidencia_id}/fotos", response_model=list[FotoIncidenciaRead], status_code=201)
async def subir_fotos(incidencia_id: int, archivos: list[UploadFile] = File(...), session: Session = Depends(get_session)):
    try:
        return [respuesta(f) for f in await FotoIncidenciaService(session).subir(incidencia_id, archivos)]
    except ValueError as exc:
        codigo = 404 if str(exc) == "La incidencia no existe" else 400
        raise HTTPException(status_code=codigo, detail=str(exc)) from exc
