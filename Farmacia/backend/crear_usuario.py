#!/usr/bin/env python3
"""Script interactivo y por argumentos para crear y listar usuarios en la base de datos."""

import argparse
import getpass
import sys
from sqlmodel import Session, select

from app.database import engine
from app.models.usuario import RolUsuario, Usuario
from app.services.auth_service import hashear_password


ROLES_VALIDOS = {
    "1": RolUsuario.OPERARIO,
    "2": RolUsuario.MANTENIMIENTO,
    "3": RolUsuario.ENCARGADO,
    "4": RolUsuario.GERENCIA,
    "OPERARIO": RolUsuario.OPERARIO,
    "MANTENIMIENTO": RolUsuario.MANTENIMIENTO,
    "ENCARGADO": RolUsuario.ENCARGADO,
    "GERENCIA": RolUsuario.GERENCIA,
}


def listar_usuarios():
    """Muestra todos los usuarios registrados en la base de datos."""
    with Session(engine) as session:
        usuarios = session.exec(select(Usuario).order_by(Usuario.id)).all()

        if not usuarios:
            print("\n⚠️  No hay usuarios registrados en la base de datos.")
            return

        print("\n" + "=" * 70)
        print(f"{'ID':<4} | {'USERNAME':<15} | {'NOMBRE':<22} | {'ROL':<14} | {'ACTIVO'}")
        print("=" * 70)
        for u in usuarios:
            activo_txt = "Sí" if u.activo else "No"
            print(f"{u.id:<4} | {u.username:<15} | {u.nombre:<22} | {u.rol.value:<14} | {activo_txt}")
        print("=" * 70 + "\n")


def agregar_usuario(username: str, nombre: str, password: str, rol: RolUsuario):
    """Guarda un nuevo usuario con la contraseña hasheada en la base de datos."""
    username_limpio = username.strip().lower()

    with Session(engine) as session:
        # Verificar si el username ya existe
        existente = session.exec(
            select(Usuario).where(Usuario.username == username_limpio)
        ).first()

        if existente:
            print(f"\n❌ Error: El usuario '{username_limpio}' ya existe (ID: {existente.id}, Rol: {existente.rol.value}).")
            sys.exit(1)

        nuevo = Usuario(
            username=username_limpio,
            nombre=nombre.strip(),
            password_hash=hashear_password(password),
            rol=rol,
            activo=True,
        )

        session.add(nuevo)
        session.commit()
        session.refresh(nuevo)

        print("\n" + "─" * 50)
        print(f"✅ ¡Usuario creado con éxito!")
        print(f"   ID:       {nuevo.id}")
        print(f"   Username: {nuevo.username}")
        print(f"   Nombre:   {nuevo.nombre}")
        print(f"   Rol:      {nuevo.rol.value}")
        print("─" * 50 + "\n")


def modo_interactivo():
    """Pide los datos paso a paso en la consola."""
    print("\n========================================")
    print("      ALTA DE NUEVO USUARIO")
    print("========================================")

    while True:
        username = input("\n• Nombre de usuario (username): ").strip()
        if username:
            break
        print("  ⚠️  El username no puede estar vacío.")

    while True:
        nombre = input("• Nombre completo (ej: Juan Pérez): ").strip()
        if nombre:
            break
        print("  ⚠️  El nombre no puede estar vacío.")

    print("\nSeleccioná el rol:")
    print("  1) OPERARIO       (Reportar incidencias, QR)")
    print("  2) MANTENIMIENTO  (Operar stock, consumos, compras)")
    print("  3) ENCARGADO      (Aprobación, supervisión, gestión)")
    print("  4) GERENCIA       (Tableros, estadísticas)")

    while True:
        opcion_rol = input("Opción [1-4]: ").strip().upper()
        if opcion_rol in ROLES_VALIDOS:
            rol_elegido = ROLES_VALIDOS[opcion_rol]
            break
        print("  ⚠️  Opción inválida. Ingresá un número del 1 al 4 o el nombre del rol.")

    while True:
        password = getpass.getpass("\n• Contraseña: ")
        if not password:
            print("  ⚠️  La contraseña no puede estar vacía.")
            continue
        password_confirm = getpass.getpass("• Confirmar contraseña: ")
        if password != password_confirm:
            print("  ❌ Las contraseñas no coinciden. Intentá de nuevo.")
            continue
        break

    agregar_usuario(username, nombre, password, rol_elegido)


def main():
    parser = argparse.ArgumentParser(description="Gestión de usuarios de Farmacia")
    parser.add_argument("--listar", action="store_true", help="Listar todos los usuarios")
    parser.add_argument("-u", "--username", help="Nombre de usuario")
    parser.add_argument("-n", "--nombre", help="Nombre completo")
    parser.add_argument("-p", "--password", help="Contraseña")
    parser.add_argument(
        "-r", "--rol",
        choices=["OPERARIO", "MANTENIMIENTO", "ENCARGADO", "GERENCIA"],
        help="Rol asignado"
    )

    args = parser.parse_args()

    if args.listar:
        listar_usuarios()
        return

    # Si pasó todos los argumentos por CLI
    if args.username and args.nombre and args.password and args.rol:
        rol = ROLES_VALIDOS[args.rol.upper()]
        agregar_usuario(args.username, args.nombre, args.password, rol)
    elif any([args.username, args.nombre, args.password, args.rol]):
        print("❌ Error: Para crear un usuario por argumentos debés pasar todos los campos: -u, -n, -p y -r")
        sys.exit(1)
    else:
        # Modo interactivo
        modo_interactivo()


if __name__ == "__main__":
    main()
