// Validaciones simples que usan los controladores antes de ir a la base.
const { crearError } = require('../middlewares/errores');

// Convierte el :id de la URL a número entero positivo o lanza 400.
function idValido(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw crearError(400, 'El id debe ser un número entero positivo');
  return id;
}

// Verifica que los campos obligatorios vengan en el body.
function requeridos(body, campos) {
  const faltan = campos.filter((c) => body[c] === undefined || body[c] === null || body[c] === '');
  if (faltan.length) throw crearError(400, `Faltan datos obligatorios: ${faltan.join(', ')}`);
}

// Si el campo viene, tiene que ser un número >= minimo.
function numero(body, campo, minimo = 0) {
  if (body[campo] === undefined || body[campo] === null) return;
  const n = Number(body[campo]);
  if (Number.isNaN(n) || n < minimo) throw crearError(400, `"${campo}" debe ser un número mayor o igual a ${minimo}`);
}

module.exports = { idValido, requeridos, numero };
