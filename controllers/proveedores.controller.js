const Proveedor = require('../models/proveedor.model');
const { crearError } = require('../middlewares/errores');
const { idValido, requeridos, numero } = require('../helpers/validar');

async function listar(req, res, next) {
  try {
    res.json(await Proveedor.listar());
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const proveedor = await Proveedor.buscarPorId(idValido(req.params.id));
    if (!proveedor) throw crearError(404, 'Proveedor no encontrado');
    res.json(proveedor);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    requeridos(req.body, ['nombre']);
    numero(req.body, 'compra_minima');
    res.status(201).json(await Proveedor.crear(req.body));
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    numero(req.body, 'compra_minima');
    const proveedor = await Proveedor.actualizar(idValido(req.params.id), req.body);
    if (!proveedor) throw crearError(404, 'Proveedor no encontrado');
    res.json(proveedor);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const proveedor = await Proveedor.eliminar(idValido(req.params.id));
    if (!proveedor) throw crearError(404, 'Proveedor no encontrado');
    res.json({ mensaje: 'Proveedor eliminado', proveedor });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
