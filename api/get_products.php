<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
require 'config.php';

try {
    $stmt = $pdo->query("SELECT id, name, price, img_filename, category, \"desc\" FROM products ORDER BY created_at DESC");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    // Se DB vazio, retorna array vazio (JS lida com fallback)
    echo json_encode($products, JSON_UNESCAPED_UNICODE);
} catch(PDOException $e) {
    echo json_encode([], JSON_UNESCAPED_UNICODE);
}
?>

