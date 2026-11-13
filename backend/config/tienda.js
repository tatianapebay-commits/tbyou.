// Datos de la tienda que usan el carrito, WhatsApp y el mail de pedidos.
// Se completan en el archivo .env (ver .env.example).
require('dotenv').config();

module.exports = {
  nombre: 'T.B.You Accesorios',
  // Número de WhatsApp en formato internacional, sin +, espacios ni guiones. Ej: 5492494123456
  whatsapp: (process.env.WHATSAPP_NUMERO || '').replace(/\D/g, ''),
  // Correo donde llegan los pedidos
  emailPedidos: process.env.EMAIL_PEDIDOS || 'tbyouaccesorios@gmail.com',
  // Alias o CBU para transferencias (se muestra al confirmar la compra)
  aliasTransferencia: process.env.ALIAS_TRANSFERENCIA || '',
  // Link de pago de Mercado Pago (opcional)
  linkMercadoPago: process.env.LINK_MERCADOPAGO || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 465,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};
