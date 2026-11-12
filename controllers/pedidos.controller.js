const Pedido = require('../models/pedido.model');
const { crearError } = require('../middlewares/errores');
const { idValido, requeridos } = require('../helpers/validar');

const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

// GET /api/pedidos?usuario=2&estado=pendiente
async function listar(req, res, next) {
  try {
    const { usuario, estado } = req.query;
    res.json(await Pedido.listar({ usuario: usuario ? idValido(usuario) : undefined, estado }));
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const pedido = await Pedido.buscarPorId(idValido(req.params.id));
    if (!pedido) throw crearError(404, 'Pedido no encontrado');
    res.json(pedido);
  } catch (err) { next(err); }
}

// POST /api/pedidos
// { "usuario_id": 2, "direccion_envio": "...", "items": [{ "producto_id": 1, "cantidad": 2 }] }
async function crear(req, res, next) {
  try {
    requeridos(req.body, ['usuario_id', 'direccion_envio', 'items']);
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw crearError(400, '"items" debe ser una lista con al menos un producto');
    }
    const limpios = items.map((it, i) => {
      const producto_id = Number(it.producto_id);
      const cantidad = Number(it.cantidad);
      if (!Number.isInteger(producto_id) || producto_id <= 0 || !Number.isInteger(cantidad) || cantidad <= 0) {
        throw crearError(400, `El item ${i + 1} necesita producto_id y cantidad enteros positivos`);
      }
      return { producto_id, cantidad };
    });
    const repetidos = new Set(limpios.map((i) => i.producto_id)).size !== limpios.length;
    if (repetidos) throw crearError(400, 'No repitas el mismo producto: sumá las cantidades en un solo item');

    const pedido = await Pedido.crear({
      usuario_id: idValido(req.body.usuario_id),
      direccion_envio: req.body.direccion_envio,
      medio_pago: req.body.medio_pago,
      notas: req.body.notas,
      items: limpios,
    });
    res.status(201).json(pedido);
  } catch (err) { next(err); }
}

// PATCH /api/pedidos/:id/estado  { "estado": "pagado" }
async function cambiarEstado(req, res, next) {
  try {
    const { estado } = req.body;
    if (!ESTADOS.includes(estado)) {
      throw crearError(400, `Estado inválido. Usá uno de: ${ESTADOS.join(', ')}`);
    }
    const pedido = await Pedido.cambiarEstado(idValido(req.params.id), estado);
    if (!pedido) throw crearError(404, 'Pedido no encontrado');
    res.json(pedido);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const pedido = await Pedido.eliminar(idValido(req.params.id));
    if (!pedido) throw crearError(404, 'Pedido no encontrado');
    res.json({ mensaje: 'Pedido eliminado', pedido });
  } catch (err) { next(err); }
}

module.exports = { listar, obtener, crear, cambiarEstado, eliminar };
