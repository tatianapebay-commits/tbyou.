const { Router } = require('express');
const c = require('../controllers/productos.controller');

const router = Router();

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.patch('/:id/stock', c.ajustarStock);
router.delete('/:id', c.eliminar);

module.exports = router;
