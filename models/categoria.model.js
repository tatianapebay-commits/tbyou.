// MODELO: Categoría. Solo habla con la base de datos.
const { pool } = require('../config/db');

const Categoria = {
  async listar() {
    const { rows } = await pool.query(
      `SELECT c.id, c.nombre, c.descripcion, COUNT(p.id)::int AS cantidad_productos
       FROM categorias c
       LEFT JOIN productos p ON p.categoria_id = c.id AND p.activo
       GROUP BY c.id
       ORDER BY c.id`
    );
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query('SELECT * FROM categorias WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, descripcion }) {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion || null]
    );
    return rows[0];
  },

  async actualizar(id, { nombre, descripcion }) {
    const { rows } = await pool.query(
      `UPDATE categorias
       SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion)
       WHERE id = $3 RETURNING *`,
      [nombre ?? null, descripcion ?? null, id]
    );
    return rows[0] || null;
  },

  async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM categorias WHERE id = $1 RETURNING *', [id]);
    return rows[0] || null;
  },
};

module.exports = Categoria;
