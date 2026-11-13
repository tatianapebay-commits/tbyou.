// MODELO: Pedido y su detalle.
// Crear y cancelar pedidos usan TRANSACCIONES: si algo falla, no se guarda nada a medias.
const { pool } = require('../config/db');
const { crearError } = require('../middlewares/errores');
const Usuario = require('./usuario.model');

const Pedido = {
  async listar({ usuario, estado } = {}) {
    const condiciones = [];
    const valores = [];
    if (usuario) {
      valores.push(usuario);
      condiciones.push(`p.usuario_id = $${valores.length}`);
    }
    if (estado) {
      valores.push(estado);
      condiciones.push(`p.estado = $${valores.length}`);
    }
    const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT p.id, p.fecha, p.estado, p.direccion_envio, p.medio_pago, p.total::float AS total,
              p.usuario_id, u.nombre || ' ' || u.apellido AS cliente,
              COALESCE(SUM(d.cantidad), 0)::int AS cantidad_productos
       FROM pedidos p
       JOIN usuarios u ON u.id = p.usuario_id
       LEFT JOIN pedido_detalle d ON d.pedido_id = p.id
       ${where}
       GROUP BY p.id, u.nombre, u.apellido
       ORDER BY p.id`,
      valores
    );
    return rows;
  },

  async buscarPorId(id, cliente = pool) {
    const { rows } = await cliente.query(
      `SELECT p.id, p.fecha, p.estado, p.direccion_envio, p.medio_pago, p.notas,
              p.total::float AS total, p.usuario_id,
              u.nombre || ' ' || u.apellido AS cliente, u.email, u.telefono
       FROM pedidos p
       JOIN usuarios u ON u.id = p.usuario_id
       WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) return null;

    const detalle = await cliente.query(
      `SELECT d.producto_id, pr.nombre AS producto, d.cantidad,
              d.precio_unitario::float AS precio_unitario,
              (d.cantidad * d.precio_unitario)::float AS subtotal
       FROM pedido_detalle d
       JOIN productos pr ON pr.id = d.producto_id
       WHERE d.pedido_id = $1
       ORDER BY d.id`,
      [id]
    );
    return { ...rows[0], items: detalle.rows };
  },

  // items: [{ producto_id, cantidad }]
  // nuevoCliente (opcional, lo usa el carrito): datos de la clienta; se busca o se crea
  // dentro de la misma transacción, así si falla el pedido no queda guardada a medias.
  async crear({ usuario_id, nuevoCliente, direccion_envio, medio_pago, notas, items }) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');

      if (nuevoCliente) {
        usuario_id = (await Usuario.buscarOCrearCliente(nuevoCliente, cliente)).id;
      }

      const { rows } = await cliente.query(
        `INSERT INTO pedidos (usuario_id, direccion_envio, medio_pago, notas)
         VALUES ($1, $2, COALESCE($3, 'transferencia'), $4) RETURNING id`,
        [usuario_id, direccion_envio, medio_pago || null, notas || null]
      );
      const pedidoId = rows[0].id;
      let total = 0;

      for (const item of items) {
        // FOR UPDATE bloquea la fila del producto para que dos compras no usen el mismo stock
        const prod = await cliente.query(
          'SELECT id, nombre, precio_venta, stock, activo FROM productos WHERE id = $1 FOR UPDATE',
          [item.producto_id]
        );
        const producto = prod.rows[0];
        if (!producto || !producto.activo) {
          throw crearError(404, `El producto ${item.producto_id} no existe o no está a la venta`);
        }
        if (producto.stock < item.cantidad) {
          throw crearError(409, `Stock insuficiente de "${producto.nombre}" (quedan ${producto.stock})`);
        }

        await cliente.query(
          `INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4)`,
          [pedidoId, producto.id, item.cantidad, producto.precio_venta]
        );
        await cliente.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, producto.id]);
        total += Number(producto.precio_venta) * item.cantidad;
      }

      await cliente.query('UPDATE pedidos SET total = $1 WHERE id = $2', [total, pedidoId]);
      await cliente.query('COMMIT');
      return this.buscarPorId(pedidoId);
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }
  },

  // Cambia el estado. Si se cancela, devuelve el stock de los productos.
  async cambiarEstado(id, estado) {
    const cliente = await pool.connect();
    try {
      await cliente.query('BEGIN');
      const actual = await cliente.query('SELECT estado FROM pedidos WHERE id = $1 FOR UPDATE', [id]);
      if (!actual.rows[0]) {
        await cliente.query('ROLLBACK');
        return null;
      }
      const estadoAnterior = actual.rows[0].estado;
      if (estadoAnterior === 'cancelado') {
        throw crearError(409, 'El pedido ya está cancelado y no se puede modificar');
      }

      await cliente.query('UPDATE pedidos SET estado = $1 WHERE id = $2', [estado, id]);

      if (estado === 'cancelado') {
        await cliente.query(
          `UPDATE productos pr SET stock = pr.stock + d.cantidad
           FROM pedido_detalle d
           WHERE d.pedido_id = $1 AND d.producto_id = pr.id`,
          [id]
        );
      }

      await cliente.query('COMMIT');
      return this.buscarPorId(id);
    } catch (err) {
      await cliente.query('ROLLBACK');
      throw err;
    } finally {
      cliente.release();
    }
  },

  // Solo se pueden borrar pedidos cancelados (el detalle se borra en cascada).
  async eliminar(id) {
    const { rows } = await pool.query('SELECT estado FROM pedidos WHERE id = $1', [id]);
    if (!rows[0]) return null;
    if (rows[0].estado !== 'cancelado') {
      throw crearError(409, 'Solo se pueden eliminar pedidos cancelados');
    }
    const borrado = await pool.query('DELETE FROM pedidos WHERE id = $1 RETURNING id', [id]);
    return borrado.rows[0];
  },
};

module.exports = Pedido;
