require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// =====================================================
// MIDDLEWARE
// =====================================================
app.use(cors());
app.use(express.json({ limit: '50mb' })); // permite imagens base64 grandes
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// =====================================================
// STATIC FILES
// =====================================================
app.use(express.static(path.join(__dirname)));

// =====================================================
// MYSQL POOL
// =====================================================
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});

// =====================================================
// INIT DB
// =====================================================
async function initDB() {
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id          BIGINT PRIMARY KEY,
        name        VARCHAR(255) NOT NULL,
        price       DECIMAL(10,2) NOT NULL,
        category    VARCHAR(100),
        img         LONGTEXT,
        imgs        JSON,
        \`desc\`    TEXT,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('[DB] Tabela "products" verificada/criada com sucesso.');
  } catch (err) {
    console.error('[DB] Erro ao criar/verificar tabela:', err.message);
  }
}

// =====================================================
// API ROUTES
// =====================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Listar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, price, category, img, imgs, `desc`, created_at FROM products ORDER BY created_at DESC'
    );
    // Parse JSON field if driver returned it as string
    const products = rows.map(r => ({
      ...r,
      imgs: typeof r.imgs === 'string' ? JSON.parse(r.imgs) : r.imgs
    }));
    res.json(products);
  } catch (err) {
    console.error('[API] GET /api/products erro:', err.message);
    res.status(500).json({ error: 'Erro ao buscar produtos.', detail: err.message });
  }
});

// Criar ou atualizar produto
app.post('/api/products', async (req, res) => {
  const { id, name, price, category, img, imgs, desc } = req.body;

  if (!id || !name || price == null) {
    return res.status(400).json({ error: 'Campos obrigatórios: id, name, price.' });
  }

  try {
    const [existing] = await pool.execute('SELECT id FROM products WHERE id = ?', [id]);

    if (existing.length > 0) {
      // UPDATE
      await pool.execute(
        'UPDATE products SET name=?, price=?, category=?, img=?, imgs=?, `desc`=? WHERE id=?',
        [
          name,
          price,
          category || '',
          img || '',
          JSON.stringify(imgs || []),
          desc || '',
          id
        ]
      );
      res.json({ success: true, message: 'Produto atualizado.', id });
    } else {
      // INSERT
      await pool.execute(
        'INSERT INTO products (id, name, price, category, img, imgs, `desc`) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          id,
          name,
          price,
          category || '',
          img || '',
          JSON.stringify(imgs || []),
          desc || ''
        ]
      );
      res.json({ success: true, message: 'Produto criado.', id });
    }
  } catch (err) {
    console.error('[API] POST /api/products erro:', err.message);
    res.status(500).json({ error: 'Erro ao salvar produto.', detail: err.message });
  }
});

// Deletar produto
app.delete('/api/products/:id', async (req, res) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Produto excluído.', id: req.params.id });
  } catch (err) {
    console.error('[API] DELETE erro:', err.message);
    res.status(500).json({ error: 'Erro ao excluir produto.', detail: err.message });
  }
});

// =====================================================
// START
// =====================================================
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] API rodando em http://localhost:${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
  });
});

