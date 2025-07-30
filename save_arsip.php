<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth"; // Gunakan DB yang sudah dibuat

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Pastikan ada data
if (isset($_POST['foto'])) {
    $data = $_POST['foto'];

    // Format: data:image/png;base64,XXXXX
    list($tipe, $data) = explode(';', $data);
    list(, $data) = explode(',', $data);

    $data = base64_decode($data);
    $namaFile = 'foto_' . time() . '.png';
    $path = 'uploads/' . $namaFile;

    // Simpan ke folder
    if (file_put_contents($path, $data)) {
        // Simpan info ke database
        $stmt = $conn->prepare("INSERT INTO foto (nama_foto, path) VALUES (?, ?)");
        $stmt->bind_param("ss", $namaFile, $path);
        if ($stmt->execute()) {
            echo "Foto berhasil disimpan.";
        } else {
            echo "Gagal menyimpan ke database.";
        }
        $stmt->close();
    } else {
        echo "Gagal menyimpan file ke folder.";
    }
} else {
    echo "Tidak ada data foto.";
}

$conn->close();
?>

