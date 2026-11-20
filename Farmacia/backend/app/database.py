
"""Infraestructura: conexión a PostgreSQL."""

import os

from dotenv import load_dotenv
from sqlalchemy import text
from sqlmodel import SQLModel, Session, create_engine

# Modelos registrados para crear sus tablas
from app.models.repuesto import Repuesto
from app.models.movimiento_stock import MovimientoStock
from app.models.pedido_compra import PedidoCompra
from app.models.foto_incidencia import FotoIncidencia

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
    # Crear las tablas que todavía no existan
    SQLModel.metadata.create_all(engine)

    # Migración defensiva en caso de que la tabla
    # 'maquinas' ya existiera en PostgreSQL
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS criticidad "
                    "VARCHAR(50) DEFAULT 'Media';"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS oee "
                    "DOUBLE PRECISION DEFAULT 0.0;"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS temperatura "
                    "VARCHAR(30) DEFAULT 'N/D';"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS presion "
                    "VARCHAR(30) DEFAULT 'N/D';"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS horas_operacion "
                    "INTEGER DEFAULT 0;"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS ultima_revision "
                    "VARCHAR(50) DEFAULT '';"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS proximo_mantenimiento "
                    "VARCHAR(50) DEFAULT '';"
                )
            )
            conn.execute(
                text(
                    "ALTER TABLE maquinas "
                    "ADD COLUMN IF NOT EXISTS responsable "
                    "VARCHAR(100) DEFAULT 'Sin asignar';"
                )
            )
    except Exception as e:
        print(f"Nota de migración tablas: {e}")


def get_session():
    with Session(engine) as session:
        yield session
