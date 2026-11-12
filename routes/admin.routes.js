// Rutas del PANEL DE ADMINISTRACIÓN (/admin).
// Todas, menos el login, pasan primero por soloAdmin: sin sesión de administradora no se entra.
// Los formularios HTML solo envían GET y POST, por eso modificar y borrar usan POST
// con /editar y /eliminar al final (la API, en cambio, usa PUT y DELETE).
const { Router } = require('express');
const { soloAdmin, avisos } = require('../middlewares/auth');
const { subirImagen } = require('../helpers/subirImagen');

const auth = require('../controllers/admin/auth.controller');
const panel = require('../controllers/admin/panel.controller');
const productos = require('../controllers/admin/productos.controller');
const categorias = require('../controllers/admin/categorias.controller');
const proveedores = require('../controllers/admin/proveedores.controller');
const pedidos = require('../controllers/admin/pedidos.controller');

const router = Router();

// Login (sin protección)
router.get('/login', auth.formulario);
router.post('/login', auth.ingresar);

// Desde acá, todo protegido
router.use(soloAdmin, avisos);
router.post('/salir', auth.salir);

router.get('/', panel.inicio);

// Productos
router.get('/productos', productos.listar);
router.get('/productos/nuevo', productos.nuevo);
router.post('/productos/nuevo', subirImagen, productos.crear);
router.get('/productos/:id/editar', productos.editar);
router.post('/productos/:id/editar', subirImagen, productos.actualizar);
router.post('/productos/:id/activo', productos.cambiarActivo);
router.post('/productos/:id/eliminar', productos.eliminar);

// Categorías
router.get('/categorias', categorias.listar);
router.get('/categorias/nueva', categorias.nueva);
router.post('/categorias/nueva', categorias.crear);
router.get('/categorias/:id/editar', categorias.editar);
router.post('/categorias/:id/editar', categorias.actualizar);
router.post('/categorias/:id/eliminar', categorias.eliminar);

// Proveedores
router.get('/proveedores', proveedores.listar);
router.get('/proveedores/nuevo', proveedores.nuevo);
router.post('/proveedores/nuevo', proveedores.crear);
router.get('/proveedores/:id/editar', proveedores.editar);
router.post('/proveedores/:id/editar', proveedores.actualizar);
router.post('/proveedores/:id/eliminar', proveedores.eliminar);

// Pedidos
router.get('/pedidos', pedidos.listar);
router.get('/pedidos/:id', pedidos.ver);
router.post('/pedidos/:id/estado', pedidos.cambiarEstado);
router.post('/pedidos/:id/eliminar', pedidos.eliminar);

module.exports = router;
