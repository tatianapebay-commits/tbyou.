// Arma el mensaje de WhatsApp y envía el mail con cada pedido nuevo.
const nodemailer = require('nodemailer');
const tienda = require('../config/tienda');

const MEDIOS = {
  transferencia: 'Transferencia bancaria',
  mercadopago: 'Mercado Pago',
  efectivo: 'Efectivo al retirar en el local',
};

// Escapa lo que escribe el cliente para que no pueda meter HTML en el mail
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const pesos = (n) => '$' + Number(n).toLocaleString('es-AR', { maximumFractionDigits: 2 });

// Texto del pedido para WhatsApp (el cliente lo envía desde su teléfono).
function textoWhatsapp(pedido) {
  const lineas = [
    `¡Hola! Hice el pedido N° ${pedido.id} en ${tienda.nombre}:`,
    '',
    ...pedido.items.map((i) => `• ${i.cantidad} x ${i.producto} — ${pesos(i.subtotal)}`),
    '',
    `*Total: ${pesos(pedido.total)}*`,
    `Pago: ${MEDIOS[pedido.medio_pago] || pedido.medio_pago}`,
    `Envío: ${pedido.direccion_envio}`,
    `A nombre de: ${pedido.cliente}`,
  ];
  if (pedido.notas) lineas.push(`Notas: ${pedido.notas}`);
  return lineas.join('\n');
}

// Link que abre WhatsApp con el mensaje ya escrito.
function linkWhatsapp(pedido) {
  const texto = encodeURIComponent(textoWhatsapp(pedido));
  return tienda.whatsapp
    ? `https://wa.me/${tienda.whatsapp}?text=${texto}`
    : `https://wa.me/?text=${texto}`;
}

// Si no hay datos SMTP en el .env, el mail no se envía: se muestra en la consola del servidor.
function crearTransporte() {
  const { host, port, user, pass } = tienda.smtp;
  if (host && user && pass) {
    return { real: true, t: nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } }) };
  }
  return { real: false, t: nodemailer.createTransport({ jsonTransport: true }) };
}

function htmlPedido(pedido) {
  const filas = pedido.items
    .map((i) => `<tr><td>${esc(i.producto)}</td><td align="center">${i.cantidad}</td>
      <td align="right">${pesos(i.precio_unitario)}</td><td align="right">${pesos(i.subtotal)}</td></tr>`)
    .join('');
  return `
  <div style="font-family:Arial,sans-serif;color:#4a4a4a">
    <h2 style="color:#c97a93">Nuevo pedido N° ${pedido.id}</h2>
    <p><b>Cliente:</b> ${esc(pedido.cliente)}<br>
       <b>Email:</b> ${esc(pedido.email)}<br>
       <b>Teléfono:</b> ${esc(pedido.telefono || '-')}<br>
       <b>Envío:</b> ${esc(pedido.direccion_envio)}<br>
       <b>Medio de pago:</b> ${MEDIOS[pedido.medio_pago] || pedido.medio_pago}</p>
    ${pedido.notas ? `<p><b>Notas:</b> ${esc(pedido.notas)}</p>` : ''}
    <table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#f0d3dc">
      <tr style="background:#fbf4f6"><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>
      ${filas}
      <tr><td colspan="3" align="right"><b>Total</b></td><td align="right"><b>${pesos(pedido.total)}</b></td></tr>
    </table>
  </div>`;
}

// Envía el pedido al correo de la tienda. Nunca hace fallar la compra: si el mail falla, lo informa.
async function enviarMailPedido(pedido) {
  const { real, t } = crearTransporte();
  try {
    const info = await t.sendMail({
      from: `"${tienda.nombre}" <${tienda.smtp.user || 'no-reply@tbyou.local'}>`,
      to: tienda.emailPedidos,
      replyTo: pedido.email,
      subject: `Nuevo pedido N° ${pedido.id} — ${pedido.cliente} — ${pesos(pedido.total)}`,
      text: textoWhatsapp(pedido),
      html: htmlPedido(pedido),
    });
    if (!real) {
      console.log(`[mail] SMTP sin configurar: el pedido ${pedido.id} no se envió por correo (ver .env).`);
      return { enviado: false, motivo: 'SMTP sin configurar', vista_previa: JSON.parse(info.message) };
    }
    return { enviado: true };
  } catch (err) {
    console.error(`[mail] No se pudo enviar el pedido ${pedido.id}:`, err.message);
    return { enviado: false, motivo: err.message };
  }
}

module.exports = { MEDIOS, textoWhatsapp, linkWhatsapp, enviarMailPedido };
