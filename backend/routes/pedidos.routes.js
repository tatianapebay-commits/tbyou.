const { Router } = require('express');
const c = require('../controllers/pedidos.controller');

const router = Router();

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.patch('/:id/estado', c.cambiarEstado);
router.delete('/:id', c.eliminar);

module.exports = router;
