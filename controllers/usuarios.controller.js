const Usuario = require('../models/usuario.model');
const { crearError } = require('../middlewares/errores');
const { idValido, requeridos } = require('../helpers/validar');
const { encriptar, verificar } = require('../helpers/password');

async function listar(req, res, next) {
  try {
    res.json(await Usuario.listar());
  } catch (err) { next(err); }
}

async function obtener(req, res, next) {
  try {
    const usuario = await Usuario.buscarPorId(idValido(req.params.id));
    if (!usuario) throw crearError(404, 'Usuario no encontrado');
    res.json(usuario);
  } catch (err) { next(err); }
}

// POST /api/usuarios  (registro)
async function registrar(req, res, next) {
  try {
    requeridos(req.body, ['nombre', 'apellido', 'email', 'password']);
    if (String(req.body.password).length < 6) {
      throw crearError(400, 'La contraseña debe tener al menos 6 caracteres');
    }
    const usuario = await Usuario.crear({
      ...req.body,
      email: String(req.body.email).trim().toLowerCase(),
      password_hash: encriptar(req.body.password),
    });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === '23505') return next(crearError(409, 'Ya existe un usuario con ese email'));
    next(err);
  }
}

// POST /api/usuarios/login
async function login(req, res, next) {
  try {
    requeridos(req.body, ['email', 'password']);
    const usuario = await Usuario.buscarParaLogin(String(req.body.email).trim().toLowerCase());
    if (!usuario || !verificar(req.body.password, usuario.password_hash)) {
      throw crearError(401, 'Email o contraseña incorrectos');
    }
    const { password_hash, ...datos } = usuario;
    res.json({ mensaje: `Bienvenida/o, ${datos.nombre}`, usuario: datos });
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const usuario = await Usuario.actualizar(idValido(req.params.id), req.body);
    if (!usuario) throw crearError(404, 'Usuario no encontrado');
    res.json(usuario);
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const usuario = await Usuario.eliminar(idValido(req.params.id));
    if (!usuario) throw crearError(404, 'Usuario no encontrado');
    res.json({ mensaje: 'Usuario eliminado', usuario });
  } catch (err) {
    if (err.code === '23503') return next(crearError(409, 'El usuario tiene pedidos y no se puede borrar'));
    next(err);
  }
}

module.exports = { listar, obtener, registrar, login, actualizar, eliminar };
