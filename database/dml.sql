-- =============================================================
--  T.B.YOU ACCESORIOS - DML (datos iniciales)
--  Ejecutar DESPUÉS de ddl.sql:
--  psql -U postgres -d tbyou_accesorios -f database/dml.sql
-- =============================================================

-- Los archivos están en UTF-8 (para que los acentos y la ñ se guarden bien en Windows)
SET client_encoding = 'UTF8';

-- -------------------------------------------------------------
-- CATEGORÍAS
-- -------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
('Aros',                    'Aros, argollas, abridores y miniaturas'),
('Anillos',                 'Anillos finos, midi y regulables'),
('Collares y cadenas',      'Collares, cadenas y chokers'),
('Pulseras y esclavas',     'Pulseras, esclavas y brazaletes'),
('Cintos',                  'Cintos de moda y elastizados'),
('Accesorios para el pelo', 'Hebillas, broches, invisibles y scrunchies'),
('Billeteras',              'Billeteras y tarjeteros'),
('Mochilas',                'Mochilas urbanas, deportivas e infantiles'),
('Bolsos y carteras',       'Bolsos, carteras y bandoleras'),
('Fiestas',                 'Accesorios para eventos y fiestas'),
('Otros accesorios',        'Abanicos, perforadoras y otros');

-- -------------------------------------------------------------
-- PROVEEDORES (mayoristas)
-- -------------------------------------------------------------
INSERT INTO proveedores (nombre, sitio_web, telefono, compra_minima) VALUES
('She''s Accesorios', 'https://shesaccesorio.com.ar/',    '1170652954',    100000),
('Acero Blanco',      'https://www.aceroblanco.com.ar/',  '5491169119196',  80000),
('De la India',       'https://www.delaindia.com.ar/',    '5492995379898',  60000),
('MayoristaJoyas',    NULL,                               NULL,                  0);

