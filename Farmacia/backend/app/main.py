
"""Punto de entrada de la API de Farmacia."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.controllers import incidencia_controller
from app.controllers import maquina_controller

# Base de datos
from app.database import engine, create_db_and_tables

# Importamos los modelos para que SQLModel registre las tablas
import app.models


# --------------------------------------------------
# INICIALIZACIÓN DE LA BASE DE DATOS
# --------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea las tablas que todavía no existen
    create_db_and_tables()

    yield


# --------------------------------------------------
# CONFIGURACIÓN DE FASTAPI
# --------------------------------------------------

app = FastAPI(
    title="Farmacia API",
    description="Sistema de gestión de stock y mantenimiento",
    version="0.1.0",
    lifespan=lifespan,
)


# --------------------------------------------------
# CONFIGURACIÓN DE CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health", tags=["Sistema"])
def health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "service": "Farmacia API",
        "database": "conectada"
    }


# --------------------------------------------------
# ROUTERS
# --------------------------------------------------

# Más adelante registraremos los controllers:
#
# from app.controllers import incidencia_controller
# app.include_router(incidencia_controller.router)
app.include_router(incidencia_controller.router)
app.include_router(maquina_controller.router)


