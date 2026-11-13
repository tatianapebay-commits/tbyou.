// MODELO: Usuario. Nunca devuelve password_hash salvo en buscarParaLogin.
const { pool } = require('../config/db');

const CAMPOS_PUBLICOS = 'id, nombre, apellido, email, telefono, rol, creado_en';

const Usuario = {
  async listar() {
    const { rows } = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY id`);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(`SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`, [id]);
    return rows[0] || null;
  },

  async buscarParaLogin(email) {
    const { rows } = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async crear({ nombre, apellido, email, password_hash, telefono, rol }) {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, 'cliente'))
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nombre, apellido, email, password_hash, telefono || null, rol || null]
    );
    return rows[0];
  },

  // Para las compras desde el carrito: si el email ya existe usa ese cliente
  // (y actualiza su teléfono); si no, lo crea con una contraseña al azar.
  // "db" permite usarlo dentro de la transacción del pedido.
  async buscarOCrearCliente({ nombre, apellido, email, telefono, password_hash }, db = pool) {
    const { rows } = await db.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, telefono, rol)
       VALUES ($1, $2, $3, $4, $5, 'cliente')
       ON CONFLICT (email) DO UPDATE SET telefono = COALESCE(EXCLUDED.telefono, usuarios.telefono)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nombre, apellido, email, password_hash, telefono || null]
    );
    return rows[0];
  },

  async actualizar(id, { nombre, apellido, telefono, rol }) {
    const { rows } = await pool.query(
      `UPDATE usuarios SET
         nombre = COALESCE($1, nombre),
         apellido = COALESCE($2, apellido),
         telefono = COALESCE($3, telefono),
         rol = COALESCE($4, rol)
       WHERE id = $5
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nombre ?? null, apellido ?? null, telefono ?? null, rol ?? null, id]
    );
    return rows[0] || null;
  },

  async eliminar(id) {
    const { rows } = await pool.query(`DELETE FROM usuarios WHERE id = $1 RETURNING ${CAMPOS_PUBLICOS}`, [id]);
    return rows[0] || null;
  },
};

module.exports = Usuario;
