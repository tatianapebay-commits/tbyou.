# T.B.YOU Accesorios — Tienda online

Proyecto Institucional · 7° año · Orientación en Programación
E.E.S.T. N° 3 "Norberto Piñero" — Tandil

**Alumna:** Tatiana Pebay Vulcano

T.B.YOU Accesorios es un emprendimiento de accesorios unisex de acero quirúrgico, blanco y dorado, que además vende mochilas, billeteras, bolsos y accesorios para el pelo. Este repositorio contiene la **tienda online completa**: el frontend (las páginas), el backend (servidor y API REST) y la base de datos PostgreSQL.

## Tecnologías

- **Node.js + Express**: servidor y rutas.
- **PostgreSQL / Supabase**: base de datos (librería `pg`). Puede estar en Supabase (nube) o en la computadora.
- **EJS**: plantillas para las vistas de la tienda.
- **Nodemailer**: envío del mail con cada pedido.
- **express-session**: sesión del panel de administración.
- **Multer**: subida de fotos de productos desde el panel, con un middleware de seguridad.
- **Arquitectura MVC**: modelos, vistas y controladores separados.
- **Postman**: pruebas de los endpoints.

## Estructura del proyecto

El proyecto está dividido en tres carpetas: **frontend** (lo que ve la clienta), **backend** (el servidor) y **database** (la base de datos).

```
tbyou/
├── frontend/                    # LO QUE SE VE
│   ├── views/                   # V de MVC — páginas EJS
│   │   ├── partials/            # Partes repetidas: head, header, footer, tarjeta, menú del panel
│   │   ├── admin/               # Páginas del panel de administración
│   │   ├── index.ejs, productos.ejs, producto.ejs, carrito.ejs
│   │   └── quienes-somos.ejs, contacto.ejs, error.ejs
│   └── public/                  # Archivos estáticos
│       ├── css/                 # style.css (tienda) y admin.css (panel)
│       └── images/              # logo, banners, categorías y productos/
│
├── backend/                     # EL SERVIDOR (Node.js + Express)
│   ├── index.js                 # ARRANQUE: es el archivo que se ejecuta con "npm start"
│   ├── app.js                   # Configuración de Express (vistas, archivos públicos, rutas)
│   ├── .env                     # Contraseñas y claves (NO se sube a GitHub)
│   ├── .env.example             # Modelo del .env, sin datos reales
│   ├── config/                  # db.js (conexión a PostgreSQL / Supabase) y tienda.js (WhatsApp, mail, pagos)
│   ├── routes/                  # Unen cada URL con su controlador (admin.routes.js = panel)
│   ├── controllers/             # C de MVC — reciben el pedido, validan y responden
│   │   └── admin/               # Panel: login, productos, categorías, proveedores, pedidos
│   ├── models/                  # M de MVC — consultas SQL a cada tabla
│   ├── middlewares/             # Controles que se ejecutan antes de los controladores:
│   │   ├── auth.js              #   protege el panel (solo administradoras con sesión)
│   │   ├── subirImagen.js       #   seguridad en la subida de fotos (bloquea archivos maliciosos)
│   │   └── errores.js           #   manejo de errores y rutas inexistentes (404)
│   ├── helpers/                 # Funciones de ayuda: validar datos, contraseñas, WhatsApp y mail
│   ├── postman/                 # Colección de pruebas de la API
│   └── package.json
│
├── database/                    # LA BASE DE DATOS
│   ├── ddl.sql                  # Crea la base, tablas, claves, relaciones y restricciones (PostgreSQL local)
│   ├── ddl_supabase.sql         # Lo mismo, para ejecutar en Supabase
│   └── dml.sql                  # Inserta los datos iniciales
│
├── .gitignore                   # Lo que no se sube a GitHub (.env, node_modules)
└── README.md
```

**Recorrido de un pedido:** el navegador pide una URL → `routes/` decide qué controlador la atiende → pasa por los **middlewares** (por ejemplo, el login del panel o el control de la foto) → el **controlador** le pide los datos al **modelo** → el **modelo** consulta PostgreSQL → el controlador responde con una **vista** (página del frontend) o con JSON (API).

