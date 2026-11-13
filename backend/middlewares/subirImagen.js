// MIDDLEWARE DE SEGURIDAD para la subida de fotos de productos (librería multer).
//
// Evita que se suban archivos maliciosos (por ejemplo un .php o un programa
// con el nombre cambiado a "foto.jpg"). Controles que hace:
//   1. Una sola foto por pedido y como máximo 3 MB.
//   2. Extensión permitida: .jpg, .jpeg, .png o .webp.
//   3. Tipo declarado por el navegador (mimetype) de imagen.
//   4. Contenido real: lee los primeros bytes del archivo ("firma" o "número mágico")
//      y comprueba que de verdad sea JPG, PNG o WEBP. Cambiarle el nombre a un archivo
//      no cambia su contenido, así que un archivo disfrazado se rechaza.
//   5. Guarda la foto con un nombre nuevo generado por el servidor
//      (nunca con el nombre que eligió quien la sube) y con la extensión del tipo real.
//
// La foto primero queda en memoria; recién si pasa todos los controles se escribe en
// frontend/public/images/productos/ y en la base se guarda su ruta.
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');

const CARPETA = path.join(__dirname, '..', '..', 'frontend', 'public', 'images', 'productos');
const TAMANO_MAXIMO = 3 * 1024 * 1024; // 3 MB
const EXTENSIONES = ['.jpg', '.jpeg', '.png', '.webp'];
const MIMETYPES = ['image/jpeg', 'image/png', 'image/webp'];

fs.mkdirSync(CARPETA, { recursive: true });

// Reconoce el tipo real de la imagen por sus primeros bytes.
function tipoReal(buffer) {
  if (!buffer || buffer.length < 12) return null;
  // JPG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return '.jpg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, i) => buffer[i] === byte)) return '.png';
  // WEBP: "RIFF" + 4 bytes de tamaño + "WEBP"
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return '.webp';
  return null;
}

const subida = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: TAMANO_MAXIMO, files: 1, fields: 20 },
  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!EXTENSIONES.includes(extension) || !MIMETYPES.includes(file.mimetype)) {
      return cb(new Error('La foto tiene que ser .jpg, .png o .webp'));
    }
    cb(null, true);
  },
}).single('imagen');

// Middleware: si la foto falla no corta todo, guarda el error en req.errorImagen
// para que el controlador lo muestre en el formulario.
function subirImagen(req, res, next) {
  subida(req, res, (err) => {
    if (err) {
      req.errorImagen = err.code === 'LIMIT_FILE_SIZE'
        ? 'La foto no puede pesar más de 3 MB'
        : err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE'
          ? 'Se puede subir una sola foto'
          : err.message;
      req.file = undefined;
      return next();
    }
    if (!req.file) return next(); // no se eligió foto

    // Control del contenido real del archivo
    const extension = tipoReal(req.file.buffer);
    if (!extension) {
      req.errorImagen = 'El archivo no es una imagen válida';
      req.file = undefined;
      return next();
    }

    // Nombre generado por el servidor: producto-<fecha>-<aleatorio>.<tipo real>
    const nombre = `producto-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
    const destino = path.join(CARPETA, nombre);
    fs.writeFile(destino, req.file.buffer, (errorDisco) => {
      if (errorDisco) {
        req.errorImagen = 'No se pudo guardar la foto';
        req.file = undefined;
        return next();
      }
      req.file.filename = nombre;
      req.file.path = destino;
      req.file.buffer = undefined; // ya está en el disco
      next();
    });
  });
}

// Ruta pública de la foto subida (la que se guarda en la columna imagen_url).
function rutaPublica(file) {
  return file ? `/images/productos/${file.filename}` : null;
}

// Borra una foto recién subida si al final el producto no se pudo guardar.
function borrarSubida(file) {
  if (file && file.path) fs.unlink(file.path, () => {});
}

// Borra del disco una foto que se subió desde el panel (cuando se reemplaza o se borra el producto).
// Solo toca las que empiezan con "producto-", nunca las fotos que cargaste a mano.
function borrarFotoAnterior(imagenUrl) {
  if (!imagenUrl || !imagenUrl.startsWith('/images/productos/producto-')) return;
  fs.unlink(path.join(CARPETA, path.basename(imagenUrl)), () => {});
}

module.exports = { subirImagen, rutaPublica, borrarSubida, borrarFotoAnterior, tipoReal };
