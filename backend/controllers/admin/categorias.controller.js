// CONTROLADOR de categorías del panel: alta, baja y modificación.
const Categoria = require('../../models/categoria.model');
const { crearError, traducirError } = require('../../middlewares/errores');
const { idValido } = require('../../helpers/validar');
const { avisar } = require('../../middlewares/auth');

function leerFormulario(body) {
  return { nombre: String(body.nombre || '').trim(), descripcion: String(body.descripcion || '').trim() };
}

function mostrarFormulario(res, { categoria, error = null, status = 200 }) {
  res.status(status).render('admin/categoria-form', {
    titulo: categoria.id ? 'Editar categoría' : 'Nueva categoría', seccion: 'categorias', categoria, error,
  });
}

// Mensaje claro para el nombre repetido (restricción UNIQUE de la tabla)
function mensajeDe(err) {
  if (err.code === '23505') return 'Ya existe una categoría con ese nombre';
  return traducirError(err).mensaje;
}

// GET /admin/categorias
async function listar(req, res, next) {
  try {
    res.render('admin/categorias', { titulo: 'Categorías', seccion: 'categorias', categorias: await Categoria.listar() });
  } catch (err) { next(err); }
}

// GET /admin/categorias/nueva
function nueva(req, res) {
  mostrarFormulario(res, { categoria: {} });
}

// POST /admin/categorias/nueva  (ALTA)
async function crear(req, res, next) {
  const datos = leerFormulario(req.body);
  try {
    if (!datos.nombre) throw crearError(400, 'El nombre es obligatorio');
    const categoria = await Categoria.crear(datos);
    avisar(req, `Se creó la categoría "${categoria.nombre}"`);
    res.redirect('/admin/categorias');
  } catch (err) {
    if (traducirError(err).status >= 500) return next(err);
    mostrarFormulario(res, { categoria: datos, error: mensajeDe(err), status: 400 });
  }
}

// GET /admin/categorias/:id/editar
async function editar(req, res, next) {
  try {
    const categoria = await Categoria.buscarPorId(idValido(req.params.id));
    if (!categoria) throw crearError(404, 'Esa categoría no existe');
    mostrarFormulario(res, { categoria });
  } catch (err) { next(err); }
}

// POST /admin/categorias/:id/editar  (MODIFICACIÓN)
async function actualizar(req, res, next) {
  const id = Number(req.params.id);
  const datos = { ...leerFormulario(req.body), id };
  try {
    idValido(id);
    if (!datos.nombre) throw crearError(400, 'El nombre es obligatorio');
    const categoria = await Categoria.actualizar(id, datos);
    if (!categoria) throw crearError(404, 'Esa categoría no existe');
    avisar(req, `Se guardaron los cambios de "${categoria.nombre}"`);
    res.redirect('/admin/categorias');
  } catch (err) {
    const { status } = traducirError(err);
    if (status >= 500 || status === 404) return next(err);
    mostrarFormulario(res, { categoria: datos, error: mensajeDe(err), status: 400 });
  }
}

// POST /admin/categorias/:id/eliminar  (BAJA)
async function eliminar(req, res, next) {
  try {
    const categoria = await Categoria.eliminar(idValido(req.params.id));
    if (!categoria) throw crearError(404, 'Esa categoría no existe');
    avisar(req, `Se eliminó la categoría "${categoria.nombre}"`);
  } catch (err) {
    if (err.code !== '23503') return next(err);
    // ON DELETE RESTRICT: no se puede borrar una categoría que tiene productos
    avisar(req, 'Esa categoría tiene productos (aunque estén ocultos). Primero cambialos de categoría o borralos.', 'error');
  }
  res.redirect('/admin/categorias');
}

module.exports = { listar, nueva, crear, editar, actualizar, eliminar };
