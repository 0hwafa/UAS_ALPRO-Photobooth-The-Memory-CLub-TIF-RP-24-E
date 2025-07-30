<?php
header('Content-Type: application/json');

$host = "localhost";
$user = "root";
$pass = "";
$db   = "database_photobooth";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Koneksi gagal']);
    exit;
}

$sql = "SELECT * FROM foto ORDER BY id_foto DESC";
$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'id' => $row['id_foto'],
        'nama_foto' => $row['nama_foto'],
        'path' => $row['path']
    ];
}

$conn->close();
echo json_encode($data);
