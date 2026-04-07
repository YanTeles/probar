const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'tabacaria-super-secret-2024';

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// Multer for image upload
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
    else cb(new Error('Only JPG/PNG'), false);
  }
});

// Firebase Admin - use renamed service account
let db;
try {
  admin.initializeApp({
    credential: admin.credential.cert('./probar-da4e3-firebase-adminsdk-fbsvc-b099124f5b.json')
  });
  db = admin.firestore();
  console.log('✅ Firebase Admin conectado (Firestore + Storage)');
} catch (err) {
  console.error('❌ Firebase Admin erro:', err.message);
  process.exit(1);
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token necessário' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// API Routes
app.get('/api/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('created_at', 'desc').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    console.error('GET /api/products:', err);
    res.status(500).json({ error: 'Erro Firestore' });
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
    
    // Salva no Firestore
    await db.collection('products').add({
      name: name.trim(),
      price: parseFloat(price),
      img_filename: filename,
      category: category.trim(),
      desc: desc?.trim() || '',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, filename, message: '✅ Produto adicionado Firestore!' });
  } catch (err) {
    console.error('POST /api/admin/add:', err);
    res.status(500).json({ error: 'Erro upload/Firestore' });
  }
});

app.delete('/api/admin/delete/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection('products').doc(id).get();
    if (doc.exists) {
      const data = doc.data();
      // Delete local image
      if (data.img_filename) {
        await fs.unlink(`assets/produtos/${data.img_filename}`).catch(console.error);
      }
      await db.collection('products').doc(id).delete();
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Produto não encontrado' });
    }
  } catch (err) {
    console.error('DELETE /api/admin/delete:', err);
    res.status(500).json({ error: 'Erro delete' });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await db.collection('products').limit(1).get();
    res.json({ status: 'OK', db: 'Firebase Firestore conectado', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ error: 'Firestore erro', details: err.message });
  }
});

// Health + static fallback
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => {
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🔐 Login: POST /api/login {password: 'admin123'}`);
  console.log('✅ Sistema add products pronto!');
});
