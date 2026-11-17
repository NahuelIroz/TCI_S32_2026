
"""Inyección de dependencias entre capas."""

from fastapi import Depends
from sqlmodel import Session

from app.database import get_session
from app.repositories.incidencia_repository import IncidenciaRepository
from app.services.incidencia_service import IncidenciaService


def get_incidencia_repository(
    session: Session = Depends(get_session),
) -> IncidenciaRepository:
    return IncidenciaRepository(session)


def get_incidencia_service(
    repository: IncidenciaRepository = Depends(
        get_incidencia_repository
    ),
) -> IncidenciaService:
    return IncidenciaService(repository)
