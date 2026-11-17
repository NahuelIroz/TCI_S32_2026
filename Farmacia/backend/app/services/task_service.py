"""Service Task (negocio). STUB."""

from app.models.task import Task, TaskCreate, TaskUpdate
from app.repositories.task_repository import TaskRepository


class TaskService:
    def __init__(self, repository: TaskRepository):
        self.repository = repository

    def list_tasks(self) -> list[Task]:
        raise NotImplementedError("TODO")

    def get_task(self, task_id: int) -> Task | None:
        raise NotImplementedError("TODO")

    def create_task(self, body: TaskCreate) -> Task:
        raise NotImplementedError("TODO")

    def update_task(self, task_id: int, body: TaskUpdate) -> Task | None:
        raise NotImplementedError("TODO")

    def delete_task(self, task_id: int) -> bool:
        raise NotImplementedError("TODO")

    def count_tasks(self) -> int:
        return self.repository.count()
