<?php
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);

if (!isset($input['image'])) {
    echo json_encode(['status' => 'error', 'message' => 'No image data.']);
    exit;
}

$imageData = $input['image'];
$imageData = str_replace('data:image/png;base64,', '', $imageData);
$imageData = str_replace(' ', '+', $imageData);
$decodedData = base64_decode($imageData);

$folder = 'uploads/';
if (!is_dir($folder)) mkdir($folder, 0777, true);

$filename = $folder . uniqid('photo_') . '.png';

if (file_put_contents($filename, $decodedData)) {

    // ✅ Jalankan simpan_semua_foto.php setelah gambar berhasil disimpan
    include 'simpan_semua_foto.php';

    // ✅ Kembalikan respon JSON seperti biasa
    echo json_encode(['status' => 'success', 'filename' => $filename]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to save image.']);
}
?>
