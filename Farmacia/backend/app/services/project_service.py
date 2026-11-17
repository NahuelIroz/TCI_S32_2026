"""Service Project (negocio). STUB."""

from app.models.project import Project, ProjectCreate, ProjectUpdate
from app.repositories.project_repository import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    def list_projects(self) -> list[Project]:
        raise NotImplementedError("TODO")

    def get_project(self, project_id: int) -> Project | None:
        raise NotImplementedError("TODO")

    def create_project(self, body: ProjectCreate) -> Project:
        raise NotImplementedError("TODO")

    def update_project(self, project_id: int, body: ProjectUpdate) -> Project | None:
        raise NotImplementedError("TODO")

    def delete_project(self, project_id: int) -> bool:
        raise NotImplementedError("TODO")

    def count_projects(self) -> int:
        return self.repository.count()
