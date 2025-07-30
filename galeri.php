<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Galeri TMC Photobooth</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>

<h1>Galeri Hasil Photobooth</h1>
<div class="gallery">
<?php
$koneksi = mysqli_connect('localhost', 'root', '', 'database_photobooth');
$result = mysqli_query($koneksi, "SELECT * FROM foto ORDER BY uploaded_at DESC");

while ($row = mysqli_fetch_assoc($result)) {
    echo "<div class='foto-box'>";
    echo "<img src='{$row['path']}' alt='Foto'>";
    echo "<div class='caption'>{$row['nama_foto']}</div>";
    echo "</div>";
}
?>
</div>

</body>
</html>
