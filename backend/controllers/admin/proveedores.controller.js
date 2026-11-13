// CONTROLADOR de proveedores del panel: alta, baja y modificación.
const Proveedor = require('../../models/proveedor.model');
const { crearError, traducirError } = require('../../middlewares/errores');
const { idValido } = require('../../helpers/validar');
const { avisar } = require('../../middlewares/auth');

function leerFormulario(body) {
  return {
    nombre: String(body.nombre || '').trim(),
    sitio_web: String(body.sitio_web || '').trim(),
    telefono: String(body.telefono || '').trim(),
    compra_minima: body.compra_minima === '' || body.compra_minima === undefined ? 0 : Number(body.compra_minima),
  };
}

function validar(p) {
  if (!p.nombre) throw crearError(400, 'El nombre es obligatorio');
  if (!(p.compra_minima >= 0)) throw crearError(400, 'La compra mínima tiene que ser un número mayor o igual a 0');
}

function mostrarFormulario(res, { proveedor, error = null, status = 200 }) {
  res.status(status).render('admin/proveedor-form', {
    titulo: proveedor.id ? 'Editar proveedor' : 'Nuevo proveedor', seccion: 'proveedores', proveedor, error,
  });
}

// GET /admin/proveedores
async function listar(req, res, next) {
  try {
    res.render('admin/proveedores', { titulo: 'Proveedores', seccion: 'proveedores', proveedores: await Proveedor.listar() });
  } catch (err) { next(err); }
}

// GET /admin/proveedores/nuevo
function nuevo(req, res) {
  mostrarFormulario(res, { proveedor: { compra_minima: 0 } });
}

// POST /admin/proveedores/nuevo  (ALTA)
async function crear(req, res, next) {
  const datos = leerFormulario(req.body);
  try {
    validar(datos);
    const proveedor = await Proveedor.crear(datos);
    avisar(req, `Se creó el proveedor "${proveedor.nombre}"`);
    res.redirect('/admin/proveedores');
  } catch (err) {
    const { status, mensaje } = traducirError(err);
    if (status >= 500) return next(err);
    mostrarFormulario(res, { proveedor: datos, error: mensaje, status });
  }
}

// GET /admin/proveedores/:id/editar
async function editar(req, res, next) {
  try {
    const proveedor = await Proveedor.buscarPorId(idValido(req.params.id));
    if (!proveedor) throw crearError(404, 'Ese proveedor no existe');
    mostrarFormulario(res, { proveedor });
  } catch (err) { next(err); }
}

// POST /admin/proveedores/:id/editar  (MODIFICACIÓN)
async function actualizar(req, res, next) {
  const id = Number(req.params.id);
  const datos = { ...leerFormulario(req.body), id };
  try {
    idValido(id);
    validar(datos);
    const proveedor = await Proveedor.actualizar(id, datos);
    if (!proveedor) throw crearError(404, 'Ese proveedor no existe');
    avisar(req, `Se guardaron los cambios de "${proveedor.nombre}"`);
    res.redirect('/admin/proveedores');
  } catch (err) {
    const { status, mensaje } = traducirError(err);
    if (status >= 500 || status === 404) return next(err);
    mostrarFormulario(res, { proveedor: datos, error: mensaje, status });
  }
}

// POST /admin/proveedores/:id/eliminar  (BAJA)
// Los productos de ese proveedor no se borran: quedan sin proveedor (ON DELETE SET NULL).
async function eliminar(req, res, next) {
  try {
    const proveedor = await Proveedor.eliminar(idValido(req.params.id));
    if (!proveedor) throw crearError(404, 'Ese proveedor no existe');
    avisar(req, `Se eliminó el proveedor "${proveedor.nombre}". Sus productos quedaron sin proveedor.`);
    res.redirect('/admin/proveedores');
  } catch (err) { next(err); }
}

module.exports = { listar, nuevo, crear, editar, actualizar, eliminar };
