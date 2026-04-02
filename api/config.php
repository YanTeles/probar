<?php
// Configuração Banco de Dados Hostinger
// ALTERE estas credenciais no Hostinger cPanel > MySQL Databases
$host = 'localhost';
$dbname = 'tabacaria_teste';  // pgAdmin: crie DB local PostgreSQL
$username = 'postgres';  // padrão pgAdmin
$password = '1234';  // sua senha pgAdmin

try {
$pdo = new PDO("pgsql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die('Erro conexão DB: ' . $e->getMessage());
}
?>

