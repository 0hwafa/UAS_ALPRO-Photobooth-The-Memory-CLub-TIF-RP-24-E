<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    // Jangan die() jika dipanggil dari include
    return;
}

// Cek folder uploads
$files = scandir('uploads/');
$jumlah = 0;

foreach ($files as $file) {
    if ($file !== '.' && $file !== '..') {
        $namaFile = $file;
        $path = "uploads/" . $file;

        // Cek pakai prepared statement
        $cek = $conn->prepare("SELECT id_foto FROM foto WHERE nama_foto = ?");
        $cek->bind_param("s", $namaFile);
        $cek->execute();
        $cek->store_result();

        if ($cek->num_rows == 0) {
            $stmt = $conn->prepare("INSERT INTO foto (nama_foto, path) VALUES (?, ?)");
            $stmt->bind_param("ss", $namaFile, $path);
            if ($stmt->execute()) {
                $jumlah++;
            }
            $stmt->close();
        }
        $cek->close();
    }
}

$conn->close();

// Jangan echo apapun di sini agar tidak merusak JSON
// Jika ingin dicek dari luar, simpan $jumlah ke variabel global atau return
