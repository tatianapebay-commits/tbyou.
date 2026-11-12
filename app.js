const path = require('path');
const express = require('express');
const session = require('express-session');

const vistasRoutes = require('./routes/vistas.routes');
const categoriasRoutes = require('./routes/categorias.routes');
const proveedoresRoutes = require('./routes/proveedores.routes');
const productosRoutes = require('./routes/productos.routes');
const usuariosRoutes = require('./routes/usuarios.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const checkoutRoutes = require('./routes/checkout.routes');
const adminRoutes = require('./routes/admin.routes');
const { noEncontrado, manejarErrores } = require('./middlewares/errores');

const app = express();

// Vistas (la "V" de MVC) con el motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Lectura de JSON y formularios, y archivos estáticos (CSS, JS, imágenes)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Si una imagen de producto se guardó como .webp, .png o .jpeg en vez de .jpg,
// la busca con esas extensiones (al descargar fotos de internet suelen venir en .webp).
const fs = require('fs');
app.get('/images/productos/:archivo', (req, res, next) => {
  const base = path.parse(req.params.archivo).name;
  const carpeta = path.join(__dirname, 'public', 'images', 'productos');
  for (const ext of ['.jpg', '.jpeg', '.webp', '.png', '.JPG', '.JPEG', '.WEBP', '.PNG']) {
    const archivo = path.join(carpeta, base + ext);
    if (fs.existsSync(archivo)) return res.sendFile(archivo);
  }
  next();
});

// Datos de la tienda disponibles en todas las vistas (número de WhatsApp del menú)
const tienda = require('./config/tienda');
app.use((req, res, next) => {
  res.locals.whatsapp = tienda.whatsapp;
  next();
});

// Sesión: recuerda quién inició sesión en el panel de administración (cookie firmada).
app.use(session({
  secret: process.env.SESSION_SECRET || 'tbyou-cambiar-esta-clave',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 4 }, // 4 horas
}));

// Páginas de la tienda
app.use('/', vistasRoutes);

// Panel de administración (protegido con login)
app.use('/admin', adminRoutes);

// API REST (es lo que se prueba con Postman)
app.use('/api/categorias', categoriasRoutes);
app.use('/api/proveedores', proveedoresRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/checkout', checkoutRoutes);

// Manejo de rutas inexistentes y de errores
app.use(noEncontrado);
app.use(manejarErrores);

module.exports = app;
