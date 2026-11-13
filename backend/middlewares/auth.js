// MIDDLEWARE de autenticación del panel de administración.
// Se ejecuta antes de cada ruta /admin: si no hay una administradora con sesión iniciada,
// redirige al login. Así nadie puede entrar escribiendo la URL directamente.
function soloAdmin(req, res, next) {
  const usuario = req.session.usuario;
  if (usuario && usuario.rol === 'admin') {
    res.locals.admin = usuario; // disponible en todas las vistas del panel
    return next();
  }
  res.redirect('/admin/login');
}

// Mensajes de "se guardó", "se borró", etc. Se guardan en la sesión y se muestran una sola vez.
function avisos(req, res, next) {
  res.locals.aviso = req.session.aviso || null;
  delete req.session.aviso;
  // Formato de precios para las vistas: 12500 -> $12.500
  res.locals.pesos = (n) => '$' + Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: 2 });
  next();
}

function avisar(req, texto, tipo = 'ok') {
  req.session.aviso = { texto, tipo };
}

module.exports = { soloAdmin, avisos, avisar };
