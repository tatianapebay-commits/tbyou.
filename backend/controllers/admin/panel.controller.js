// CONTROLADOR de la página principal del panel (resumen del negocio).
const Producto = require('../../models/producto.model');
const Pedido = require('../../models/pedido.model');

const STOCK_BAJO = 3;

// GET /admin
async function inicio(req, res, next) {
  try {
    const productos = await Producto.listar({ incluirInactivos: true });
    const pedidos = await Pedido.listar();

    const activos = productos.filter((p) => p.activo);
    const resumen = {
      productosActivos: activos.length,
      productosOcultos: productos.length - activos.length,
      pedidosPendientes: pedidos.filter((p) => p.estado === 'pendiente').length,
      ventas: pedidos.filter((p) => p.estado !== 'cancelado').reduce((t, p) => t + p.total, 0),
    };
    const stockBajo = activos.filter((p) => p.stock <= STOCK_BAJO).sort((a, b) => a.stock - b.stock);
    const ultimosPedidos = pedidos.slice(-5).reverse();

    res.render('admin/panel', { titulo: 'Panel', seccion: 'panel', resumen, stockBajo, ultimosPedidos, STOCK_BAJO });
  } catch (err) { next(err); }
}

module.exports = { inicio };
