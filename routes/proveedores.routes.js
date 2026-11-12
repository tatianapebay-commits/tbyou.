const { Router } = require('express');
const c = require('../controllers/proveedores.controller');

const router = Router();

router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
router.delete('/:id', c.eliminar);

module.exports = router;
