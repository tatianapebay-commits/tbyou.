// MODELO: Proveedor (mayoristas).
const { pool } = require('../config/db');

const Proveedor = {
  async listar() {
    const { rows } = await pool.query('SELECT id, nombre, sitio_web, telefono, compra_minima::float AS compra_minima FROM proveedores ORDER BY id');
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query('SELECT id, nombre, sitio_web, telefono, compra_minima::float AS compra_minima FROM proveedores WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async crear({ nombre, sitio_web, telefono, compra_minima }) {
    const { rows } = await pool.query(
      `INSERT INTO proveedores (nombre, sitio_web, telefono, compra_minima)
       VALUES ($1, $2, $3, COALESCE($4, 0)) RETURNING id, nombre, sitio_web, telefono, compra_minima::float AS compra_minima`,
      [nombre, sitio_web || null, telefono || null, compra_minima ?? null]
    );
    return rows[0];
  },

  async actualizar(id, { nombre, sitio_web, telefono, compra_minima }) {
    const { rows } = await pool.query(
      `UPDATE proveedores
       SET nombre = COALESCE($1, nombre),
           sitio_web = COALESCE($2, sitio_web),
           telefono = COALESCE($3, telefono),
           compra_minima = COALESCE($4, compra_minima)
       WHERE id = $5 RETURNING id, nombre, sitio_web, telefono, compra_minima::float AS compra_minima`,
      [nombre ?? null, sitio_web ?? null, telefono ?? null, compra_minima ?? null, id]
    );
    return rows[0] || null;
  },

  async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM proveedores WHERE id = $1 RETURNING id, nombre', [id]);
    return rows[0] || null;
  },
};

module.exports = Proveedor;