## Seguridad en la subida de fotos

El middleware `backend/middlewares/subirImagen.js` revisa cada foto que se sube desde el panel antes de guardarla:

1. Una sola foto por vez y como máximo **3 MB**.
2. Solo extensiones **.jpg, .jpeg, .png o .webp**, y tipo de archivo de imagen.
3. Revisa el **contenido real** del archivo (sus primeros bytes, la "firma"): un archivo con el nombre cambiado, por ejemplo un `.php` renombrado a `foto.jpg`, se rechaza.
4. La guarda con un **nombre nuevo** que genera el servidor (`producto-<fecha>-<aleatorio>.jpg`), nunca con el nombre original.

Si la foto no pasa algún control, no se guarda nada y el formulario muestra el motivo.

## Base de datos

| Tabla | Para qué sirve |
|---|---|
| `categorias` | Aros, anillos, collares, mochilas, etc. |
| `proveedores` | Mayoristas donde se compra la mercadería |
| `productos` | Catálogo con costo, precio de venta, stock y material |
| `usuarios` | Clientes y administradores (contraseña encriptada) |
| `pedidos` | Compras de los clientes, con estado, medio de pago y total |
| `pedido_detalle` | Productos de cada pedido (relación muchos a muchos) |

Relaciones:

- Cada producto pertenece a una categoría y, opcionalmente, a un proveedor.
- Cada pedido pertenece a un usuario.
- Cada pedido tiene uno o más productos, que se guardan en `pedido_detalle`.

Restricciones principales:

- El precio de venta no puede ser menor al costo.
- El stock no puede quedar negativo.
- El email de cada usuario es único.
- El estado de un pedido solo puede ser `pendiente`, `pagado`, `enviado`, `entregado` o `cancelado`.

## Cómo ejecutarlo

**Requisitos:** Node.js 18 o superior y una base PostgreSQL: **Supabase** (en la nube) o PostgreSQL 14 o superior instalado en la computadora.

1. **Instalar dependencias** (dentro de la carpeta `backend`)
   ```bash
   cd backend
   npm install
   ```

