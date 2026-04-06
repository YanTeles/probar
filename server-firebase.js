const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tabacaria-super-secret-2024';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

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

// Firebase Admin init (with Postgres fallback detection)
let db, storage, isFirebaseReady = false;
try {
  if (fs.existsSync('serviceAccountKey.json')) {
    admin.initializeApp({
      credential: admin.credential.cert(require('./serviceAccountKey.json'))
    });
    db = admin.firestore();
    storage = admin.storage();
    isFirebaseReady = true;
    console.log('✅ Firebase Admin inicializado (Firestore + Storage)');
  } else {
    console.log('⚠️ serviceAccountKey.json não encontrado. MODO FALLBACK: apenas serve static (frontend direto Firebase)');
  }
} catch (err) {
  console.log('❌ Firebase erro:', err.message);
  console.log('🔄 Fallback: apenas frontend');
}

// Fallback db.js import (apagar depois)
let pool;
try {
  pool = require('./db.js');
} catch {}

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

// Rotas (Firebase preferencial)
app.get('/api/products', async (req, res) => {
  try {
    if (isFirebaseReady) {
      const snapshot = await db.collection('products').orderBy('created_at', 'desc').get();
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(products);
    } else if (pool) {
      const result = await pool.query('SELECT id, name, price, img_filename, category, \"desc\" FROM products ORDER BY created_at DESC');
      res.json(result.rows);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('GET products error:', err);
    res.json([]);
  }
});

app.post('/api/login', async (req, res) => {
  const { password } = req.body;
  if (password !== 'admin123') return res.status(401).json({ error: 'Senha inválida' });
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// Admin add (Firebase)
app.post('/api/admin/add', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!isFirebaseReady) return res.status(503).json({ error: 'Firebase não configurado. Baixe serviceAccountKey.json' });
    
    const { name, price, category, desc } = req.body;
    if (!name || !price || !req.file || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Dados inválidos' });
    }

    const filename = req.file.filename;
    
    // Salva no Firestore
    await db.collection('products').add({
      name: name.trim(),
      price: parseFloat(price),
      img_filename: filename,
      category: category.trim(),
      desc: desc?.trim() || '',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, message: 'Produto adicionado no Firestore!' });
  } catch (err) {
    console.error('POST add error:', err);
    res.status(500).json({ error: 'Erro upload/Firestore' });
  }
});

// Admin delete (Firebase)
app.delete('/api/admin/delete/:id', authenticateToken, async (req, res) => {
  try {
    if (!isFirebaseReady) return res.status(503).json({ error: 'Firebase não configurado' });
    
    const { id } = req.params;
    const doc = await db.collection('products').doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      // Delete file local (assets ainda usado frontend)
      if (data.img_filename) {
        fs.unlink(`assets/produtos/${data.img_filename}`, () => {});
      }
      await db.collection('products').doc(id).delete();
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro delete' });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    if (isFirebaseReady) {
      await db.collection('products').limit(1).get();
      res.json({ status: 'OK', db: 'Firebase Firestore connected' });
    } else if (pool) {
      await pool.query('SELECT 1');
      res.json({ status: 'OK', db: 'Postgres fallback' });
    } else {
      res.json({ status: 'OK', db: 'Static only (no DB)' });
    }
  } catch (err) {
    res.status(500).json({ status: 'DB error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(isFirebaseReady ? '✅ Firebase FULL modo' : '⚠️ MODO FALLBACK (baixe serviceAccountKey.json)');
});
