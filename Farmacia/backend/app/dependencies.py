"""Cableado entre capas (V1 - por capa técnica)."""

from fastapi import Depends
from sqlmodel import Session

from app.database import get_session
from app.repositories.task_repository import TaskRepository
from app.repositories.project_repository import ProjectRepository
from app.services.task_service import TaskService
from app.services.project_service import ProjectService


def get_task_repository(session: Session = Depends(get_session)) -> TaskRepository:
    return TaskRepository(session)


def get_project_repository(session: Session = Depends(get_session)) -> ProjectRepository:
    return ProjectRepository(session)


def get_task_service(
    repository: TaskRepository = Depends(get_task_repository),
) -> TaskService:
    return TaskService(repository)


def get_project_service(
    repository: ProjectRepository = Depends(get_project_repository),
) -> ProjectService:
    return ProjectService(repository)
