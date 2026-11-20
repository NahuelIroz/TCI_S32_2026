--
-- PostgreSQL database dump
--

\restrict c2dhi3SBTdJlfDhyaNfJ1e9W4NVL17IgzV51nr9b77eYR7zn79DAnoEfMt7WlW9

-- Dumped from database version 16.16 (Debian 16.16-1.pgdg13+1)
-- Dumped by pg_dump version 16.16 (Debian 16.16-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: estadoincidencia; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estadoincidencia AS ENUM (
    'REPORTADA',
    'EN_TRIAGE',
    'EN_REPARACION',
    'RESUELTA',
    'CERRADA',
    'RECHAZADA'
);


--
-- Name: estadopedido; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.estadopedido AS ENUM (
    'PENDIENTE',
    'COTIZACION',
    'APROBADO',
    'RECHAZADO',
    'RECIBIDO'
);


--
-- Name: prioridadincidencia; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prioridadincidencia AS ENUM (
    'BAJA',
    'MEDIA',
    'ALTA',
    'CRITICA'
);


--
-- Name: prioridadpedido; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.prioridadpedido AS ENUM (
    'BAJA',
    'MEDIA',
    'URGENTE'
);


--
-- Name: rolusuario; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.rolusuario AS ENUM (
    'OPERARIO',
    'MANTENIMIENTO',
    'ENCARGADO',
    'GERENCIA'
);


--
-- Name: tipomovimientostock; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tipomovimientostock AS ENUM (
    'INGRESO',
    'CONSUMO',
    'AJUSTE'
);


--
-- Name: turno; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.turno AS ENUM (
    'MANANA',
    'TARDE',
    'NOCHE'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: incidencia_fotos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidencia_fotos (
    id integer NOT NULL,
    incidencia_id integer NOT NULL,
    nombre_archivo character varying NOT NULL,
    fecha_subida timestamp with time zone NOT NULL
);


--
-- Name: incidencia_fotos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.incidencia_fotos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incidencia_fotos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.incidencia_fotos_id_seq OWNED BY public.incidencia_fotos.id;


--
-- Name: incidencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.incidencias (
    id integer NOT NULL,
    codigo character varying NOT NULL,
    maquina_id integer NOT NULL,
    usuario_reportante_id integer NOT NULL,
    descripcion character varying NOT NULL,
    turno public.turno NOT NULL,
    prioridad public.prioridadincidencia NOT NULL,
    estado public.estadoincidencia NOT NULL,
    fecha_reporte timestamp with time zone NOT NULL
);


--
-- Name: incidencias_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.incidencias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: incidencias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.incidencias_id_seq OWNED BY public.incidencias.id;


--
-- Name: maquinas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.maquinas (
    id integer NOT NULL,
    codigo character varying NOT NULL,
    nombre character varying NOT NULL,
    tipo character varying NOT NULL,
    sector character varying NOT NULL,
    estado character varying NOT NULL,
    criticidad character varying(50) DEFAULT 'Media'::character varying,
    oee double precision DEFAULT 0.0,
    temperatura character varying(30) DEFAULT 'N/D'::character varying,
    presion character varying(30) DEFAULT 'N/D'::character varying,
    horas_operacion integer DEFAULT 0,
    ultima_revision character varying(50) DEFAULT ''::character varying,
    proximo_mantenimiento character varying(50) DEFAULT ''::character varying,
    responsable character varying(100) DEFAULT 'Sin asignar'::character varying,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: maquinas_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.maquinas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: maquinas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.maquinas_id_seq OWNED BY public.maquinas.id;


--
-- Name: movimientos_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.movimientos_stock (
    id integer NOT NULL,
    repuesto_id integer NOT NULL,
    tipo public.tipomovimientostock NOT NULL,
    cantidad integer NOT NULL,
    motivo character varying(300) NOT NULL,
    fecha timestamp with time zone NOT NULL,
    remito character varying(100),
    ubicacion character varying(200),
    proveedor character varying(200),
    tecnico_delegado character varying(200),
    observaciones text,
    maquina character varying(200),
    orden_trabajo character varying(100),
    tecnico character varying(200),
    pedido_compra_id integer,
    incidencia_id integer
);


--
-- Name: movimientos_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.movimientos_stock_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: movimientos_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.movimientos_stock_id_seq OWNED BY public.movimientos_stock.id;


--
-- Name: pedidos_compra; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pedidos_compra (
    id integer NOT NULL,
    repuesto_id integer NOT NULL,
    cantidad integer NOT NULL,
    prioridad public.prioridadpedido NOT NULL,
    justificacion character varying(1000) NOT NULL,
    estado public.estadopedido NOT NULL,
    fecha timestamp with time zone NOT NULL,
    solicitante character varying(200) NOT NULL,
    monto_estimado double precision NOT NULL,
    proveedor character varying(200) NOT NULL,
    notificacion_leida boolean NOT NULL
);


--
-- Name: pedidos_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pedidos_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pedidos_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pedidos_compra_id_seq OWNED BY public.pedidos_compra.id;


--
-- Name: repuestos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.repuestos (
    id integer NOT NULL,
    codigo character varying(50) NOT NULL,
    nombre character varying(200) NOT NULL,
    disponible integer NOT NULL,
    minimo integer NOT NULL,
    unidad character varying(30) NOT NULL,
    ubicacion character varying(200) DEFAULT 'Sin ubicación'::character varying NOT NULL,
    activo boolean DEFAULT true NOT NULL
);


--
-- Name: repuestos_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.repuestos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: repuestos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.repuestos_id_seq OWNED BY public.repuestos.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    username character varying NOT NULL,
    nombre character varying NOT NULL,
    password_hash character varying NOT NULL,
    rol public.rolusuario NOT NULL,
    activo boolean NOT NULL
);


--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: incidencia_fotos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencia_fotos ALTER COLUMN id SET DEFAULT nextval('public.incidencia_fotos_id_seq'::regclass);


--
-- Name: incidencias id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencias ALTER COLUMN id SET DEFAULT nextval('public.incidencias_id_seq'::regclass);


--
-- Name: maquinas id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquinas ALTER COLUMN id SET DEFAULT nextval('public.maquinas_id_seq'::regclass);


--
-- Name: movimientos_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock ALTER COLUMN id SET DEFAULT nextval('public.movimientos_stock_id_seq'::regclass);


--
-- Name: pedidos_compra id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos_compra ALTER COLUMN id SET DEFAULT nextval('public.pedidos_compra_id_seq'::regclass);


--
-- Name: repuestos id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repuestos ALTER COLUMN id SET DEFAULT nextval('public.repuestos_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: incidencia_fotos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incidencia_fotos (id, incidencia_id, nombre_archivo, fecha_subida) FROM stdin;
1	6	10ae230d1dee46b3b4e30cb4b2a4e3fe.webp	2026-11-20 00:16:51.344326+00
2	6	fec328cb39a64485aaf2b0d6ecdb9c22.jpg	2026-11-20 00:16:51.344644+00
\.


--
-- Data for Name: incidencias; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.incidencias (id, codigo, maquina_id, usuario_reportante_id, descripcion, turno, prioridad, estado, fecha_reporte) FROM stdin;
1	INC-0001	1	1	Fuga de lubricante en el eje principal de la envasadora	MANANA	ALTA	EN_TRIAGE	2026-11-17 05:05:43.239875+00
3	INC-0003	1	1	Se solto la correa	TARDE	MEDIA	REPORTADA	2026-11-19 16:15:16.443617+00
4	INC-0004	2	1	Se oxido todo	TARDE	MEDIA	REPORTADA	2026-11-20 00:07:10.789807+00
5	INC-0005	4	1	Oxido	MANANA	MEDIA	REPORTADA	2026-11-20 00:08:34.825844+00
6	INC-0006	4	1	Oxido por todos lados	MANANA	MEDIA	EN_REPARACION	2026-11-20 00:16:51.0884+00
2	INC-0002	1	1	Pérdida de presión en el sistema hidráulico	TARDE	ALTA	RESUELTA	2026-11-17 05:52:19.14738+00
\.


--
-- Data for Name: maquinas; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.maquinas (id, codigo, nombre, tipo, sector, estado, criticidad, oee, temperatura, presion, horas_operacion, ultima_revision, proximo_mantenimiento, responsable, activo) FROM stdin;
1	SEC-ENV-03	Envasadora Rotativa #03	Envasadora	Línea de Envasado A	Alerta	Crítica	78.4	68°C	5.8 bar	4820	15/10/2026	30/10/2026	Carlos Gómez	t
2	HYD-PRE-12	Prensa Hidráulica H-12	Prensa	Prensas y Formado	En Mantenimiento	Crítica	62.1	54°C	140 bar	6150	20/10/2026	02/11/2026	J. Morales	t
3	CMP-CTR-01	Compresor Central C-01	Compresor	Servicios Centrales	Operativa	Crítica	94.2	42°C	8.2 bar	12400	25/10/2026	25/11/2026	M. López	t
4	BLS-TRN-04	Blistera Automática #04	Blistera	Empaque Secundario	Operativa	Media	89.6	48°C	6.0 bar	3200	18/10/2026	10/11/2026	Carlos Gómez	t
5	LAV-AMP-02	Lavadora de Ampollas L-02	Lavadora	Zona Estéril	Detenida	Crítica	0	22°C	0.0 bar	5100	12/10/2026	31/10/2026	Sin asignar	t
6	RCT-SNT-01	Reactor de Síntesis R-01	Reactor	Planta Química	Operativa	Media	91	75°C	2.4 bar	8900	22/10/2026	15/11/2026	M. López	t
7	MZC-IND-05	Mezcladora Industrial M-05	Mezcladora	Producción de Sólidos	Operativa	Alta	87.5	38°C	1.2 bar	2450	15/11/2026	15/12/2026	Carlos	t
\.


--
-- Data for Name: movimientos_stock; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.movimientos_stock (id, repuesto_id, tipo, cantidad, motivo, fecha, remito, ubicacion, proveedor, tecnico_delegado, observaciones, maquina, orden_trabajo, tecnico, pedido_compra_id, incidencia_id) FROM stdin;
1	2	INGRESO	10	Recepción de compra RN-08	2026-11-18 03:41:26.381903+00	REM-2026-0045	Pasillo B · Gabinete 4 (Nivel 3)	Distribuidora Industrial S.A.	Carlos Gómez (Mantenimiento)	Mercadería recibida en buen estado	\N	\N	\N	\N	\N
2	4	INGRESO	5	Recepción de compra RN-08	2026-11-18 03:47:51.923808+00	REM-2026-0045	Pasillo C · Estante 3 (Nivel 1)	Distribuidora Industrial S.A.	Carlos Gómez (Mantenimiento)		\N	\N	\N	\N	\N
3	2	CONSUMO	2	Cambio correctivo por vibración y desgaste	2026-11-19 02:54:47.239135+00	\N	\N	\N	\N	\N	Envasadora Rotativa #03	OT-2026-089	Carlos Gómez (Mantenimiento)	\N	\N
4	3	CONSUMO	2	Cambio por mantenimiento de rutina	2026-11-19 03:19:16.12203+00	\N	\N	\N	\N	\N	Prensa Hidráulica H-12	OT-2026-089	Carlos Gómez (Mantenimiento)	\N	\N
5	3	INGRESO	3	Recepción de compra RN-08	2026-11-19 06:19:59.994718+00	REM-2026-0047	Pasillo A · Estante 1 (Nivel 2)	Distribuidora Industrial S.A.	J. Morales (Mantenimiento)		\N	\N	\N	2	\N
6	3	INGRESO	2	Recepción de compra RN-08	2026-11-19 06:20:47.996733+00	REM-2026-0048	Pasillo A · Estante 1 (Nivel 2)	Distribuidora Industrial S.A.	Carlos Gómez (Mantenimiento)		\N	\N	\N	2	\N
7	1	INGRESO	8	Recepción de compra RN-08	2026-11-19 16:21:01.055421+00	REM-2026-0049	Pasillo A · Estante 2 (Nivel 1)	Nahuel soluciones	Carlos Gómez (Mantenimiento)		\N	\N	\N	5	\N
8	1	INGRESO	4	Recepción de compra RN-08	2026-11-19 16:21:49.724966+00	REM-2026-0050	Pasillo A · Estante 2 (Nivel 1)	Nahuel soluciones	Carlos Gómez (Mantenimiento)		\N	\N	\N	5	\N
9	3	CONSUMO	1	Cambio correctivo por vibración y desgaste	2026-11-20 03:57:42.599324+00	\N	\N	\N	\N	\N	Blistera Automática #04	OT-2026-089	Carlos Gómez (Mantenimiento)	\N	6
\.


--
-- Data for Name: pedidos_compra; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pedidos_compra (id, repuesto_id, cantidad, prioridad, justificacion, estado, fecha, solicitante, monto_estimado, proveedor, notificacion_leida) FROM stdin;
3	1	12	MEDIA	Faltante detectado (RN-03): stock actual de 8 unid. (mínimo de seguridad: 10 unid.).	COTIZACION	2026-11-19 04:22:15.576995+00	Carlos Gómez (Mantenimiento)	0		f
1	4	5	URGENTE	Stock agotado. Se requiere reposición para mantenimiento correctivo.	APROBADO	2026-11-19 04:01:00.187238+00	Carlos Gómez (Mantenimiento)	400000	Soluciones metalurgicas	f
2	3	5	BAJA	Faltante detectado (RN-03): stock actual de 13 unid. (mínimo de seguridad: 4 unid.).	RECIBIDO	2026-11-19 04:21:53.891693+00	Carlos Gómez (Mantenimiento)	0		f
4	1	12	MEDIA	Faltante detectado (RN-03): stock actual de 8 unid. (mínimo de seguridad: 10 unid.).	COTIZACION	2026-11-19 07:30:13.645496+00	Carlos Gómez (Mantenimiento)	45000	Soluciones Rodriguez	f
5	1	12	URGENTE	Faltante detectado (RN-03): stock actual de 8 unid. (mínimo de seguridad: 10 unid.).	RECIBIDO	2026-11-19 16:17:57.396627+00	Carlos Gómez (Mantenimiento)	400000	Nahuel soluciones	f
\.


--
-- Data for Name: repuestos; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.repuestos (id, codigo, nombre, disponible, minimo, unidad, ubicacion, activo) FROM stdin;
2	SKU-VLV-420	Válvula Solenoide Festo 24V DC 5/2	10	5	unid.	Pasillo B · Gabinete 4 (Nivel 3)	t
1	SKU-6204-2R	Rodamiento Rígido de Bolas SKF 6204-2RSH	20	10	unid.	Pasillo A · Estante 2 (Nivel 1)	t
3	SKU-FLT-880	Filtro de Aire Compresor Atlas Copco	17	4	unid.	Pasillo A · Estante 1 (Nivel 2)	t
4	SKU-COR-900	Correa Dentada Sincrónica 8M	5	5	unid.	Pasillo C · Estante 3 (Nivel 1)	t
5	SKU-SEN-M12-001	Sensor de Proximidad Inductivo M12 PNP	0	5	unid.	Pasillo B · Estante 3 (Nivel 2)	t
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.usuarios (id, username, nombre, password_hash, rol, activo) FROM stdin;
1	operario_test	Operario de Prueba	NO_ES_UN_HASH_VALIDO	OPERARIO	t
2	operario	Juan Operario	$2b$12$hcVnfCJy7dAH5VqCavtVA.rIH8XVb/dbcN1ZJuAfkDdfRQcMktyc6	OPERARIO	t
3	mantenimiento	Carlos Mantenimiento	$2b$12$Uavjp0F7oIWgp7peR5/akOY03fq2nVnlLNdijOJFxe.bFvmahxPxG	MANTENIMIENTO	t
4	encargado	Marta Encargada	$2b$12$pmAdMry7wz9dM9NAOfGpNezhpx7hlafw2VUPXNSA1Mibs20tiQUo6	ENCARGADO	t
5	gerencia	Roberto Gerente	$2b$12$5OMCsZWuH5HBlMJ5IdVvNu/wpc.xWm.eeLMPtCuCt6p1mboe5MV.G	GERENCIA	t
6	pepe	Pepe Gerente	$2b$12$7ulHOCaCWTEDNNiJ7hbhs../gmqHDQ2Y0WJwlkJoFR.tG9A3r/lFe	GERENCIA	t
\.


--
-- Name: incidencia_fotos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incidencia_fotos_id_seq', 2, true);


--
-- Name: incidencias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.incidencias_id_seq', 6, true);


--
-- Name: maquinas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.maquinas_id_seq', 7, true);


--
-- Name: movimientos_stock_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.movimientos_stock_id_seq', 9, true);


--
-- Name: pedidos_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.pedidos_compra_id_seq', 5, true);


--
-- Name: repuestos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.repuestos_id_seq', 5, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 6, true);


--
-- Name: incidencia_fotos incidencia_fotos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencia_fotos
    ADD CONSTRAINT incidencia_fotos_pkey PRIMARY KEY (id);


--
-- Name: incidencias incidencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencias
    ADD CONSTRAINT incidencias_pkey PRIMARY KEY (id);


--
-- Name: maquinas maquinas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.maquinas
    ADD CONSTRAINT maquinas_pkey PRIMARY KEY (id);


--
-- Name: movimientos_stock movimientos_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_pkey PRIMARY KEY (id);


--
-- Name: pedidos_compra pedidos_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos_compra
    ADD CONSTRAINT pedidos_compra_pkey PRIMARY KEY (id);


--
-- Name: repuestos repuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.repuestos
    ADD CONSTRAINT repuestos_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: ix_incidencia_fotos_incidencia_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_incidencia_fotos_incidencia_id ON public.incidencia_fotos USING btree (incidencia_id);


--
-- Name: ix_incidencias_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_incidencias_codigo ON public.incidencias USING btree (codigo);


--
-- Name: ix_maquinas_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_maquinas_codigo ON public.maquinas USING btree (codigo);


--
-- Name: ix_movimientos_stock_incidencia_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_movimientos_stock_incidencia_id ON public.movimientos_stock USING btree (incidencia_id);


--
-- Name: ix_movimientos_stock_pedido_compra_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_movimientos_stock_pedido_compra_id ON public.movimientos_stock USING btree (pedido_compra_id);


--
-- Name: ix_movimientos_stock_repuesto_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_movimientos_stock_repuesto_id ON public.movimientos_stock USING btree (repuesto_id);


--
-- Name: ix_pedidos_compra_repuesto_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_pedidos_compra_repuesto_id ON public.pedidos_compra USING btree (repuesto_id);


--
-- Name: ix_repuestos_codigo; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_repuestos_codigo ON public.repuestos USING btree (codigo);


--
-- Name: ix_usuarios_username; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX ix_usuarios_username ON public.usuarios USING btree (username);


--
-- Name: movimientos_stock fk_movimientos_pedido_compra; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT fk_movimientos_pedido_compra FOREIGN KEY (pedido_compra_id) REFERENCES public.pedidos_compra(id);


--
-- Name: movimientos_stock fk_movimientos_stock_incidencia; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT fk_movimientos_stock_incidencia FOREIGN KEY (incidencia_id) REFERENCES public.incidencias(id);


--
-- Name: incidencia_fotos incidencia_fotos_incidencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencia_fotos
    ADD CONSTRAINT incidencia_fotos_incidencia_id_fkey FOREIGN KEY (incidencia_id) REFERENCES public.incidencias(id);


--
-- Name: incidencias incidencias_maquina_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencias
    ADD CONSTRAINT incidencias_maquina_id_fkey FOREIGN KEY (maquina_id) REFERENCES public.maquinas(id);


--
-- Name: incidencias incidencias_usuario_reportante_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.incidencias
    ADD CONSTRAINT incidencias_usuario_reportante_id_fkey FOREIGN KEY (usuario_reportante_id) REFERENCES public.usuarios(id);


--
-- Name: movimientos_stock movimientos_stock_repuesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.movimientos_stock
    ADD CONSTRAINT movimientos_stock_repuesto_id_fkey FOREIGN KEY (repuesto_id) REFERENCES public.repuestos(id);


--
-- Name: pedidos_compra pedidos_compra_repuesto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pedidos_compra
    ADD CONSTRAINT pedidos_compra_repuesto_id_fkey FOREIGN KEY (repuesto_id) REFERENCES public.repuestos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict c2dhi3SBTdJlfDhyaNfJ1e9W4NVL17IgzV51nr9b77eYR7zn79DAnoEfMt7WlW9

