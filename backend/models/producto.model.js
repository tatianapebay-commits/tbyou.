// MODELO: Producto.
const { pool } = require('../config/db');

const SELECT_BASE = `
  SELECT p.id, p.nombre, p.descripcion, p.material,
         p.precio_costo::float AS precio_costo,
         p.precio_venta::float AS precio_venta,
         p.stock, p.imagen_url, p.activo, p.creado_en,
         p.categoria_id, c.nombre AS categoria,
         p.proveedor_id, pr.nombre AS proveedor
  FROM productos p
  JOIN categorias c ON c.id = p.categoria_id
  LEFT JOIN proveedores pr ON pr.id = p.proveedor_id
`;

const Producto = {
  // Filtros opcionales: categoria (id), material, buscar (texto), incluirInactivos
  async listar({ categoria, material, buscar, incluirInactivos } = {}) {
    const condiciones = [];
    const valores = [];

    if (!incluirInactivos) condiciones.push('p.activo = TRUE');
    if (categoria) {
      valores.push(categoria);
      condiciones.push(`p.categoria_id = $${valores.length}`);
    }
    if (material) {
      valores.push(material);
      condiciones.push(`p.material = $${valores.length}`);
    }
    if (buscar) {
      valores.push(`%${buscar}%`);
      condiciones.push(`(p.nombre ILIKE $${valores.length} OR p.descripcion ILIKE $${valores.length})`);
    }

    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
    const { rows } = await pool.query(`${SELECT_BASE} ${where} ORDER BY p.categoria_id, p.nombre`, valores);
    return rows;
  },

  async buscarPorId(id) {
    const { rows } = await pool.query(`${SELECT_BASE} WHERE p.id = $1`, [id]);
    return rows[0] || null;
  },

  async crear(datos) {
    const { rows } = await pool.query(
      `INSERT INTO productos
         (nombre, descripcion, material, precio_costo, precio_venta, stock, imagen_url, categoria_id, proveedor_id)
       VALUES ($1, $2, COALESCE($3, 'otro'), $4, $5, COALESCE($6, 0), $7, $8, $9)
       RETURNING id`,
      [
        datos.nombre,
        datos.descripcion || null,
        datos.material || null,
        datos.precio_costo,
        datos.precio_venta,
        datos.stock ?? null,
        datos.imagen_url || null,
        datos.categoria_id,
        datos.proveedor_id || null,
      ]
    );
    return this.buscarPorId(rows[0].id);
  },

  async actualizar(id, datos) {
    const { rows } = await pool.query(
      `UPDATE productos SET
         nombre       = COALESCE($1, nombre),
         descripcion  = COALESCE($2, descripcion),
         material     = COALESCE($3, material),
         precio_costo = COALESCE($4, precio_costo),
         precio_venta = COALESCE($5, precio_venta),
         stock        = COALESCE($6, stock),
         imagen_url   = COALESCE($7, imagen_url),
         categoria_id = COALESCE($8, categoria_id),
         proveedor_id = COALESCE($9, proveedor_id),
         activo       = COALESCE($10, activo)
       WHERE id = $11
       RETURNING id`,
      [
        datos.nombre ?? null,
        datos.descripcion ?? null,
        datos.material ?? null,
        datos.precio_costo ?? null,
        datos.precio_venta ?? null,
        datos.stock ?? null,
        datos.imagen_url ?? null,
        datos.categoria_id ?? null,
        datos.proveedor_id ?? null,
        datos.activo ?? null,
        id,
      ]
    );
    return rows[0] ? this.buscarPorId(id) : null;
  },

  // Edición completa desde el panel de administración: reemplaza todos los campos
  // (a diferencia de actualizar, permite dejar vacíos la descripción o el proveedor).
  // La imagen solo cambia si se subió una nueva.
  async editar(id, datos) {
    const { rows } = await pool.query(
      `UPDATE productos SET
         nombre = $1, descripcion = $2, material = $3,
         precio_costo = $4, precio_venta = $5, stock = $6,
         imagen_url = COALESCE($7, imagen_url),
         categoria_id = $8, proveedor_id = $9, activo = $10
       WHERE id = $11
       RETURNING id`,
      [
        datos.nombre, datos.descripcion || null, datos.material,
        datos.precio_costo, datos.precio_venta, datos.stock,
        datos.imagen_url || null,
        datos.categoria_id, datos.proveedor_id || null, datos.activo, id,
      ]
    );
    return rows[0] ? this.buscarPorId(id) : null;
  },

  // Suma o resta stock (cantidad puede ser negativa). El CHECK de la tabla impide quedar en negativo.
  async ajustarStock(id, cantidad) {
    const { rows } = await pool.query(
      'UPDATE productos SET stock = stock + $1 WHERE id = $2 RETURNING id',
      [cantidad, id]
    );
    return rows[0] ? this.buscarPorId(id) : null;
  },

  async eliminar(id) {
    const { rows } = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING id, nombre, imagen_url', [id]);
    return rows[0] || null;
  },
};

module.exports = Producto;
