-- =============================================================
--  T.B.YOU ACCESORIOS - DDL (estructura de la base de datos)
--  Motor: PostgreSQL
--  Uso:   psql -U postgres -f database/ddl.sql
-- =============================================================

-- Los archivos están en UTF-8 (para que los acentos y la ñ se guarden bien en Windows)
SET client_encoding = 'UTF8';

-- Crear la base (si ya existe, se borra y se vuelve a crear)
DROP DATABASE IF EXISTS tbyou_accesorios;
CREATE DATABASE tbyou_accesorios WITH ENCODING 'UTF8' TEMPLATE template0;

\c tbyou_accesorios
SET client_encoding = 'UTF8';

-- -------------------------------------------------------------
-- CATEGORÍAS: aros, anillos, collares, mochilas, etc.
-- -------------------------------------------------------------
CREATE TABLE categorias (
    id          SERIAL       PRIMARY KEY,
    nombre      VARCHAR(60)  NOT NULL,
    descripcion VARCHAR(255),
    CONSTRAINT uq_categorias_nombre UNIQUE (nombre)
);

-- -------------------------------------------------------------
-- PROVEEDORES: mayoristas donde se compra la mercadería
-- -------------------------------------------------------------
CREATE TABLE proveedores (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(80)   NOT NULL,
    sitio_web      VARCHAR(200),
    telefono       VARCHAR(30),
    compra_minima  NUMERIC(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT uq_proveedores_nombre UNIQUE (nombre),
    CONSTRAINT ck_proveedores_compra_minima CHECK (compra_minima >= 0)
);

-- -------------------------------------------------------------
-- PRODUCTOS
-- -------------------------------------------------------------
CREATE TABLE productos (
    id            SERIAL        PRIMARY KEY,
    nombre        VARCHAR(120)  NOT NULL,
    descripcion   VARCHAR(500),
    material      VARCHAR(30)   NOT NULL DEFAULT 'otro',
    precio_costo  NUMERIC(12,2) NOT NULL,
    precio_venta  NUMERIC(12,2) NOT NULL,
    stock         INTEGER       NOT NULL DEFAULT 0,
    imagen_url    VARCHAR(255),
    activo        BOOLEAN       NOT NULL DEFAULT TRUE,
    categoria_id  INTEGER       NOT NULL,
    proveedor_id  INTEGER,
    creado_en     TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_productos_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_productos_proveedor FOREIGN KEY (proveedor_id)
        REFERENCES proveedores (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT ck_productos_material CHECK (material IN
        ('acero quirurgico', 'acero blanco', 'acero dorado', 'bijou', 'cuero sintetico', 'tela', 'otro')),
    CONSTRAINT ck_productos_precio_costo CHECK (precio_costo >= 0),
    CONSTRAINT ck_productos_precio_venta CHECK (precio_venta > 0),
    CONSTRAINT ck_productos_ganancia CHECK (precio_venta >= precio_costo),
    CONSTRAINT ck_productos_stock CHECK (stock >= 0)
);

CREATE INDEX ix_productos_categoria ON productos (categoria_id);

-- -------------------------------------------------------------
-- USUARIOS: clientes de la tienda y administradores
-- -------------------------------------------------------------
CREATE TABLE usuarios (
    id             SERIAL        PRIMARY KEY,
    nombre         VARCHAR(80)   NOT NULL,
    apellido       VARCHAR(80)   NOT NULL,
    email          VARCHAR(120)  NOT NULL,
    password_hash  VARCHAR(200)  NOT NULL,
    telefono       VARCHAR(30),
    rol            VARCHAR(10)   NOT NULL DEFAULT 'cliente',
    creado_en      TIMESTAMP     NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_usuarios_email UNIQUE (email),
    CONSTRAINT ck_usuarios_rol CHECK (rol IN ('admin', 'cliente')),
    CONSTRAINT ck_usuarios_email CHECK (email LIKE '%_@_%._%')
);

-- -------------------------------------------------------------
-- PEDIDOS: compras realizadas por los clientes
-- -------------------------------------------------------------
CREATE TABLE pedidos (
    id               SERIAL        PRIMARY KEY,
    usuario_id       INTEGER       NOT NULL,
    fecha            TIMESTAMP     NOT NULL DEFAULT NOW(),
    estado           VARCHAR(15)   NOT NULL DEFAULT 'pendiente',
    direccion_envio  VARCHAR(200)  NOT NULL,
    medio_pago       VARCHAR(20)   NOT NULL DEFAULT 'transferencia',
    notas            VARCHAR(300),
    total            NUMERIC(12,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT ck_pedidos_estado CHECK (estado IN
        ('pendiente', 'pagado', 'enviado', 'entregado', 'cancelado')),
    CONSTRAINT ck_pedidos_medio_pago CHECK (medio_pago IN
        ('transferencia', 'mercadopago', 'efectivo')),
    CONSTRAINT ck_pedidos_total CHECK (total >= 0)
);

CREATE INDEX ix_pedidos_usuario ON pedidos (usuario_id);

-- -------------------------------------------------------------
-- DETALLE DE PEDIDO: qué productos lleva cada pedido
-- (relación muchos a muchos entre pedidos y productos)
-- -------------------------------------------------------------
CREATE TABLE pedido_detalle (
    id               SERIAL        PRIMARY KEY,
    pedido_id        INTEGER       NOT NULL,
    producto_id      INTEGER       NOT NULL,
    cantidad         INTEGER       NOT NULL,
    precio_unitario  NUMERIC(12,2) NOT NULL,
    CONSTRAINT fk_detalle_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedidos (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id)
        REFERENCES productos (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uq_detalle_pedido_producto UNIQUE (pedido_id, producto_id),
    CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0),
    CONSTRAINT ck_detalle_precio CHECK (precio_unitario > 0)
);
