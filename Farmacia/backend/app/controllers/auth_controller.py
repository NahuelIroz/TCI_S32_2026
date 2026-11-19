"""Controlador para autenticación y login de usuarios."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.database import get_session
from app.models.usuario import RolUsuario, Usuario
from app.services.auth_service import (
    crear_token,
    hashear_password,
    verificar_password,
)

router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Autenticación"]
)


# ==========================================
# ESQUEMAS DE REQUEST / RESPONSE
# ==========================================

class LoginRequest(BaseModel):
    username: str
    password: str


class UsuarioResponse(BaseModel):
    id: int
    username: str
    nombre: str
    rol: RolUsuario


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse




def seed_usuarios_si_no_existen(session: Session) -> None:
    """Crea los 4 perfiles base si la tabla está vacía."""
    hay_usuarios = session.exec(select(Usuario)).first()
    if hay_usuarios:
        return

    usuarios_base = [
        Usuario(
            username="operario",
            nombre="Juan Operario",
            rol=RolUsuario.OPERARIO,
            password_hash=hashear_password("1234"),
            activo=True,
        ),
        Usuario(
            username="mantenimiento",
            nombre="Carlos Mantenimiento",
            rol=RolUsuario.MANTENIMIENTO,
            password_hash=hashear_password("1234"),
            activo=True,
        ),
        Usuario(
            username="encargado",
            nombre="Marta Encargada",
            rol=RolUsuario.ENCARGADO,
            password_hash=hashear_password("1234"),
            activo=True,
        ),
        Usuario(
            username="gerencia",
            nombre="Roberto Gerente",
            rol=RolUsuario.GERENCIA,
            password_hash=hashear_password("1234"),
            activo=True,
        ),
    ]

    for u in usuarios_base:
        session.add(u)
    session.commit()




@router.post("/login", response_model=LoginResponse)
def login(
    datos: LoginRequest,
    session: Session = Depends(get_session)
):
    nombre_usuario = datos.username.strip().lower()

    consulta = select(Usuario).where(Usuario.username == nombre_usuario)
    usuario = session.exec(consulta).first()

    if not usuario or not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    if not verificar_password(datos.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos"
        )

    # Generar token JWT con id, username y rol
    token = crear_token({
        "sub": str(usuario.id),
        "username": usuario.username,
        "rol": usuario.rol.value
    })

    return LoginResponse(
        access_token=token,
        token_type="bearer",
        usuario=UsuarioResponse(
            id=usuario.id,
            username=usuario.username,
            nombre=usuario.nombre,
            rol=usuario.rol
        )
    )