<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth"; // nama database kamu

$conn = mysqli_connect($host, $user, $pass, $db, 3306); // jika pakai port 3307

if (!$conn) {
    die("Koneksi gagal: " . mysqli_connect_error());
}
?>
