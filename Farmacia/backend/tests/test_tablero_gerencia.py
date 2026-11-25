"""Tests unitarios para el perfil Gerencia y el Tablero de Seguimiento Ejecutivo."""

import unittest
from datetime import datetime, timezone
from unittest.mock import MagicMock

from fastapi import HTTPException

from app.dependencies import requerir_roles
from app.models.incidencia import EstadoIncidencia, Incidencia, PrioridadIncidencia, Turno
from app.models.maquina import Maquina
from app.models.tablero import IncidenciaTablero, ResumenMaquinas, TableroResumen
from app.models.usuario import RolUsuario, Usuario
from app.services.tablero_service import TableroService


class TestTableroGerencia(unittest.TestCase):
    """Batería de 20 tests unitarios que validan la lógica de negocio y seguridad de Gerencia."""

    def setUp(self):
        """Configuración de mocks y servicio para cada prueba."""
        self.mock_repo = MagicMock()
        self.service = TableroService(self.mock_repo)

   

    def test_01_rol_gerencia_valor_enum(self):
        """Verifica que el rol GERENCIA esté definido correctamente en el enum del sistema."""
        self.assertEqual(RolUsuario.GERENCIA.value, "GERENCIA")
        self.assertIn("GERENCIA", [r.value for r in RolUsuario])

    def test_02_permisos_gerencia_acceso_permitido(self):
        """Verifica que un usuario con rol GERENCIA tenga acceso al verificador de roles de gerencia."""
        usuario_gerente = Usuario(
            id=1,
            username="gerente1",
            nombre="Roberto Gerente",
            rol=RolUsuario.GERENCIA,
            password_hash="fakehash",
            activo=True,
        )
        guard = requerir_roles(RolUsuario.GERENCIA)
        resultado = guard(usuario=usuario_gerente)
        self.assertEqual(resultado.username, "gerente1")
        self.assertEqual(resultado.rol, RolUsuario.GERENCIA)

    def test_03_permisos_gerencia_deniega_operario(self):
        """Verifica que un usuario con rol OPERARIO reciba HTTP 403 al intentar acceder a Gerencia."""
        usuario_operario = Usuario(
            id=2,
            username="operario1",
            nombre="Juan Operario",
            rol=RolUsuario.OPERARIO,
            password_hash="fakehash",
            activo=True,
        )
        guard = requerir_roles(RolUsuario.GERENCIA)
        with self.assertRaises(HTTPException) as ctx:
            guard(usuario=usuario_operario)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Permisos insuficientes", ctx.exception.detail)

    def test_04_permisos_gerencia_deniega_mantenimiento(self):
        """Verifica que un usuario con rol MANTENIMIENTO reciba HTTP 403 en endpoints exclusivos de Gerencia."""
        usuario_mantenimiento = Usuario(
            id=3,
            username="tecnico1",
            nombre="Carlos Técnico",
            rol=RolUsuario.MANTENIMIENTO,
            password_hash="fakehash",
            activo=True,
        )
        guard = requerir_roles(RolUsuario.GERENCIA)
        with self.assertRaises(HTTPException) as ctx:
            guard(usuario=usuario_mantenimiento)
        self.assertEqual(ctx.exception.status_code, 403)

    def test_05_permisos_gerencia_deniega_encargado(self):
        """Verifica que un usuario con rol ENCARGADO sea bloqueado en endpoints reservados para Gerencia."""
        usuario_encargado = Usuario(
            id=4,
            username="encargado1",
            nombre="Marta Encargada",
            rol=RolUsuario.ENCARGADO,
            password_hash="fakehash",
            activo=True,
        )
        guard = requerir_roles(RolUsuario.GERENCIA)
        with self.assertRaises(HTTPException) as ctx:
            guard(usuario=usuario_encargado)
        self.assertEqual(ctx.exception.status_code, 403)

   

    def test_06_resumen_maquinas_conteo_operativas(self):
        """Verifica que se cuenten correctamente las máquinas en estado OPERATIVA."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="Envasadora 1", tipo="Env", sector="A", estado="OPERATIVA", oee=80.0),
            Maquina(codigo="M-02", nombre="Envasadora 2", tipo="Env", sector="A", estado="OPERATIVO", oee=85.0),
            Maquina(codigo="M-03", nombre="Prensa 1", tipo="Pre", sector="B", estado="DETENIDA", oee=0.0),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.operativas, 2)

    def test_07_resumen_maquinas_conteo_en_alerta(self):
        """Verifica que se cuenten correctamente las máquinas en estado ALERTA o EN ALERTA."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="Bomba 1", tipo="Bom", sector="A", estado="ALERTA", oee=70.0),
            Maquina(codigo="M-02", nombre="Bomba 2", tipo="Bom", sector="A", estado="EN ALERTA", oee=72.0),
            Maquina(codigo="M-03", nombre="Bomba 3", tipo="Bom", sector="A", estado="OPERATIVA", oee=90.0),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.en_alerta, 2)

    def test_08_resumen_maquinas_conteo_en_mantenimiento(self):
        """Verifica que se contabilicen las máquinas en mantenimiento programado o correctivo."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="Compresor 1", tipo="Comp", sector="A", estado="MANTENIMIENTO", oee=50.0),
            Maquina(codigo="M-02", nombre="Compresor 2", tipo="Comp", sector="A", estado="EN MANTENIMIENTO", oee=55.0),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.en_mantenimiento, 2)

    def test_09_resumen_maquinas_conteo_detenidas(self):
        """Verifica que se identifiquen las máquinas paradas o fuera de servicio."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="Reactor 1", tipo="React", sector="Q", estado="DETENIDA", oee=0.0),
            Maquina(codigo="M-02", nombre="Reactor 2", tipo="React", sector="Q", estado="DETENIDO", oee=0.0),
            Maquina(codigo="M-03", nombre="Reactor 3", tipo="React", sector="Q", estado="OPERATIVA", oee=92.0),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.detenidas, 2)

    def test_10_resumen_maquinas_conteo_total(self):
        """Verifica que el total de máquinas informadas a Gerencia coincida con la suma de la flota."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="M1", tipo="T1", sector="S1", estado="OPERATIVA"),
            Maquina(codigo="M-02", nombre="M2", tipo="T1", sector="S1", estado="ALERTA"),
            Maquina(codigo="M-03", nombre="M3", tipo="T1", sector="S1", estado="MANTENIMIENTO"),
            Maquina(codigo="M-04", nombre="M4", tipo="T1", sector="S1", estado="DETENIDA"),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.total, 4)

    def test_11_resumen_maquinas_sin_maquinas_cero_division(self):
        """Valida que si no hay máquinas registradas en la planta, el OEE sea 0.0 y no lance ZeroDivisionError."""
        self.mock_repo.obtener_maquinas.return_value = []
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.total, 0)
        self.assertEqual(resumen.maquinas.oee_promedio, 0.0)
        self.assertEqual(resumen.incidencias_activas, 0)

  

    def test_12_oee_promedio_calculo_redondeo(self):
        """Verifica que el promedio de OEE para Gerencia se calcule con precisión y se redondee a 1 decimal."""
        # Promedio: (80.4 + 90.5 + 75.2) / 3 = 246.1 / 3 = 82.033... -> 82.0
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="M1", tipo="T", sector="S", estado="OPERATIVA", oee=80.4),
            Maquina(codigo="M-02", nombre="M2", tipo="T", sector="S", estado="OPERATIVA", oee=90.5),
            Maquina(codigo="M-03", nombre="M3", tipo="T", sector="S", estado="OPERATIVA", oee=75.2),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.oee_promedio, 82.0)

    def test_13_oee_promedio_maquinas_sin_oee(self):
        """Verifica que las máquinas con OEE nulo o 0 no causen errores de tipo en la sumatoria."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="M1", tipo="T", sector="S", estado="OPERATIVA", oee=100.0),
            Maquina(codigo="M-02", nombre="M2", tipo="T", sector="S", estado="DETENIDA", oee=0.0),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.oee_promedio, 50.0)

    def test_14_normalizacion_estados_mayusculas_y_espacios(self):
        """Valida que los estados ingresados con espacios o minúsculas se normalicen sin perderse."""
        self.mock_repo.obtener_maquinas.return_value = [
            Maquina(codigo="M-01", nombre="M1", tipo="T", sector="S", estado="  operativa  "),
            Maquina(codigo="M-02", nombre="M2", tipo="T", sector="S", estado="AlErTa"),
            Maquina(codigo="M-03", nombre="M3", tipo="T", sector="S", estado="en mantenimiento "),
        ]
        self.mock_repo.obtener_incidencias_activas.return_value = []

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.maquinas.operativas, 1)
        self.assertEqual(resumen.maquinas.en_alerta, 1)
        self.assertEqual(resumen.maquinas.en_mantenimiento, 1)

 

    def test_15_mapeo_incidencia_tablero_campos_completos(self):
        """Verifica que la incidencia se transforme correctamente al DTO con máquina y técnico asignado."""
        ahora = datetime.now(timezone.utc)
        inc = Incidencia(
            id=10,
            codigo="INC-0010",
            maquina_id=5,
            usuario_reportante_id=2,
            descripcion="Fuga de aceite en el pistón hidráulico",
            turno=Turno.MANANA,
            prioridad=PrioridadIncidencia.ALTA,
            estado=EstadoIncidencia.EN_REPARACION,
            fecha_reporte=ahora,
        )
        maq = Maquina(id=5, codigo="HYD-01", nombre="Prensa Hidráulica", tipo="Prensa", sector="Prensas")
        usu = Usuario(id=2, username="carlos", nombre="Carlos Gómez", rol=RolUsuario.MANTENIMIENTO, password_hash="x")

        self.mock_repo.obtener_maquinas.return_value = []
        self.mock_repo.obtener_incidencias_activas.return_value = [(inc, maq, usu)]

        resumen = self.service.obtener_resumen()
        self.assertEqual(len(resumen.incidencias), 1)

        item = resumen.incidencias[0]
        self.assertEqual(item.id, 10)
        self.assertEqual(item.codigo, "INC-0010")
        self.assertEqual(item.maquina_codigo, "HYD-01")
        self.assertEqual(item.maquina_nombre, "Prensa Hidráulica")
        self.assertEqual(item.descripcion, "Fuga de aceite en el pistón hidráulico")
        self.assertEqual(item.estado, "EN_REPARACION")
        self.assertEqual(item.prioridad, "ALTA")
        self.assertEqual(item.turno, "Mañana")
        self.assertEqual(item.tecnico, "Carlos Gómez")

    def test_16_mapeo_incidencia_sin_maquina_asociada(self):
        """Verifica que si una incidencia huérfana no tiene máquina válida, use valores por defecto seguros."""
        inc = Incidencia(
            id=11,
            codigo="INC-0011",
            maquina_id=999,
            usuario_reportante_id=1,
            descripcion="Incidencia sin máquina vinculada",
            turno=Turno.NOCHE,
            prioridad=PrioridadIncidencia.BAJA,
            estado=EstadoIncidencia.REPORTADA,
        )
        usu = Usuario(id=1, username="juan", nombre="Juan Pérez", rol=RolUsuario.OPERARIO, password_hash="x")

        self.mock_repo.obtener_maquinas.return_value = []
        self.mock_repo.obtener_incidencias_activas.return_value = [(inc, None, usu)]

        resumen = self.service.obtener_resumen()
        item = resumen.incidencias[0]
        self.assertEqual(item.maquina_codigo, "N/A")
        self.assertEqual(item.maquina_nombre, "Máquina no encontrada")

    def test_17_mapeo_incidencia_sin_tecnico_asignado(self):
        """Verifica que si no hay usuario informante/técnico, indique 'Sin asignar'."""
        inc = Incidencia(
            id=12,
            codigo="INC-0012",
            maquina_id=1,
            usuario_reportante_id=999,
            descripcion="Falla general de alimentación",
            turno=Turno.TARDE,
            prioridad=PrioridadIncidencia.CRITICA,
            estado=EstadoIncidencia.EN_TRIAGE,
        )
        maq = Maquina(id=1, codigo="GEN-01", nombre="Generador", tipo="G", sector="S")

        self.mock_repo.obtener_maquinas.return_value = []
        self.mock_repo.obtener_incidencias_activas.return_value = [(inc, maq, None)]

        resumen = self.service.obtener_resumen()
        item = resumen.incidencias[0]
        self.assertEqual(item.tecnico, "Sin asignar")

    def test_18_incidencias_activas_cuenta_correctamente(self):
        """Verifica que el contador 'incidencias_activas' sea consistente con la cantidad de incidencias devueltas."""
        inc1 = Incidencia(
            id=1, codigo="I1", maquina_id=1, usuario_reportante_id=1,
            descripcion="F1", turno=Turno.MANANA, prioridad=PrioridadIncidencia.MEDIA,
            estado=EstadoIncidencia.REPORTADA
        )
        inc2 = Incidencia(
            id=2, codigo="I2", maquina_id=1, usuario_reportante_id=1,
            descripcion="F2", turno=Turno.TARDE, prioridad=PrioridadIncidencia.ALTA,
            estado=EstadoIncidencia.EN_REPARACION
        )
        self.mock_repo.obtener_maquinas.return_value = []
        self.mock_repo.obtener_incidencias_activas.return_value = [
            (inc1, None, None),
            (inc2, None, None),
        ]

        resumen = self.service.obtener_resumen()
        self.assertEqual(resumen.incidencias_activas, 2)
        self.assertEqual(len(resumen.incidencias), 2)

   

    def test_19_tablero_resumen_dto_valido(self):
        """Verifica que el modelo TableroResumen se instancie con los tipos correctos de sus miembros."""
        maquinas_info = ResumenMaquinas(
            total=10,
            operativas=7,
            en_alerta=1,
            en_mantenimiento=1,
            detenidas=1,
            oee_promedio=84.5,
        )
        incidencia_info = IncidenciaTablero(
            id=1,
            codigo="INC-0001",
            maquina_id=2,
            maquina_codigo="BLS-01",
            maquina_nombre="Blistera 1",
            descripcion="Atasco de blíster",
            estado="REPORTADA",
            prioridad="MEDIA",
            fecha_reporte=datetime.now(timezone.utc),
            turno="Mañana",
            tecnico="Lucas Técnico",
        )
        tablero = TableroResumen(
            maquinas=maquinas_info,
            incidencias_activas=1,
            incidencias=[incidencia_info],
        )

        self.assertEqual(tablero.maquinas.total, 10)
        self.assertEqual(tablero.incidencias_activas, 1)
        self.assertEqual(tablero.incidencias[0].codigo, "INC-0001")

    def test_20_tablero_resumen_serializacion_json(self):
        """Verifica que el modelo TableroResumen pueda ser serializado a JSON para la respuesta HTTP de FastAPI."""
        maquinas_info = ResumenMaquinas(
            total=5,
            operativas=4,
            en_alerta=0,
            en_mantenimiento=1,
            detenidas=0,
            oee_promedio=91.2,
        )
        tablero = TableroResumen(
            maquinas=maquinas_info,
            incidencias_activas=0,
            incidencias=[],
        )
        json_dict = tablero.model_dump()
        self.assertIn("maquinas", json_dict)
        self.assertIn("incidencias_activas", json_dict)
        self.assertIn("incidencias", json_dict)
        self.assertEqual(json_dict["maquinas"]["oee_promedio"], 91.2)
        self.assertEqual(json_dict["incidencias_activas"], 0)


if __name__ == "__main__":
    unittest.main()
