const Producto = require('../models/producto.model');
const { crearError } = require('../middlewares/errores');
const { idValido, requeridos, numero } = require('../helpers/validar');

// GET /api/productos?categoria=1&material=acero%20dorado&buscar=aro&todos=true
async function listar(req, res, next) {
  try {
    const { categoria, material, buscar, todos } = req.query;
    const productos = await Producto.listar({
      categoria: categoria ? idValido(categoria) : undefined,
      material,
      buscar,
      incluirInactivos: todos === 'true',
    });
    res.json(productos);
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const producto = await Producto.buscarPorId(idValido(req.params.id));
    if (!producto) throw crearError(404, 'Producto no encontrado');
    res.json(producto);
  } catch (err) { next(err); }
}

async function crear(req, res, next) {
  try {
    requeridos(req.body, ['nombre', 'precio_costo', 'precio_venta', 'categoria_id']);
    numero(req.body, 'precio_costo');
    numero(req.body, 'precio_venta', 1);
    numero(req.body, 'stock');
    res.status(201).json(await Producto.crear(req.body));
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    numero(req.body, 'precio_costo');
    numero(req.body, 'precio_venta', 1);
    numero(req.body, 'stock');
    const producto = await Producto.actualizar(idValido(req.params.id), req.body);
    if (!producto) throw crearError(404, 'Producto no encontrado');
    res.json(producto);
  } catch (err) { next(err); }
}

// PATCH /api/productos/:id/stock  { "cantidad": 10 }  (negativo para restar)
async function ajustarStock(req, res, next) {
  try {
    const cantidad = Number(req.body.cantidad);
    if (!Number.isInteger(cantidad) || cantidad === 0) {
      throw crearError(400, '"cantidad" debe ser un entero distinto de 0 (positivo suma, negativo resta)');
    }
    const producto = await Producto.ajustarStock(idValido(req.params.id), cantidad);
    if (!producto) throw crearError(404, 'Producto no encontrado');
    res.json(producto);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const producto = await Producto.eliminar(idValido(req.params.id));
    if (!producto) throw crearError(404, 'Producto no encontrado');
    res.json({ mensaje: 'Producto eliminado', producto });
  } catch (err) {
    if (err.code === '23503') {
      return next(crearError(409, 'El producto está en pedidos y no se puede borrar. Desactivalo con PUT { "activo": false }'));
    }
    next(err);
  }
}

module.exports = { listar, obtener, crear, actualizar, ajustarStock, eliminar };
