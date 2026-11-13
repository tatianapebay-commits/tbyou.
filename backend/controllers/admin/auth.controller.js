// CONTROLADOR del login del panel de administración.
const Usuario = require('../../models/usuario.model');
const { verificar } = require('../../helpers/password');

// GET /admin/login
function formulario(req, res) {
  if (req.session.usuario?.rol === 'admin') return res.redirect('/admin');
  res.render('admin/login', { titulo: 'Ingreso administración', error: null, email: '' });
}

// POST /admin/login
async function ingresar(req, res, next) {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const usuario = await Usuario.buscarParaLogin(email);

    // Tiene que existir, la contraseña tiene que coincidir y tiene que ser administradora
    if (!usuario || !verificar(req.body.password || '', usuario.password_hash) || usuario.rol !== 'admin') {
      return res.status(401).render('admin/login', {
        titulo: 'Ingreso administración',
        error: 'Email o contraseña incorrectos, o el usuario no es administrador',
        email,
      });
    }

    // Se crea una sesión nueva y se guardan los datos (nunca la contraseña)
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
      res.redirect('/admin');
    });
  } catch (err) { next(err); }
}

// POST /admin/salir
function salir(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

module.exports = { formulario, ingresar, salir };
