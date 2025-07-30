<?php
$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => 'Koneksi gagal']));
}

if (!isset($_POST['id'])) {
    die(json_encode(['status' => 'error', 'message' => 'ID tidak ditemukan']));
}

$id = intval($_POST['id']);

// Ambil path file sebelum dihapus
$sql = "SELECT path FROM foto WHERE id_foto = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $filePath = $row['path'];

    // Hapus dari database
    $delete = $conn->prepare("DELETE FROM foto WHERE id_foto = ?");
    $delete->bind_param("i", $id);
    if ($delete->execute()) {
        // Hapus file dari folder
        if (file_exists($filePath)) {
            unlink($filePath);
        }
        echo json_encode(['status' => 'success', 'message' => 'Foto berhasil dihapus']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Gagal menghapus dari database']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Foto tidak ditemukan']);
}

$conn->close();
?>
