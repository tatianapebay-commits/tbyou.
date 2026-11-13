const { Router } = require('express');
const c = require('../controllers/checkout.controller');

const router = Router();

router.post('/', c.confirmar);

module.exports = router;
