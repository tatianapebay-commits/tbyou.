// CONTROLADOR de las páginas (vistas EJS). Usa los mismos modelos que la API.
const Categoria = require('../models/categoria.model');
const Producto = require('../models/producto.model');
const { crearError } = require('../middlewares/errores');

async function inicio(req, res, next) {
  try {
    const categorias = await Categoria.listar();
    const destacados = (await Producto.listar()).filter((p) => p.stock > 0).slice(0, 8);
    res.render('index', { titulo: 'Inicio', categorias, destacados });
  } catch (err) { next(err); }
}

async function productos(req, res, next) {
  try {
    const categoriaId = req.query.categoria ? Number(req.query.categoria) : undefined;
    const buscar = req.query.buscar || '';
    const categorias = await Categoria.listar();
    const lista = await Producto.listar({
      categoria: Number.isInteger(categoriaId) && categoriaId > 0 ? categoriaId : undefined,
      buscar: buscar || undefined,
    });
    const actual = categorias.find((c) => c.id === categoriaId);
    res.render('productos', {
      titulo: actual ? actual.nombre : 'Productos',
      categorias,
      productos: lista,
      categoriaId,
      buscar,
    });
  } catch (err) { next(err); }
}

async function detalleProducto(req, res, next) {
  try {
    const id = Number(req.params.id);
    const producto = Number.isInteger(id) && id > 0 ? await Producto.buscarPorId(id) : null;
    if (!producto || !producto.activo) throw crearError(404, 'Ese producto no existe');
    res.render('producto', { titulo: producto.nombre, producto });
  } catch (err) { next(err); }
}

function quienesSomos(req, res) {
  res.render('quienes-somos', { titulo: 'Quiénes somos' });
}

function contacto(req, res) {
  res.render('contacto', { titulo: 'Contacto' });
}

function carrito(req, res) {
  res.render('carrito', { titulo: 'Mi carrito' });
}

module.exports = { inicio, productos, detalleProducto, quienesSomos, contacto, carrito };
