<?php
session_start();
include "koneksi.php";

// Aktifkan error reporting untuk debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email    = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    // Cegah SQL Injection (opsional untuk sistem sederhana)
    $email = mysqli_real_escape_string($conn, $email);
    $password = mysqli_real_escape_string($conn, $password);

    $query = "SELECT * FROM users WHERE email='$email' AND password='$password'";
    $result = mysqli_query($conn, $query);

    if (mysqli_num_rows($result) === 1) {
        $user = mysqli_fetch_assoc($result);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        echo "Login berhasil. Selamat datang, " . $user['username'] . "!";
        header("Location: index.html"); // Redirect jika ada halaman dashboard
        // exit();
    } else {
        echo "Email atau password salah.";
    }
} else {
    header("Location: login.html");
    exit();
}
?>
