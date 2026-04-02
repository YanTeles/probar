<?php
require '../config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $price = floatval($_POST['price']);
    $category = trim($_POST['category']);
    $desc = trim($_POST['desc'] ?? '');

    if (empty($name) || $price <= 0 || empty($_FILES['photo']['name'])) {
        die('Dados inválidos!');
    }

    // Upload foto
    $photo = $_FILES['photo'];
    $allowed = ['image/jpeg', 'image/png'];
    if (!in_array($photo['type'], $allowed) || $photo['size'] > 5*1024*1024) {
        die('Foto inválida! JPG/PNG até 5MB.');
    }

    $ext = pathinfo($photo['name'], PATHINFO_EXTENSION);
    $filename = 'prod_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $upload_path = '../assets/produtos/' . $filename;

    if (!move_uploaded_file($photo['tmp_name'], $upload_path)) {
        die('Erro ao salvar foto!');
    }

    // Insert DB
$stmt = $pdo->prepare('INSERT INTO products (name, price, img_filename, category, "desc") VALUES (?, ?, ?, ?, ?)'); 
    $stmt->execute([$name, $price, $filename, $category, $desc]);

    header('Location: index.html?success=1');
    exit;
}
?>

