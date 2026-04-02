<?php
require 'api/config.php';
echo "Conexão OK!<br>";
$stmt = $pdo->query("SELECT COUNT(*) FROM products");
echo "Tabela products existe: " . $stmt->fetchColumn() . " produtos.";
?>

