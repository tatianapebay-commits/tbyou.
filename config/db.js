// Configuración de la conexión con PostgreSQL.
// Los datos se leen del archivo .env (ver .env.example).
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'tbyou_accesorios',
});

// Comprueba la conexión al iniciar el servidor.
async function probarConexion() {
  const { rows } = await pool.query('SELECT NOW() AS ahora');
  return rows[0].ahora;
}

module.exports = { pool, probarConexion };
