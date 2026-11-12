// CONTROLADOR del carrito: recibe la compra desde la página, crea el pedido,
// manda el mail a la tienda y devuelve el link de WhatsApp.
const crypto = require('crypto');
const Pedido = require('../models/pedido.model');
const tienda = require('../config/tienda');
const { crearError } = require('../middlewares/errores');
const { requeridos } = require('../helpers/validar');
const { encriptar } = require('../helpers/password');
const { MEDIOS, linkWhatsapp, enviarMailPedido } = require('../helpers/notificaciones');

// POST /api/checkout
// {
//   "cliente": { "nombre", "apellido", "email", "telefono" },
//   "direccion_envio": "...", "medio_pago": "transferencia", "notas": "...",
//   "items": [{ "producto_id": 1, "cantidad": 2 }]
// }
async function confirmar(req, res, next) {
  try {
    const { cliente = {}, direccion_envio, medio_pago, notas, items } = req.body;

    requeridos(cliente, ['nombre', 'apellido', 'email', 'telefono']);
    requeridos(req.body, ['direccion_envio', 'medio_pago', 'items']);

    const email = String(cliente.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw crearError(400, 'El email no tiene un formato válido');
    if (!MEDIOS[medio_pago]) {
      throw crearError(400, `Medio de pago inválido. Opciones: ${Object.keys(MEDIOS).join(', ')}`);
    }
    if (!Array.isArray(items) || items.length === 0) throw crearError(400, 'El carrito está vacío');

    const limpios = items.map((it) => ({ producto_id: Number(it.producto_id), cantidad: Number(it.cantidad) }));
    if (limpios.some((i) => !Number.isInteger(i.producto_id) || i.producto_id <= 0 || !Number.isInteger(i.cantidad) || i.cantidad <= 0)) {
      throw crearError(400, 'Cada producto del carrito necesita producto_id y cantidad enteros positivos');
    }
    if (new Set(limpios.map((i) => i.producto_id)).size !== limpios.length) {
      throw crearError(400, 'Hay productos repetidos en el carrito');
    }

    // Crea el pedido en una transacción: busca o crea a la clienta (no necesita registrarse),
    // controla y descuenta stock y calcula el total con los precios de la base
    const pedido = await Pedido.crear({
      nuevoCliente: {
        nombre: String(cliente.nombre).trim(),
        apellido: String(cliente.apellido).trim(),
        email,
        telefono: String(cliente.telefono).trim(),
        password_hash: encriptar(crypto.randomBytes(12).toString('hex')),
      },
      direccion_envio: String(direccion_envio).trim(),
      medio_pago,
      notas: notas ? String(notas).trim().slice(0, 300) : null,
      items: limpios,
    });

    const mail = await enviarMailPedido(pedido);

    res.status(201).json({
      mensaje: `¡Gracias, ${String(cliente.nombre).trim()}! Tu pedido N° ${pedido.id} quedó registrado.`,
      pedido,
      whatsapp_url: linkWhatsapp(pedido),
      email_enviado: mail.enviado,
      pago: {
        medio: MEDIOS[medio_pago],
        alias: medio_pago === 'transferencia' ? tienda.aliasTransferencia : undefined,
        link: medio_pago === 'mercadopago' ? tienda.linkMercadoPago : undefined,
      },
    });
  } catch (err) { next(err); }
}

module.exports = { confirmar };
