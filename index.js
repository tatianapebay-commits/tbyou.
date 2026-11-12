require('dotenv').config();
const app = require('./app');
const { probarConexion } = require('./config/db');

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor T.B.YOU escuchando en http://localhost:${PORT}`);
  try {
    const ahora = await probarConexion();
    console.log(`Conectado a PostgreSQL (${ahora.toISOString()})`);
  } catch (err) {
    console.error('No se pudo conectar a PostgreSQL:', err.message);
    console.error('Revisá los datos del archivo .env');
  }
});
