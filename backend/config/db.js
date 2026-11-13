// Configuración de la conexión con PostgreSQL.
// Los datos se leen del archivo .env (ver .env.example).
//
// Hay dos formas de conectarse:
//   - SUPABASE (PostgreSQL en la nube): completar DATABASE_URL con la "connection string"
//     que da Supabase en Project Settings → Database. La conexión va cifrada (SSL).
//   - PostgreSQL LOCAL (en la computadora): dejar DATABASE_URL vacío y completar
//     DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME.
const { Pool } = require('pg');
require('dotenv').config();

const config = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'tbyou_accesorios',
    };

const pool = new Pool(config);

// Comprueba la conexión al iniciar el servidor.
async function probarConexion() {
  const { rows } = await pool.query('SELECT NOW() AS ahora');
  return rows[0].ahora;
}

module.exports = { pool, probarConexion };
