const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tabacaria-super-secret-2024';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// TODO: MOVER static para FINAL após todas rotas
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  express.static('.')(req, res, next);
});

// Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'assets/produtos/'),
  filename: (req, file, cb) => {
    const unique = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) + path.extname(file.originalname);
    cb(null, unique);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') cb(null, true);
    else cb(new Error('Only JPG/PNG allowed'), false);
  }
});

// Firebase Admin
let dbFirebase;
try {
  if (fs.existsSync('serviceAccountKey.json')) {
    admin.initializeApp({
      credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
    dbFirebase = admin.firestore();
    console.log('✅ Firebase Admin OK');
  } else {
    console.log('⚠️ serviceAccountKey.json não encontrado - Admin limitado');
  }
} catch (err) {
  console.log('❌ Firebase erro:', err.message);
}

// Fallback pool (apagar depois)
let pool;
try {
  pool = require('./db.js');
} catch (e) {
  console.log('ℹ️ db.js não encontrado (Firebase modo)');
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    let products = [];
    if (dbFirebase) {
      const snapshot = await dbFirebase.collection('products').orderBy('created_at', 'desc').get();
      products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else if (pool) {
      const result = await pool.query(`
        SELECT id, name, price, img_filename, category, "desc" as desc 
        FROM products ORDER BY created_at DESC
      `);
      products = result.rows;
    }
    res.json(products);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.json([]);
  }
});

app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Senha inválida' });
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.post('/api/admin/add', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    const { name, price, category, desc } = req.body;
    if (!name || !price || !req.file || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const filename = req.file.filename;
    
    if (dbFirebase) {
      await dbFirebase.collection('products').add({
        name: name.trim(),
        price: parseFloat(price),
        img_filename: filename,
        category: category.trim(),
        desc: desc?.trim() || '',
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
      res.json({ success: true, message: '✅ Firebase OK' });
    } else if (pool) {
      const query = `
        INSERT INTO products (name, price, img_filename, category, "desc") 
        VALUES ($1, $2, $3, $4, $5) RETURNING *
      `;
      await pool.query(query, [name.trim(), parseFloat(price), filename, category.trim(), desc?.trim() || '']);
      res.json({ success: true, message: '✅ Postgres OK' });
    } else {
      res.status(503).json({ error: 'Nenhum DB configurado' });
    }
  } catch (err) {
    console.error('POST /api/admin/add:', err);
    res.status(500).json({ error: 'Erro servidor' });
  }
});

app.delete('/api/admin/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbFirebase) {
      const doc = await dbFirebase.collection('products').doc(id).get();
      if (doc.exists) {
        const data = doc.data();
        if (data.img_filename) fs.unlink(`assets/produtos/${data.img_filename}`, () => {});
        await dbFirebase.collection('products').doc(id).delete();
      }
    } else if (pool) {
      const result = await pool.query('SELECT img_filename FROM products WHERE id = $1', [id]);
      if (result.rows.length) {
        const filename = result.rows[0].img_filename;
        fs.unlink(`assets/produtos/${filename}`, () => {});
        await pool.query('DELETE FROM products WHERE id = $1', [id]);
      }
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/admin/delete:', err);
    res.status(500).json({ error: 'Erro delete' });
  }
});

app.get('/api/health', async (req, res) => {
  const status = {
    status: 'OK',
    firebase: !!dbFirebase,
    postgres: !!pool
  };
  if (dbFirebase) status.db = 'Firebase';
  else if (pool) status.db = 'Postgres';
  else status.db = 'None';
  res.json(status);
});

app.listen(PORT, () => {
  console.log(`🚀 http://localhost:${PORT}`);
  console.log(`📊 /api/health`);
  console.log(`📦 /api/products`);
  console.log(dbFirebase ? '✅ Firebase FULL' : '⚠️ Fallback/None');
});