2. **Crear la base de datos y cargar los datos.** Elegir una de las dos opciones:

   **Opción A — Supabase (en la nube)**
   1. Entrar a [supabase.com](https://supabase.com), crear un proyecto y anotar la contraseña de la base.
   2. Ir a **SQL Editor**, pegar el contenido de `database/ddl_supabase.sql` y tocar **Run**.
   3. En una consulta nueva, pegar `database/dml.sql` y tocar **Run**.
   4. En **Project Settings → Database → Connection string → URI**, copiar la dirección.

   **Opción B — PostgreSQL local**
   ```bash
   psql -U postgres -f ../database/ddl.sql
   psql -U postgres -d tbyou_accesorios -f ../database/dml.sql
   ```
   El DDL borra y vuelve a crear la base `tbyou_accesorios`, así que sirve también para empezar de cero.
   **Antes de ejecutarlo hay que apagar el servidor** (Ctrl + C en la terminal) y cerrar las consultas abiertas en pgAdmin; si no, PostgreSQL avisa que la base "is being accessed by other users".
   También se pueden ejecutar los dos archivos desde pgAdmin, en ese orden.

3. **Configurar la conexión**
   En la carpeta `backend`, copiar `.env.example` como `.env`.
   - Con Supabase: pegar la dirección en `DATABASE_URL` (reemplazando `[YOUR-PASSWORD]` por la contraseña).
   - Con PostgreSQL local: dejar `DATABASE_URL` vacío y completar el usuario y la contraseña.

4. **Iniciar el servidor** (dentro de `backend`)
   ```bash
   npm start          # o npm run dev para que se reinicie solo al guardar cambios
   ```
   La consola tiene que mostrar `Conectado a PostgreSQL`.

5. **Abrir la tienda:** http://localhost:3000

## Endpoints de la API

Base: `http://localhost:3000/api`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categorias` | Lista las categorías con la cantidad de productos |
| GET | `/categorias/:id` | Ver una categoría |
| POST | `/categorias` | Crear categoría |
| PUT | `/categorias/:id` | Modificar categoría |
| DELETE | `/categorias/:id` | Eliminar (solo si no tiene productos) |
| GET | `/proveedores` | Lista los proveedores |
| GET | `/proveedores/:id` | Ver un proveedor |
| POST | `/proveedores` | Crear proveedor |
| PUT | `/proveedores/:id` | Modificar proveedor |
| DELETE | `/proveedores/:id` | Eliminar proveedor |
| GET | `/productos` | Lista productos. Filtros: `?categoria=1`, `?material=acero dorado`, `?buscar=aro` |
| GET | `/productos/:id` | Ver un producto |
| POST | `/productos` | Crear producto |
| PUT | `/productos/:id` | Modificar producto (también `{ "activo": false }` para ocultarlo) |
| PATCH | `/productos/:id/stock` | Sumar o restar stock: `{ "cantidad": 5 }` o `{ "cantidad": -2 }` |
| DELETE | `/productos/:id` | Eliminar (si está en pedidos, hay que desactivarlo) |
| POST | `/usuarios` | Registrar usuario |
| POST | `/usuarios/login` | Iniciar sesión |
| GET | `/usuarios` | Lista usuarios (sin contraseñas) |
| GET | `/usuarios/:id` | Ver un usuario |
| PUT | `/usuarios/:id` | Modificar usuario |
| DELETE | `/usuarios/:id` | Eliminar (solo si no tiene pedidos) |
| GET | `/pedidos` | Lista pedidos. Filtros: `?usuario=2`, `?estado=pendiente` |
| GET | `/pedidos/:id` | Ver pedido con sus productos |
| POST | `/pedidos` | Crear pedido: controla y descuenta stock, calcula el total |
| PATCH | `/pedidos/:id/estado` | Cambiar estado (al cancelar, devuelve el stock) |
| DELETE | `/pedidos/:id` | Eliminar (solo pedidos cancelados) |
| POST | `/checkout` | Compra desde el carrito de la página (ver abajo) |

Ejemplo para crear un pedido:

```json
POST /api/pedidos
{
  "usuario_id": 2,
  "direccion_envio": "Pinto 450, Tandil",
  "items": [
    { "producto_id": 1, "cantidad": 2 },
    { "producto_id": 23, "cantidad": 1 }
  ]
}
```

Crear y cancelar pedidos se hace dentro de una **transacción**: si falla algo, por ejemplo falta stock de un producto, no se guarda nada a medias.

## Carrito de compras

En la tienda, cada producto tiene un botón **Agregar al carrito** y el ícono de la bolsa, arriba a la derecha, muestra cuántos productos hay. El carrito se guarda en el navegador hasta que se confirma la compra. En `/carrito` la clienta:

1. Revisa los productos, cambia cantidades o quita alguno. Los precios y el stock se actualizan desde la base.
2. Completa sus datos (no necesita registrarse) y elige cómo pagar: **transferencia**, **Mercado Pago** o **efectivo** al retirar en el local.
3. Confirma el pedido. Entonces el servidor (`POST /api/checkout`):
   - busca a la clienta por email o la crea;
   - crea el pedido en una transacción: controla y descuenta stock y calcula el total con los precios de la base;
   - envía un **mail** con el detalle del pedido al correo de la tienda;
   - devuelve un **link de WhatsApp** con el pedido ya escrito, para que la clienta lo envíe a la tienda y coordinen el pago y el envío.

Si falta stock de un producto, no se guarda nada: ni la clienta ni el pedido.

Ejemplo:

```json
POST /api/checkout
{
  "cliente": { "nombre": "Julieta", "apellido": "Romero", "email": "julieta@mail.com", "telefono": "2494333333" },
  "direccion_envio": "Av. Colón 1500, Tandil",
  "medio_pago": "transferencia",
  "notas": "Envolver para regalo",
  "items": [ { "producto_id": 21, "cantidad": 2 } ]
}
```

### Configurar WhatsApp, pago y mail

En el archivo `backend/.env` (ver `backend/.env.example`):

| Variable | Qué poner |
|---|---|
| `WHATSAPP_NUMERO` | Número de la tienda en formato internacional, sin `+` ni espacios. Ej.: `5492494123456` |
| `EMAIL_PEDIDOS` | Correo donde llegan los pedidos |
| `ALIAS_TRANSFERENCIA` | Alias o CBU que se muestra al elegir transferencia |
| `LINK_MERCADOPAGO` | Link de pago de Mercado Pago (opcional) |
| `SMTP_USER` / `SMTP_PASS` | Gmail que envía los mails y su **contraseña de aplicación** |

Para la contraseña de aplicación de Gmail: en la cuenta de Google hay que activar la verificación en dos pasos y después ir a **Seguridad → Contraseñas de aplicaciones**. Se genera una clave de 16 letras, que va en `SMTP_PASS`. No es la contraseña común del mail.

Si `SMTP_USER` y `SMTP_PASS` quedan vacíos, la compra funciona igual, pero el mail no se envía: la consola del servidor avisa que el SMTP no está configurado.

## Panel de administración

En **http://localhost:3000/admin** (también hay un enlace "Administración" al pie de la tienda). Hay que iniciar sesión con un usuario de rol `admin`; el DML carga `tbyouaccesorios@gmail.com` / `admin123`. Sin sesión, cualquier dirección `/admin/...` redirige al login.

| Sección | Qué se puede hacer |
|---|---|
| **Panel** | Resumen: productos a la venta, pedidos pendientes, total vendido y productos con stock bajo para reponer |
| **Productos** | Alta (con foto), modificación, ocultar o mostrar en la tienda y baja. Buscar por nombre y filtrar por categoría |
| **Categorías** | Alta, modificación y baja (no deja borrar una categoría que tiene productos) |
| **Proveedores** | Alta, modificación y baja (sus productos quedan sin proveedor) |
| **Pedidos** | Ver los pedidos y su detalle, filtrar por estado, cambiar el estado y borrar los cancelados. Al cancelar, el stock vuelve |

Cómo está armado en MVC: el panel usa **los mismos modelos** que la API y la tienda (`models/`). Lo nuevo son sus controladores (`controllers/admin/`), sus vistas (`views/admin/`), sus rutas (`routes/admin.routes.js`) y el middleware `middlewares/auth.js`, que revisa que haya una administradora con sesión iniciada antes de cada página.

Los formularios HTML solo envían GET y POST, por eso en el panel modificar y borrar se hacen con POST a `/editar` y `/eliminar` (la API usa PUT y DELETE).

Las fotos que se suben desde el panel se guardan en `frontend/public/images/productos/` con un nombre como `producto-1729030000000-a1b2c3d4.jpg`, y su ruta queda en la columna `imagen_url`. Si se reemplaza la foto o se borra el producto, se borra también el archivo.

Si se cambia algo que la base no permite (precio de venta menor al costo, nombre repetido, borrar una categoría con productos), el panel muestra el mensaje y no guarda nada.

En el archivo `backend/.env` conviene completar `SESSION_SECRET` con cualquier frase larga: es la clave con la que se firma la cookie de la sesión.

## Pruebas con Postman

1. En Postman: **Import** → elegir `backend/postman/TBYOU_Accesorios.postman_collection.json`.
2. Con el servidor encendido, abrir la colección y tocar **Run** (Runner) para ejecutar todas las pruebas en orden.

Son 51 pruebas en 6 carpetas, incluida la compra desde el carrito. Cada petición tiene un test que comprueba el código de respuesta. Hay casos que funcionan y casos de error a propósito (precio menor al costo, stock insuficiente, email repetido, etc.). Para comprobar que los datos se guardan en PostgreSQL se pueden consultar las tablas en pgAdmin antes y después de cada prueba.

**Usuarios de prueba** (cargados por el DML):

| Email | Contraseña | Rol |
|---|---|---|
| tbyouaccesorios@gmail.com | admin123 | admin |
| mariana.gomez@mail.com | cliente123 | cliente |
| sofia.martinez@mail.com | cliente456 | cliente |

## Imágenes

La lista de qué foto corresponde a cada producto está en [IMAGENES.md](IMAGENES.md). Las fotos van en `frontend/public/images/productos/` y pueden ser .jpg, .webp o .png. Si falta una, la página muestra una imagen genérica.
