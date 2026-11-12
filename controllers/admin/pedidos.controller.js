// CONTROLADOR de pedidos del panel: ver pedidos, cambiar su estado y borrar los cancelados.
// Los pedidos los crean las clientas desde el carrito, por eso acá no hay "alta".
const Pedido = require('../../models/pedido.model');
const { crearError, traducirError } = require('../../middlewares/errores');
const { idValido } = require('../../helpers/validar');
const { avisar } = require('../../middlewares/auth');

// Mismos valores que permite el CHECK ck_pedidos_estado de database/ddl.sql
const ESTADOS = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

// GET /admin/pedidos
async function listar(req, res, next) {
  try {
    const estado = ESTADOS.includes(req.query.estado) ? req.query.estado : '';
    const pedidos = (await Pedido.listar({ estado: estado || undefined })).reverse(); // más nuevos primero
    res.render('admin/pedidos', { titulo: 'Pedidos', seccion: 'pedidos', pedidos, estado, ESTADOS });
  } catch (err) { next(err); }
}

// GET /admin/pedidos/:id
async function ver(req, res, next) {
  try {
    const pedido = await Pedido.buscarPorId(idValido(req.params.id));
    if (!pedido) throw crearError(404, 'Ese pedido no existe');
    res.render('admin/pedido', { titulo: `Pedido #${pedido.id}`, seccion: 'pedidos', pedido, ESTADOS });
  } catch (err) { next(err); }
}

// POST /admin/pedidos/:id/estado  (MODIFICACIÓN del estado)
async function cambiarEstado(req, res, next) {
  const id = Number(req.params.id);
  try {
    idValido(id);
    if (!ESTADOS.includes(req.body.estado)) throw crearError(400, 'Estado inválido');
    const pedido = await Pedido.cambiarEstado(id, req.body.estado);
    if (!pedido) throw crearError(404, 'Ese pedido no existe');
    avisar(req, req.body.estado === 'cancelado'
      ? `Pedido #${id} cancelado. Se devolvió el stock de sus productos.`
      : `Pedido #${id} marcado como "${req.body.estado}"`);
  } catch (err) {
    const { status, mensaje } = traducirError(err);
    if (status >= 500 || status === 404) return next(err);
    avisar(req, mensaje, 'error');
  }
  res.redirect(`/admin/pedidos/${id}`);
}

// POST /admin/pedidos/:id/eliminar  (BAJA: solo pedidos cancelados)
async function eliminar(req, res, next) {
  const id = Number(req.params.id);
  try {
    idValido(id);
    const pedido = await Pedido.eliminar(id);
    if (!pedido) throw crearError(404, 'Ese pedido no existe');
    avisar(req, `Se eliminó el pedido #${id}`);
    res.redirect('/admin/pedidos');
  } catch (err) {
    const { status, mensaje } = traducirError(err);
    if (status >= 500 || status === 404) return next(err);
    avisar(req, mensaje, 'error');
    res.redirect(`/admin/pedidos/${id}`);
  }
}

module.exports = { listar, ver, cambiarEstado, eliminar };
