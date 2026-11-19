"""Inyección de dependencias entre capas y seguridad."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from app.database import get_session
from app.models.usuario import RolUsuario, Usuario
from app.repositories.incidencia_repository import IncidenciaRepository
from app.repositories.maquina_repository import MaquinaRepository
from app.repositories.tablero_repository import TableroRepository
from app.services.auth_service import decodificar_token
from app.services.incidencia_service import IncidenciaService
from app.services.maquina_service import MaquinaService
from app.services.tablero_service import TableroService


def get_incidencia_repository(
    session: Session = Depends(get_session),
) -> IncidenciaRepository:
    return IncidenciaRepository(session)


def get_incidencia_service(
    repository: IncidenciaRepository = Depends(get_incidencia_repository),
) -> IncidenciaService:
    return IncidenciaService(repository)


def get_maquina_repository(
    session: Session = Depends(get_session),
) -> MaquinaRepository:
    return MaquinaRepository(session)


def get_maquina_service(
    repository: MaquinaRepository = Depends(get_maquina_repository),
) -> MaquinaService:
    return MaquinaService(repository)


def get_tablero_repository(
    session: Session = Depends(get_session),
) -> TableroRepository:
    return TableroRepository(session)


def get_tablero_service(
    repository: TableroRepository = Depends(get_tablero_repository),
) -> TableroService:
    return TableroService(repository)



# Extrae el token de la cabecera "Authorization: Bearer <token>"
seguridad = HTTPBearer(auto_error=False)


def get_current_user(
    credenciales: HTTPAuthorizationCredentials | None = Depends(seguridad),
    session: Session = Depends(get_session),
) -> Usuario:
    """Valida el token JWT y devuelve el Usuario autenticado."""
    if not credenciales:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Falta el encabezado de autenticación (Bearer token)",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decodificar_token(credenciales.credentials)
    usuario_id_str = payload.get("sub")

    if not usuario_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido: falta identificador de usuario",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario = session.get(Usuario, int(usuario_id_str))
    if not usuario or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado o inactivo",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return usuario


def requerir_roles(*roles_permitidos: RolUsuario):
    """Fábrica de dependencias que restringe el acceso según el rol del usuario."""
    def verificador(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Requiere uno de los roles: {[r.value for r in roles_permitidos]}",
            )
        return usuario

    return verificador