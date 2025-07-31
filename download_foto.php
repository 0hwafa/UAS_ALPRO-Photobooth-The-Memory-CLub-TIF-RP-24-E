<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Koneksi database gagal: " . $conn->connect_error);
}

// Validasi parameter ID
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    die("ID foto tidak valid");
}

$id = intval($_GET['id']);

// Ambil informasi file dari database
$sql = "SELECT * FROM foto WHERE id_foto = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    die("Foto tidak ditemukan");
}

$row = $result->fetch_assoc();
$filePath = $row['path'];
$fileName = $row['nama_foto'];

// Periksa apakah file ada di server
if (!file_exists($filePath)) {
    die("File tidak ditemukan di server");
}

// Tentukan tipe MIME berdasarkan ekstensi file
$fileExtension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
$mimeTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif',
    'webp' => 'image/webp'
];

$mimeType = isset($mimeTypes[$fileExtension]) ? $mimeTypes[$fileExtension] : 'application/octet-stream';

// Bersihkan nama file untuk download
$downloadName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);
if (empty($downloadName)) {
    $downloadName = "photo_" . $id . "." . $fileExtension;
}

// Set header untuk download
header('Content-Description: File Transfer');
header('Content-Type: ' . $mimeType);
header('Content-Disposition: attachment; filename="' . $downloadName . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate');
header('Pragma: public');
header('Content-Length: ' . filesize($filePath));

// Bersihkan output buffer sebelum mengirim file
ob_clean();
flush();

// Kirim file ke browser
readfile($filePath);

$conn->close();
exit;
?>