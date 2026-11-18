
"""Infraestructura: conexión a PostgreSQL."""

import os

from dotenv import load_dotenv
from sqlmodel import SQLModel, Session, create_engine
from app.models.repuesto import Repuesto
from app.models.movimiento_stock import MovimientoStock

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "No se encontró DATABASE_URL en el archivo .env"
    )

engine = create_engine(
    DATABASE_URL,
    echo=True
)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session

