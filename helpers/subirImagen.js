// Subida de fotos de productos desde el panel (librería multer).
// Las fotos se guardan en public/images/productos/ y en la base queda su ruta.
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const CARPETA = path.join(__dirname, '..', 'public', 'images', 'productos');
const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp'];

fs.mkdirSync(CARPETA, { recursive: true });

const subida = multer({
  storage: multer.diskStorage({
    destination: CARPETA,
    // Nombre único para no pisar otra foto: producto-<fecha en milisegundos>.jpg
    filename: (req, file, cb) => {
      cb(null, `producto-${Date.now()}${path.extname(file.originalname).toLowerCase()}`);
    },
  }),
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (req, file, cb) => {
    const ok = EXTENSIONES.includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error('La foto tiene que ser .jpg, .png o .webp'), ok);
  },
}).single('imagen');

// Middleware: si la foto falla (muy grande o formato incorrecto) no corta todo,
// guarda el error en req.errorImagen para que el controlador lo muestre en el formulario.
function subirImagen(req, res, next) {
  subida(req, res, (err) => {
    if (err) {
      req.errorImagen = err.code === 'LIMIT_FILE_SIZE' ? 'La foto no puede pesar más de 3 MB' : err.message;
    }
    next();
  });
}

// Ruta pública de la foto subida (la que se guarda en la columna imagen_url).
function rutaPublica(file) {
  return file ? `/images/productos/${file.filename}` : null;
}

// Borra una foto recién subida si al final el producto no se pudo guardar.
function borrarSubida(file) {
  if (file) fs.unlink(file.path, () => {});
}

// Borra del disco una foto que se subió desde el panel (cuando se reemplaza o se borra el producto).
// Solo toca las que empiezan con "producto-", nunca las fotos que cargaste a mano.
function borrarFotoAnterior(imagenUrl) {
  if (!imagenUrl || !imagenUrl.startsWith('/images/productos/producto-')) return;
  fs.unlink(path.join(CARPETA, path.basename(imagenUrl)), () => {});
}

module.exports = { subirImagen, rutaPublica, borrarSubida, borrarFotoAnterior };