-- -------------------------------------------------------------
-- PRODUCTOS (costos y precios reales de la planilla de accesorios
-- y de los mayoristas, octubre 2026)
-- -------------------------------------------------------------
INSERT INTO productos (nombre, descripcion, material, precio_costo, precio_venta, stock, imagen_url, categoria_id, proveedor_id) VALUES
-- Aros (1)
('Aros tres gotas',                 'Aros colgantes de tres gotas',                  'acero quirurgico', 1200.00,  3000.00, 12, '/images/productos/aros-tres-gotas.jpg',  1, 2),
('Aros corazón BA2678',             'Aros con forma de corazón',                     'acero blanco',     2500.00,  5000.00,  8, '/images/productos/aros-corazon.jpg',     1, 2),
('Aros estrellitas doradas DA1730', 'Aros con estrellitas colgantes',                'acero dorado',     2250.00,  5000.00,  6, '/images/productos/aros-estrellas.jpg',   1, 2),
('Argolla corazón negro BA4190',    'Argolla con dije de corazón negro',             'acero blanco',     4000.00,  6900.00,  5, '/images/productos/argolla-corazon.jpg',  1, 2),
('Aros perlas grandes',             'Aros abridores con perla',                      'acero quirurgico', 1230.51,  2500.00, 20, '/images/productos/aros-perlas.jpg',      1, 3),
('Set de argollas doradas',         'Set de argollas finas en distintos tamaños',    'acero dorado',      584.00,  2500.00, 30, '/images/productos/set-argollas.jpg',     1, 1),
-- Anillos (2)
('Anillo Mamba',                    'Anillo tipo víbora',                            'acero blanco',     2309.00,  3500.00, 10, '/images/productos/anillo-mamba.jpg',     2, 3),
('Anillo regulable Estelar',        'Anillo regulable con estrellas',                'acero blanco',     3019.00,  3500.00,  7, '/images/productos/anillo-estelar.jpg',   2, 3),
('Anillo midi alita',               'Anillo midi con alita',                         'acero blanco',      649.00,  2000.00, 15, '/images/productos/anillo-alita.jpg',     2, 3),
('Anillo ojo turco',                'Anillo plateado con ojo turco',                 'acero quirurgico', 1500.00,  2500.00, 12, '/images/productos/anillo-ojo-turco.jpg', 2, 1),
-- Collares y cadenas (3)
('Collar doble BCO2465',            'Collar de doble cadena',                        'acero blanco',     6500.00, 12500.00,  3, '/images/productos/collar-doble.jpg',     3, 2),
('Collar trébol azul',              'Collar con dije de trébol',                     'acero dorado',     2700.00,  6000.00,  9, '/images/productos/collar-trebol.jpg',    3, 3),
('Cadena víbora 45 cm',             'Cadena tipo víbora de 4 mm',                    'acero blanco',     2250.00,  5000.00, 10, '/images/productos/cadena-vibora.jpg',    3, 2),
('Choker de soguita',               'Choker de soguita con dije',                    'bijou',            1666.00,  2500.00, 14, '/images/productos/choker.jpg',           3, 2),
-- Pulseras y esclavas (4)
('Pulsera flores BP1221',           'Pulsera con flores',                            'acero blanco',     4000.00,  8000.00,  6, '/images/productos/pulsera-flores.jpg',   4, 2),
('Pulsera charms con dije',         'Pulsera de charms intercambiables',             'acero quirurgico', 5500.00,  7000.00,  5, '/images/productos/pulsera-charms.jpg',   4, 2),
('Esclava corazón',                 'Esclava rígida con corazón',                    'acero quirurgico', 3800.00,  5500.00,  8, '/images/productos/esclava-corazon.jpg',  4, 1),
('Pulsera trébol',                  'Pulsera con tréboles',                          'acero quirurgico', 2500.00,  4000.00, 12, '/images/productos/pulsera-trebol.jpg',   4, 1),
-- Cintos (5)
('Cinto dorado corazones',          'Cinto con hebilla de corazones',                'cuero sintetico',  3750.00,  9500.00,  4, '/images/productos/cinto-corazones.jpg',  5, 1),
('Cinto negro con tachas',          'Cinto de 90 cm con tachas',                     'cuero sintetico',  1500.00,  2500.00,  6, '/images/productos/cinto-tachas.jpg',     5, 1),
-- Accesorios para el pelo (6)
('Hebilla Eyebrow',                 'Hebilla metálica dorada o plateada',            'bijou',            3039.00,  6000.00, 10, '/images/productos/hebilla-eyebrow.jpg',  6, 3),
('Broche seguidilla corazón',       'Broche grande con corazones',                   'bijou',            5189.00,  9500.00,  6, '/images/productos/broche-corazon.jpg',   6, 3),
('Scrunchie',                       'Colita de tela tipo scrunchie',                 'tela',             2416.67,  4500.00, 24, '/images/productos/scrunchie.jpg',        6, 2),
('Broche hawaiano',                 'Broche tipo pinza hawaiano',                    'bijou',            1100.00,  2500.00, 20, '/images/productos/broche-hawaiano.jpg',  6, 2),
-- Billeteras (7)
('Billetera XU 205',                'Billetera mediana',                             'cuero sintetico',  3600.00,  7500.00,  8, '/images/productos/billetera-xu205.jpg',  7, 1),
('Billetera tarjetero fashion',     'Billetera tarjetero en varios colores',         'cuero sintetico',  6600.00, 12500.00,  6, '/images/productos/billetera-tarjetero.jpg', 7, 1),
('Billetera larga Tría',            'Billetera larga con cierre',                    'cuero sintetico',  9999.00, 18000.00,  4, '/images/productos/billetera-tria.jpg',   7, 3),
-- Mochilas (8)
('Mochila Fashion 891',             'Mochila urbana',                                'tela',            17000.00, 30000.00,  4, '/images/productos/mochila-fashion.jpg',  8, 1),
('Mochila Sport WK 3010',           'Mochila deportiva',                             'tela',            22000.00, 38000.00,  3, '/images/productos/mochila-sport.jpg',    8, 1),
('Mochila Oso infantil',            'Mochila infantil con forma de oso',             'tela',             7200.00, 14000.00,  5, '/images/productos/mochila-oso.jpg',      8, 1),
-- Bolsos y carteras (9)
('Bolso Celina',                    'Bolso de mano en varios colores',               'cuero sintetico', 23919.00, 42000.00,  3, '/images/productos/bolso-celina.jpg',     9, 3),
('Bandolera gamuza',                'Bandolera de gamuza',                           'otro',            33619.00, 58000.00,  2, '/images/productos/bandolera-gamuza.jpg', 9, 3),
('Cartera',                         'Cartera marrón, rosa viejo o negra',            'cuero sintetico', 18500.00, 33000.00,  3, '/images/productos/cartera.jpg',          9, 1),
-- Fiestas (10)
('Aros colgantes de strass',        'Aros largos con strass para fiesta',            'acero dorado',     2990.00,  4500.00,  8, '/images/productos/aros-strass.jpg',      10, 2),
-- Otros accesorios (11)
('Abanico AB50',                    'Abanico de tela',                               'otro',             6500.00,  8000.00,  4, '/images/productos/abanico.jpg',          11, 2),
('Perforadora descartable',         'Perforadora de oreja descartable con abridor',  'acero quirurgico',  700.00,  1500.00, 10, '/images/productos/perforadora.jpg',      11, 3);

