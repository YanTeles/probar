<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Painel - Tabacaria Premium</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Montserrat', sans-serif; background: #f8f9fa; margin: 0; padding: 20px; }
    .admin-container { max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
    .admin-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
    .admin-header h1 { margin: 0; font-size: 2em; font-weight: 600; }
    .admin-form { padding: 40px; }
    .form-group { margin-bottom: 25px; }
    label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 0.95em; }
    input, select, textarea { width: 100%; padding: 14px; border: 2px solid #e1e5e9; border-radius: 8px; font-size: 1em; box-sizing: border-box; transition: border-color 0.3s; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #667eea; }
    .file-input { padding: 12px; background: #f8f9fa; }
    button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px 32px; border: none; border-radius: 8px; font-size: 1.1em; font-weight: 500; cursor: pointer; width: 100%; transition: transform 0.2s; }
    button:hover { transform: translateY(-2px); }
    .admin-link { position: fixed; top: 20px; right: 20px; background: #667eea; color: white; padding: 10px 15px; border-radius: 25px; text-decoration: none; font-weight: 500; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); z-index: 1000; }
    .admin-link:hover { background: #5a67d8; }
    .success { background: #48bb78; color: white; padding: 20px; border-radius: 8px; margin-top: 20px; display: none; text-align: center; }
    @media (max-width: 768px) { .admin-form { padding: 20px; } }
  </style>
</head>
<body>
  <a href="#" class="admin-link" onclick="toggleAdmin(event)" title="Admin">🔧</a>
  
  <div class="admin-container" id="admin-panel" style="display:none;">
    <div class="admin-header">
      <h1>🔧 Painel Admin</h1>
      <p>Adicionar/Editar Produtos</p>
    </div>
    <div class="admin-form">
      <form action="api/admin/add.php" method="POST" enctype="multipart/form-data">
        <div class="form-group">
          <label>Nome do Produto *</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Preço (R$) *</label>
          <input type="number" name="price" step="0.01" min="0" required>
        </div>
        <div class="form-group">
          <label>Categoria</label>
          <select name="category">
            <option value="acessório">Acessório</option>
            <option value="charuto">Charuto</option>
            <option value="narguilé">Narguilé</option>
            <option value="cigarro">Cigarro</option>
            <option value="cachimbo">Cachimbo</option>
          </select>
        </div>
        <div class="form-group">
          <label>Foto (JPG/PNG) *</label>
          <input type="file" name="photo" accept="image/jpeg,image/png" class="file-input" required>
        </div>
        <div class="form-group">
          <label>Descrição</label>
          <textarea name="desc" rows="4" placeholder="Detalhes do produto..."></textarea>
        </div>
        <button type="submit">➕ Adicionar Produto ao Catálogo</button>
      </form>
      <div class="success" id="success-msg">✅ Produto adicionado ao catálogo! Refresh para ver.</div>
    </div>
  </div>

  <script>
    function toggleAdmin(e) {
      e.preventDefault();
      const panel = document.getElementById('admin-panel');
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
    
    // Auto-hide success
    document.querySelector('form').onsubmit = () => {
      setTimeout(() => {
        document.getElementById('success-msg').style.display = 'block';
      }, 1000);
    };
  </script>
</body>
</html>

