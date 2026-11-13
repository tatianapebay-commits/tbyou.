// CONTROLADOR: recibe la petición, valida, llama al modelo y responde.
const Categoria = require('../models/categoria.model');
const { crearError } = require('../middlewares/errores');
const { idValido, requeridos } = require('../helpers/validar');

async function listar(req, res, next) {
  try {
    res.json(await Categoria.listar());
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const categoria = await Categoria.buscarPorId(idValido(req.params.id));
    if (!categoria) throw crearError(404, 'Categoría no encontrada');
    res.json(categoria);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    requeridos(req.body, ['nombre']);
    res.status(201).json(await Categoria.crear(req.body));
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const categoria = await Categoria.actualizar(idValido(req.params.id), req.body);
    if (!categoria) throw crearError(404, 'Categoría no encontrada');
    res.json(categoria);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const categoria = await Categoria.eliminar(idValido(req.params.id));
    if (!categoria) throw crearError(404, 'Categoría no encontrada');
    res.json({ mensaje: 'Categoría eliminada', categoria });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
