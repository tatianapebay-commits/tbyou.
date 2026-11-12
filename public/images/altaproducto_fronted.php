<?php
session_start();

if ($_SESSION['rol'] != 'admin') {
    header("Location: index.php");
    exit;
}

$conn = new mysqli("localhost", "root", "", "tbyou");
if ($conn->connect_error) {
    die("Error de conexión");
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $nombre = $_POST['nombre'];
    $precio = $_POST['precio'];
    $cantidad = $_POST['cantidad'];
    $descripcion = $_POST['descripcion'];

    $fotoNombre = $_FILES['foto']['name'];
    $tmp = $_FILES['foto']['tmp_name'];

    $ruta = "images/productos/" . $fotoNombre;

    if (!move_uploaded_file($tmp, $ruta)) {
        die("Error al subir la imagen");
    }

    $sql = "INSERT INTO productos
    (nombre, precio, cantidad, foto, descripcion, borrado)
    VALUES
    ('$nombre', '$precio', '$cantidad', '$ruta', '$descripcion', 'alta')";

    if ($conn->query($sql)) {
        header("Location: productos.php");
        exit;
    } else {
        $error = "Error al guardar el producto";
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Alta Producto</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- CSS -->
    <link rel="stylesheet" href="style.css">

    <!-- FUENTES -->
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>

<?php include("menu.php"); ?>

<section class="login-section">
    <div class="login-glass">

        <h2>Alta de producto</h2>

        <?php if (!empty($error)) echo "<p class='error'>$error</p>"; ?>

        <form method="POST" enctype="multipart/form-data" class="login-form">

            <input type="text" name="nombre" placeholder="Nombre del producto" required>
            <input type="number" name="precio" placeholder="Precio" required>
            <input type="number" name="cantidad" placeholder="Cantidad" required>

            <textarea name="descripcion" placeholder="Descripción" required></textarea>

            <input type="file" name="foto" required>

            <button type="submit">Guardar producto</button>
        </form>

    </div>
</section>

</body>
</html>
