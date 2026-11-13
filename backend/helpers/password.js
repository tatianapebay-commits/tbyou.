// Encriptado de contraseñas con el módulo crypto de Node (no hace falta instalar nada).
// Nunca se guarda la contraseña real: se guarda "sal:hash".
const crypto = require('crypto');

function encriptar(password) {
  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, sal, 64).toString('hex');
  return `${sal}:${hash}`;
}

function verificar(password, guardado) {
  const [sal, hash] = String(guardado).split(':');
  if (!sal || !hash) return false;
  const calculado = crypto.scryptSync(password, sal, 64);
  const original = Buffer.from(hash, 'hex');
  return original.length === calculado.length && crypto.timingSafeEqual(original, calculado);
}

module.exports = { encriptar, verificar };
