<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Config DB Hostinger
$db_host = 'localhost';
$db_user = 'u180403631_probar';
$db_pass = $_ENV['DB_PASS'] ?: '@Probar1234';  // Use .env ou mude aqui
$db_name = 'u180403631_probar';

try {
  $pdo = new PDO(
    "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
    $db_user, $db_pass,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
} catch (PDOException $e) {
  http_response_code(500);
  exit(json_encode(['error' => 'DB conexão falhou: ' . $e->getMessage()]));
}

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
  case 'GET':
    if ($id) {
      // GET /api.php?id=123
      $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
      $stmt->execute([$id]);
      $product = $stmt->fetch(PDO::FETCH_ASSOC);
      echo json_encode($product ?: []);
    } else {
      // GET /api.php
      $stmt = $pdo->query('SELECT * FROM products ORDER BY created_at DESC');
      $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
      // Parse JSON imgs field
      foreach ($products as &$p) {
        $p['imgs'] = json_decode($p['imgs'] ?? '[]', true);
      }
      echo json_encode($products);
    }
    break;

  case 'POST':
    // POST /api.php {id,name,price,category,img,imgs,desc}
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['id'], $input['name'], $input['price'])) {
      http_response_code(400);
      exit(json_encode(['error' => 'Faltam id,name,price']));
    }

    $id = $input['id'];
    $name = $input['name'];
    $price = $input['price'];
    $category = $input['category'] ?? '';
    $img = $input['img'] ?? '';
    $imgs = isset($input['imgs']) ? json_encode($input['imgs']) : '[]';
    $desc = $input['desc'] ?? '';

    // UPSERT (insert or update)
    $stmt = $pdo->prepare('
      INSERT INTO products (id, name, price, category, img, imgs, `desc`) 
      VALUES (?, ?, ?, ?, ?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        name=VALUES(name), price=VALUES(price), category=VALUES(category), 
        img=VALUES(img), imgs=VALUES(imgs), `desc`=VALUES(`desc`)
    ');
    
    $stmt->execute([$id, $name, $price, $category, $img, $imgs, $desc]);
    echo json_encode(['success' => true, 'id' => $id]);
    break;

  case 'DELETE':
    if (!$id) {
      http_response_code(400);
      exit(json_encode(['error' => 'ID requerido']));
    }
    $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['success' => true, 'id' => $id]);
    break;

  default:
    http_response_code(405);
    exit(json_encode(['error' => 'Método não permitido']));
}
?>

