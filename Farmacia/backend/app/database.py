"""Infraestructura: conexión a la base (engine + session + create_all)."""

import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/postgres",
)

engine = create_engine(DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1))


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
