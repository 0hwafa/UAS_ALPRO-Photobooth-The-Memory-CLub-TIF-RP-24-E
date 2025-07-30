<?php
include "koneksi.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username         = $_POST['username'];
    $email            = $_POST['email'];
    $password         = $_POST['password'];
  
    // Cek apakah email sudah digunakan
    $cek = mysqli_query($conn, "SELECT * FROM users WHERE email='$email'");
    if (mysqli_num_rows($cek) > 0) {
        echo "<script>
                alert('Email sudah terdaftar!');
                window.history.back();
              </script>";
        exit();
    }

    // Insert data
    $query  = "INSERT INTO users (username, email, password) VALUES ('$username', '$email', '$password')";
    $insert = mysqli_query($conn, $query);

    if ($insert) {
        echo "<script>
                alert('Pendaftaran berhasil!');
                window.location.href = 'login.html';
              </script>";
        exit();
    } else {
        echo "<script>
                alert('Pendaftaran gagal: " . mysqli_error($conn) . "');
                window.history.back();
              </script>";
    }
}
?>