-- -------------------------------------------------------------
-- USUARIOS
-- Contraseñas de prueba: admin123 / cliente123 / cliente456
-- (se guardan encriptadas con scrypt, formato sal:hash)
-- -------------------------------------------------------------
INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol) VALUES
('Tatiana', 'Pebay Vulcano', 'tbyouaccesorios@gmail.com',
 '215656cb6a7a61b4530f607ab1bac139:1ad626b1eccaf40d902f5daa9743d96704b5e953692b9a76dd2496500ac293b216f93912ac5b9ba523103428c18097850fbdff41a1ad6ae03fa11d5b9457fba7',
 NULL, 'admin'),
('Mariana', 'Gómez', 'mariana.gomez@mail.com',
 '88d68757829942298b287aca62c6ee4e:494d5cad916a51dc939ac8c06a85232643bc439e5ca6efb70eb7adb5fbb4153feb1ba056815b283b51800f7d8214c9b6f8a1432d4157a0f124dd62893d01b06d',
 '2494000001', 'cliente'),
('Sofía', 'Martínez', 'sofia.martinez@mail.com',
 '84d4034e7f71c20657f6e405365688b5:845c0284506bc65b3b4ae748fecf2d070daffab45c46b561cc91ace48ce8a214818b58493c7f6339cfccddda3b6dbb426b9ffa524415d0d85a1f1ac169914ffa',
 '2494000002', 'cliente');

-- -------------------------------------------------------------
-- PEDIDOS DE EJEMPLO
-- -------------------------------------------------------------
INSERT INTO pedidos (usuario_id, estado, direccion_envio, medio_pago, notas) VALUES
(2, 'entregado', 'Pinto 450, Tandil',     'efectivo',      'Retira en el local'),
(3, 'pendiente', 'Belgrano 1020, Tandil', 'transferencia', NULL);

INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario) VALUES
(1, 2,  1,  5000.00),   -- Aros corazón
(1, 23, 2,  4500.00),   -- Scrunchie x2
(2, 28, 1, 30000.00),   -- Mochila Fashion
(2, 12, 1,  6000.00);   -- Collar trébol

-- -------------------------------------------------------------
-- MODIFICACIONES (UPDATE)
-- -------------------------------------------------------------
-- Calcular el total de cada pedido a partir de su detalle
UPDATE pedidos p
SET total = (SELECT COALESCE(SUM(d.cantidad * d.precio_unitario), 0)
             FROM pedido_detalle d
             WHERE d.pedido_id = p.id);

-- Descontar del stock lo vendido en los pedidos que no están cancelados
UPDATE productos pr
SET stock = pr.stock - v.vendido
FROM (SELECT d.producto_id, SUM(d.cantidad) AS vendido
      FROM pedido_detalle d
      JOIN pedidos p ON p.id = d.pedido_id
      WHERE p.estado <> 'cancelado'
      GROUP BY d.producto_id) v
WHERE pr.id = v.producto_id;

-- Ajuste de precio: los aros de fiesta suben 10 %
UPDATE productos
SET precio_venta = ROUND(precio_venta * 1.10, 2)
WHERE categoria_id = (SELECT id FROM categorias WHERE nombre = 'Fiestas');
