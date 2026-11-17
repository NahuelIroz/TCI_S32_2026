
"""Entrypoint de la API de Farmacia."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlmodel import Session

from app.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Farmacia API",
    description="Sistema de gestión de mantenimiento e incidencias",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["Health"])
def health():
    with Session(engine) as session:
        session.exec(text("SELECT 1")).first()

    return {
        "status": "Funciona",
        "service": "Farmacia API",
        "db": "conectada"
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )

