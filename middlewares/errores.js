// Crea un error con código HTTP para usar desde los controladores.
function crearError(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}

// 404 para rutas que no existen.
function noEncontrado(req, res, next) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
  }
  res.status(404).render('error', { titulo: 'Página no encontrada', mensaje: 'La página que buscás no existe.' });
}

// Mensaje para cada restricción CHECK definida en database/ddl.sql
const MENSAJES_CHECK = {
  ck_productos_ganancia: 'El precio de venta no puede ser menor al precio de costo',
  ck_productos_stock: 'El stock no puede quedar negativo',
  ck_productos_precio_venta: 'El precio de venta debe ser mayor a 0',
  ck_productos_precio_costo: 'El precio de costo no puede ser negativo',
  ck_productos_material: 'Material inválido. Opciones: acero quirurgico, acero blanco, acero dorado, bijou, cuero sintetico, tela, otro',
  ck_usuarios_rol: 'El rol debe ser "admin" o "cliente"',
  ck_usuarios_email: 'El email no tiene un formato válido',
  ck_pedidos_estado: 'Estado de pedido inválido',
  ck_pedidos_medio_pago: 'Medio de pago inválido. Opciones: transferencia, mercadopago, efectivo',
  ck_proveedores_compra_minima: 'La compra mínima no puede ser negativa',
  ck_detalle_cantidad: 'La cantidad debe ser mayor a 0',
};

// Traduce un error (de PostgreSQL o creado con crearError) a { status, mensaje } claros.
// Lo usan manejarErrores y los formularios del panel de administración.
function traducirError(err) {
  let status = err.status || 500;
  let mensaje = err.message || 'Error interno del servidor';

  switch (err.code) {
    case '23505': // unique_violation
      status = 409;
      mensaje = 'Ya existe un registro con ese valor único';
      break;
    case '23503': // foreign_key_violation
      status = 409;
      mensaje = 'La operación viola una relación: el registro referenciado no existe o está en uso';
      break;
    case '23514': // check_violation
      status = 400;
      mensaje = MENSAJES_CHECK[err.constraint] || 'Algún dato no cumple las reglas de la base';
      break;
    case '23502': // not_null_violation
      status = 400;
      mensaje = `Falta un dato obligatorio: ${err.column}`;
      break;
    case '22P02': // invalid_text_representation
      status = 400;
      mensaje = 'Algún dato tiene un formato inválido';
      break;
    default:
      break;
  }
  return { status, mensaje };
}

// Último middleware: responde el error como JSON (API) o como página.
function manejarErrores(err, req, res, next) {
  const { status, mensaje } = traducirError(err);
  if (status === 500) console.error(err);

  if (req.originalUrl.startsWith('/api')) {
    return res.status(status).json({ error: mensaje, detalle: err.detail });
  }
  res.status(status).render('error', { titulo: 'Ocurrió un error', mensaje });
}

module.exports = { crearError, traducirError, noEncontrado, manejarErrores };
