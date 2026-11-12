// CONTROLADOR de productos del panel: alta, baja y modificación (ABM).
// Usa el mismo MODELO que la API (models/producto.model.js) y responde con VISTAS EJS.
const Producto = require('../../models/producto.model');
const Categoria = require('../../models/categoria.model');
const Proveedor = require('../../models/proveedor.model');
const { crearError, traducirError } = require('../../middlewares/errores');
const { idValido } = require('../../helpers/validar');
const { avisar } = require('../../middlewares/auth');
const { rutaPublica, borrarSubida, borrarFotoAnterior } = require('../../helpers/subirImagen');

// Mismos valores que permite el CHECK ck_productos_material de database/ddl.sql
const MATERIALES = ['acero quirurgico', 'acero blanco', 'acero dorado', 'bijou', 'cuero sintetico', 'tela', 'otro'];

// Arma el objeto producto a partir de lo que llega del formulario
function leerFormulario(body) {
  const entero = (v) => (v === '' || v === undefined ? NaN : Number(v));
  return {
    nombre: String(body.nombre || '').trim(),
    descripcion: String(body.descripcion || '').trim(),
    material: body.material,
    precio_costo: entero(body.precio_costo),
    precio_venta: entero(body.precio_venta),
    stock: entero(body.stock),
    categoria_id: entero(body.categoria_id),
    proveedor_id: body.proveedor_id ? Number(body.proveedor_id) : null,
    activo: body.activo === 'on',
  };
}

// Validaciones antes de ir a la base (la base igual tiene sus propias reglas)
function validar(p) {
  if (!p.nombre) throw crearError(400, 'El nombre es obligatorio');
  if (!MATERIALES.includes(p.material)) throw crearError(400, 'Elegí un material de la lista');
  if (!(p.precio_costo >= 0)) throw crearError(400, 'El precio de costo tiene que ser un número mayor o igual a 0');
  if (!(p.precio_venta > 0)) throw crearError(400, 'El precio de venta tiene que ser mayor a 0');
  if (p.precio_venta < p.precio_costo) throw crearError(400, 'El precio de venta no puede ser menor al precio de costo');
  if (!Number.isInteger(p.stock) || p.stock < 0) throw crearError(400, 'El stock tiene que ser un número entero mayor o igual a 0');
  if (!Number.isInteger(p.categoria_id)) throw crearError(400, 'Elegí una categoría');
}

// Muestra el formulario (vacío, para editar, o con el error y lo que se había escrito)
async function mostrarFormulario(res, { producto, error = null, status = 200 }) {
  res.status(status).render('admin/producto-form', {
    titulo: producto.id ? 'Editar producto' : 'Nuevo producto',
    seccion: 'productos',
    producto,
    error,
    categorias: await Categoria.listar(),
    proveedores: await Proveedor.listar(),
    MATERIALES,
  });
}

// GET /admin/productos
async function listar(req, res, next) {
  try {
    const buscar = String(req.query.buscar || '').trim();
    const categoria = Number(req.query.categoria) || undefined;
    const productos = await Producto.listar({ incluirInactivos: true, buscar: buscar || undefined, categoria });
    res.render('admin/productos', {
      titulo: 'Productos', seccion: 'productos', productos, buscar, categoria,
      categorias: await Categoria.listar(),
    });
  } catch (err) { next(err); }
}

// GET /admin/productos/nuevo
async function nuevo(req, res, next) {
  try {
    await mostrarFormulario(res, { producto: { activo: true, stock: 0, material: 'acero quirurgico' } });
  } catch (err) { next(err); }
}

// POST /admin/productos/nuevo  (ALTA)
async function crear(req, res, next) {
  const datos = leerFormulario(req.body);
  try {
    if (req.errorImagen) throw crearError(400, req.errorImagen);
    validar(datos);
    const producto = await Producto.crear({ ...datos, imagen_url: rutaPublica(req.file) });
    if (!datos.activo) await Producto.actualizar(producto.id, { activo: false });
    avisar(req, `Se creó el producto "${producto.nombre}"`);
    res.redirect('/admin/productos');
  } catch (err) {
    borrarSubida(req.file);
    const { status, mensaje } = traducirError(err);
    if (status >= 500) return next(err);
    mostrarFormulario(res, { producto: datos, error: mensaje, status }).catch(next);
  }
}

// GET /admin/productos/:id/editar
async function editar(req, res, next) {
  try {
    const producto = await Producto.buscarPorId(idValido(req.params.id));
    if (!producto) throw crearError(404, 'Ese producto no existe');
    await mostrarFormulario(res, { producto });
  } catch (err) { next(err); }
}

// POST /admin/productos/:id/editar  (MODIFICACIÓN)
async function actualizar(req, res, next) {
  const id = Number(req.params.id);
  const datos = { ...leerFormulario(req.body), id };
  try {
    idValido(id);
    if (req.errorImagen) throw crearError(400, req.errorImagen);
    validar(datos);
    const anterior = await Producto.buscarPorId(id);
    const producto = await Producto.editar(id, { ...datos, imagen_url: rutaPublica(req.file) });
    if (!producto) throw crearError(404, 'Ese producto no existe');
    if (req.file) borrarFotoAnterior(anterior.imagen_url); // se reemplazó la foto
    avisar(req, `Se guardaron los cambios de "${producto.nombre}"`);
    res.redirect('/admin/productos');
  } catch (err) {
    borrarSubida(req.file);
    const { status, mensaje } = traducirError(err);
    if (status >= 500 || status === 404) return next(err);
    const actual = await Producto.buscarPorId(id).catch(() => null);
    mostrarFormulario(res, { producto: { ...datos, imagen_url: actual?.imagen_url }, error: mensaje, status }).catch(next);
  }
}

// POST /admin/productos/:id/activo  (mostrar u ocultar en la tienda sin borrarlo)
async function cambiarActivo(req, res, next) {
  try {
    const id = idValido(req.params.id);
    const producto = await Producto.buscarPorId(id);
    if (!producto) throw crearError(404, 'Ese producto no existe');
    await Producto.actualizar(id, { activo: !producto.activo });
    avisar(req, producto.activo
      ? `"${producto.nombre}" quedó oculto: ya no aparece en la tienda`
      : `"${producto.nombre}" vuelve a aparecer en la tienda`);
    res.redirect('/admin/productos');
  } catch (err) { next(err); }
}

// POST /admin/productos/:id/eliminar  (BAJA)
async function eliminar(req, res, next) {
  try {
    const producto = await Producto.eliminar(idValido(req.params.id));
    if (!producto) throw crearError(404, 'Ese producto no existe');
    borrarFotoAnterior(producto.imagen_url);
    avisar(req, `Se eliminó "${producto.nombre}"`);
  } catch (err) {
    if (err.code !== '23503') return next(err);
    // Clave foránea: el producto figura en pedidos, así que la base no deja borrarlo
    avisar(req, 'Ese producto está en pedidos y no se puede borrar. Podés ocultarlo para que no aparezca en la tienda.', 'error');
  }
  res.redirect('/admin/productos');
}

module.exports = { listar, nuevo, crear, editar, actualizar, cambiarActivo, eliminar };
