const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db.js');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tabacaria-super-secret-2024';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve index.html, assets, etc.

// Multer upload config (mirror PHP)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'assets/produtos/'),
  filename: (req, file, cb) => {
    const unique = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) + path.extname(file.originalname);
    cb(null, unique);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true);
    else cb(new Error('Only JPG/PNG allowed'), false);
  }
});

// ===== API ROUTES (mirror PHP) =====

// GET /api/products → JSON products (like get_products.php)
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, price, img_filename, category, "desc" 
      FROM products 
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('GET products error:', err);
    res.json([]); // Empty array like PHP
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Senha inválida' });
  
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// Protected routes
app.post('/api/admin/add', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { name, price, category, desc } = req.body;
    
    if (!name || !price || !req.file || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const filename = req.file.filename;
    const query = `
      INSERT INTO products (name, price, img_filename, category, "desc") 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [name.trim(), parseFloat(price), filename, category.trim(), desc?.trim() || ''];
    
    await pool.query(query, values);
    
    res.json({ success: true, message: 'Produto adicionado!' });
  } catch (err) {
    console.error('POST add error:', err);
    res.status(500).json({ error: 'Erro upload/DB' });
  }
});

// DELETE /api/admin/delete (futuro)
app.delete('/api/admin/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT img_filename FROM products WHERE id = $1', [id]);
    if (result.rows.length) {
      const filename = result.rows[0].img_filename;
      fs.unlink(`assets/produtos/${filename}`, () => {});
    }
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro delete' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', db: 'connected' });
  } catch {
    res.status(500).json({ status: 'DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
});

