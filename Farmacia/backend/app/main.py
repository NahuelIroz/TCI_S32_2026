
"""Punto de entrada de la API de Farmacia."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.controllers import incidencia_controller
from app.controllers import maquina_controller

from app.controllers.repuesto_controller import (
    router as repuesto_router
)

from app.controllers.movimiento_stock_controller import (
    router as movimiento_stock_router
)

from app.controllers.pedido_compra_controller import (
    router as pedido_compra_router
)

from app.database import engine, create_db_and_tables

from app.controllers.auth_controller import router as auth_router, seed_usuarios_si_no_existen
from app.services.repuesto_service import seed_repuestos_si_no_existen
from sqlmodel import Session

# Registrar modelos SQLModel
import app.models





@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    with Session(engine) as session:
        seed_usuarios_si_no_existen(session)
        seed_repuestos_si_no_existen(session)
    yield

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

app.include_router(incidencia_controller.router)
app.include_router(maquina_controller.router)
app.include_router(repuesto_router)
app.include_router(movimiento_stock_router)
app.include_router(pedido_compra_router)
app.include_router(auth_router)
