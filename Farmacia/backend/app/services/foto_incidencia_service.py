from io import BytesIO
from pathlib import Path
from uuid import uuid4
import os

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError
from sqlmodel import Session, select
from app.models.incidencia import Incidencia
from app.models.foto_incidencia import FotoIncidencia

MAX_FOTOS = 5
MAX_BYTES = 5 * 1024 * 1024
TIPOS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}
CARPETA = Path(os.getenv("INCIDENCIAS_UPLOAD_DIR", "/app/uploads/incidencias"))

class FotoIncidenciaService:
    def __init__(self, session: Session):
        self.session = session

    def listar(self, incidencia_id: int) -> list[FotoIncidencia]:
        if self.session.get(Incidencia, incidencia_id) is None:
            raise ValueError("La incidencia no existe")
        return list(self.session.exec(select(FotoIncidencia).where(FotoIncidencia.incidencia_id == incidencia_id).order_by(FotoIncidencia.id)).all())

    async def subir(self, incidencia_id: int, archivos: list[UploadFile]) -> list[FotoIncidencia]:
        existentes = self.listar(incidencia_id)
        if not archivos or len(existentes) + len(archivos) > MAX_FOTOS:
            raise ValueError(f"Se permiten como máximo {MAX_FOTOS} fotografías por incidencia")
        preparados = []
        for archivo in archivos:
            contenido = await archivo.read(MAX_BYTES + 1)
            if not contenido or len(contenido) > MAX_BYTES:
                raise ValueError("Cada fotografía debe tener entre 1 byte y 5 MB")
            try:
                with Image.open(BytesIO(contenido)) as imagen:
                    formato = imagen.format
                    imagen.verify()
                if formato not in TIPOS:
                    raise ValueError("Solo se admiten imágenes JPG, PNG y WebP")
            except (UnidentifiedImageError, OSError) as exc:
                raise ValueError("Uno de los archivos no es una imagen válida") from exc
            preparados.append((uuid4().hex + TIPOS[formato], contenido))

        CARPETA.mkdir(parents=True, exist_ok=True)
        creados = []
        try:
            for nombre, contenido in preparados:
                ruta = CARPETA / nombre
                with ruta.open("xb") as salida:
                    salida.write(contenido)
                creados.append(ruta)
                self.session.add(FotoIncidencia(incidencia_id=incidencia_id, nombre_archivo=nombre))
            self.session.commit()
            return self.listar(incidencia_id)
        except Exception:
            self.session.rollback()
            for ruta in creados:
                ruta.unlink(missing_ok=True)
            raise
