// Rutas de las páginas que ve el cliente en el navegador.
const { Router } = require('express');
const c = require('../controllers/vistas.controller');

const router = Router();

router.get('/', c.inicio);
router.get('/productos', c.productos);
router.get('/productos/:id', c.detalleProducto);
router.get('/quienes-somos', c.quienesSomos);
router.get('/contacto', c.contacto);
router.get('/carrito', c.carrito);

module.exports = router;
