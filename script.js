let firebaseEnabled = false;
let db = null;

function isFirebaseConfigured() {
  return window.firebaseConfig && window.firebaseConfig.apiKey && !window.firebaseConfig.apiKey.includes('REPLACE');
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Configuração não preenchida. Usando fallback local.');
    return;
  }

  try {
    firebase.initializeApp(window.firebaseConfig);
    db = firebase.firestore();
    firebaseEnabled = true;
    console.log('[Firebase] inicializado com sucesso.');
  } catch (error) {
    console.warn('[Firebase] não pôde inicializar:', error);
    firebaseEnabled = false;
  }
}

let firestoreUnsubscribe = null;

async function loadProductsFromFirebase() {
  if (!firebaseEnabled || !db) return;

  try {
    const snapshot = await db.collection('products').get();
    if (!snapshot.empty) {
      adminProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: Number(doc.id) || Date.now(),
          name: data.name || '',
          price: parseFloat(data.price) || 0,
          category: data.category || '',
          img: data.img || 'assets/produtos/tabacaria.jpeg',
          imgs: data.imgs || [],
          desc: data.desc || ''
        };
      });
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
      console.log('[Firebase] produtos carregados do Firestore.');
    } else {
      console.log('[Firebase] coleção vazia; mantendo produtos locais/fallback.');
    }
  } catch (error) {
    console.warn('[Firebase] falha ao carregar produtos:', error);
  }
}

function subscribeToFirestoreProducts() {
  if (!firebaseEnabled || !db) return;
  if (firestoreUnsubscribe) firestoreUnsubscribe();

  firestoreUnsubscribe = db.collection('products').onSnapshot(snapshot => {
    if (!snapshot.empty) {
      adminProducts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: Number(doc.id) || Date.now(),
          name: data.name || '',
          price: parseFloat(data.price) || 0,
          category: data.category || '',
          img: data.img || 'assets/produtos/tabacaria.jpeg',
          imgs: data.imgs || [],
          desc: data.desc || ''
        };
      });
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
      console.log('[Firebase] produtos sincronizados em tempo real.');
      renderCatalog();
      renderProducts();
    } else {
      console.log('[Firebase] coleção vazia em tempo real; mantendo local.');
    }
  }, error => {
    console.warn('[Firebase] erro no snapshot do Firestore:', error);
  });
}

async function saveProductToFirebase(product) {
  if (!firebaseEnabled || !db) return;
  try {
    const id = String(product.id || Date.now());
    await db.collection('products').doc(id).set({
      name: product.name,
      price: product.price,
      category: product.category,
      img: product.img,
      imgs: product.imgs || [],
      desc: product.desc
    });
    console.log(`[Firebase] produto ${product.name} salvo em Firestore.`);
  } catch (error) {
    console.warn('[Firebase] falha ao salvar produto:', error);
  }
}

async function deleteProductFromFirebase(id) {
  if (!firebaseEnabled || !db) return;
  try {
    await db.collection('products').doc(String(id)).delete();
    console.log(`[Firebase] produto ${id} excluído do Firestore.`);
  } catch (error) {
    console.warn('[Firebase] falha ao excluir produto:', error);
  }
}

async function loadProducts() {
  initFirebase();
  await loadProductsFromFirebase();
  if (firebaseEnabled) {
    subscribeToFirestoreProducts();
    console.log('[Firebase] Listener real-time ativo');
  }
}

// =====================================================
// CATEGORIAS
// =====================================================
const CATEGORIES = [
  'Sedas',
  'Piteiras',
  'Acessórios',
  'Cigarros',
  'Cigarros de Palha',
  'Tabacos',
  'Charutos',
  'Narguilé'
];

function confirmAge(isAdult) {
  const gate = document.getElementById('age-gate');
  const mainSite = document.getElementById('main-site');
  const warning = document.getElementById('age-warning');
  
  if (isAdult) {
    gate.style.display = 'none';
    mainSite.classList.remove('hidden');
    mainSite.style.display = 'block';
  } else {
    gate.style.display = 'none';
    warning.style.display = 'flex';
  }
}

function toggleNavItem(dropId) {
  const drop = document.getElementById(dropId);
  if (drop) {
    drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
  }
}

function updateStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const minute = now.getMinutes();
  let isOpen = false;

  if (day >= 1 && day <= 5) {
    isOpen = hour >= 9 && (hour < 18 || (hour === 18 && minute === 0));
  } else if (day === 6) {
    isOpen = hour >= 9 && (hour < 12 || (hour === 12 && minute === 0));
  }

  const statusElements = [
    document.getElementById('store-status'),
    document.getElementById('store-status2')
  ].filter(Boolean);

  statusElements.forEach(el => {
    el.classList.remove('status-open', 'status-closed');
    if (isOpen) {
      el.classList.add('status-open');
      el.textContent = 'Aberto agora';
    } else {
      el.classList.add('status-closed');
      el.textContent = 'Fechado';
    }
  });
}

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel) panel.classList.toggle('open');
  if (overlay) overlay.classList.toggle('open');
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

let adminProducts = [];

// 🔥 FIX: Inicialização AUTOMÁTICA dos produtos
(function autoInitProducts() {
  console.log('🔥 AUTO-INIT: Verificando produtos...');
  
  // Garante que temos produtos
  if (adminProducts.length === 0) {
    console.log('⚠️ Sem produtos - criando defaults');
    const defaults = [
      { id: 1, name: 'Aleda Ouro', price: 25.00, category: 'Charutos', img: 'assets/produtos/aledaOuro.jpeg', imgs: [], desc: 'Charuto premium cubano' },
      { id: 2, name: 'Piteira BB Premium', price: 12.00, category: 'Piteiras', img: 'assets/produtos/piteira-bb-premium.jpeg', imgs: [], desc: 'Piteira para blunt' },
      { id: 3, name: 'King Herbal Wrap', price: 8.00, category: 'Sedas', img: 'assets/produtos/kingHerbalWrap.jpeg', imgs: [], desc: 'Wrap herbal' }
    ];
    adminProducts = defaults;
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  }
  
  // 🚀 RENDERIZA IMEDIATAMENTE
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        renderCatalog();
        console.log('✅ Catálogo renderizado no DOMContentLoaded');
      }, 100);
    });
  } else {
    // Já carregou
    setTimeout(renderCatalog, 50);
  }
  
  console.log('✅ AUTO-INIT completo:', adminProducts.length, 'produtos prontos');
})();

function openCheckout() {
  if (cartItems.length === 0) {
    alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
    return;
  }
  const panel = document.getElementById('cart-panel');
  if (panel && panel.classList.contains('open')) toggleCart();
  renderCheckoutSummary();
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function sendToWhatsApp() {
  if (cartItems.length === 0) {
    alert('Seu carrinho está vazio. Adicione produtos antes de enviar.');
    return;
  }

  const nome = document.getElementById('field-nome').value.trim();
  const cpf = document.getElementById('field-cpf').value.trim();
  const telefone = document.getElementById('field-telefone').value.trim();
  const endereco = document.getElementById('field-endereco').value.trim();

  const storeNumber = '5531995476577';
  const itemsText = cartItems.map(item => `- ${item.quantity}x ${item.name} (R$ ${item.price.toFixed(2).replace('.', ',')})`).join('\n');
  const totalText = formatBRL(getCartTotal());

  let message = `Olá, tenho interesse nos seguintes produtos:\n\n${itemsText}\n\nTotal: ${totalText}`;
  if (nome) message += `\n\nNome: ${nome}`;
  if (cpf) message += `\nCPF: ${cpf}`;
  if (telefone) message += `\nTelefone: ${telefone}`;
  if (endereco) message += `\nEndereço: ${endereco}`;

  const url = `https://wa.me/${storeNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

let adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');

function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function formatBRL(value) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function getCartCount() {
  return cartItems.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderCart() {
  const list = document.getElementById('cart-items-list');
  const badge = document.getElementById('hci-badge');
  const fabCount = document.getElementById('cart-fab-count');
  const totalPrice = document.getElementById('cart-total-price');

  if (badge) badge.textContent = getCartCount();
  if (fabCount) fabCount.textContent = getCartCount();
  if (totalPrice) totalPrice.textContent = formatBRL(getCartTotal());
  if (!list) return;

  if (cartItems.length === 0) {
    list.innerHTML = '<div class="cart-empty">Seu carrinho está vazio. Clique em um produto para adicioná-lo.</div>';
    return;
  }

  list.innerHTML = cartItems.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.name}</strong>
        <div class="cart-item-meta">${item.quantity}x • ${formatBRL(item.price)}</div>
      </div>
      <div class="cart-item-actions">
        <button class="cart-qty-btn" onclick="changeCartQuantity(${item.id}, -1)">−</button>
        <button class="cart-qty-btn" onclick="changeCartQuantity(${item.id}, 1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeCartQuantity(id, delta) {
  const item = cartItems.find(item => item.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cartItems = cartItems.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function addToCart(product) {
  const existing = cartItems.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ ...product, quantity: 1 });
  }
  saveCart();
  renderCart();
}

function removeCartItem(id) {
  cartItems = cartItems.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function renderCheckoutSummary() {
  const summary = document.getElementById('order-summary');
  if (!summary) return;
  if (cartItems.length === 0) {
    summary.innerHTML = '<p>Adicione produtos ao carrinho antes de finalizar.</p>';
    return;
  }
  summary.innerHTML = cartItems.map(item => `
    <div class="summary-line">
      <span>${item.quantity}x ${item.name}</span>
      <strong>${formatBRL(item.price * item.quantity)}</strong>
    </div>
  `).join('') + `
    <div class="summary-total">
      <span>Total</span>
      <strong>${formatBRL(getCartTotal())}</strong>
    </div>
  `;
}

if (adminProducts.length === 0) {
  adminProducts = [
    { id: 1,  name: 'Aleda Ouro',        price: 25.00, category: 'Charutos',        img: 'assets/produtos/aledaOuro.jpeg',         imgs: [], desc: 'Charuto premium cubano' },
    { id: 2,  name: 'Aleda LTD',         price: 30.00, category: 'Charutos',        img: 'assets/produtos/aleda-ltd.jpeg',          imgs: [], desc: 'Edição limitada' },
    { id: 3,  name: 'Blunt King Brown',  price: 15.00, category: 'Cigarros',        img: 'assets/produtos/bb-brown-1.jpeg',         imgs: [], desc: 'Cigarro artesanal' },
    { id: 4,  name: 'Cinzeiro Tonabe',   price: 20.00, category: 'Acessórios',      img: 'assets/produtos/cinzeiro-tonabe.jpeg',    imgs: [], desc: 'Cinzeiro de cerâmica' },
    { id: 5,  name: 'Piteira BB Premium',price: 12.00, category: 'Piteiras',        img: 'assets/produtos/piteira-bb-premium.jpeg', imgs: [], desc: 'Piteira para blunt' },
    { id: 6,  name: 'Zomo Black',        price: 18.00, category: 'Narguilé',        img: 'assets/produtos/zomo-black.jpeg',         imgs: [], desc: 'Tabaco para narguilé' },
    { id: 7,  name: 'King Herbal Wrap',  price:  8.00, category: 'Sedas',           img: 'assets/produtos/kingHerbalWrap.jpeg',     imgs: [], desc: 'Wrap herbal' },
    { id: 8,  name: 'Puff Life',         price: 10.00, category: 'Cigarros de Palha', img: 'assets/produtos/puff-life.jpeg',        imgs: [], desc: 'Cigarro premium' },
    { id: 9,  name: 'Zomo Pink',         price: 22.00, category: 'Tabacos',         img: 'assets/produtos/zomo-pink.jpeg',          imgs: [], desc: 'Tabaco aromatizado' },
    { id: 10, name: 'Rolling Machine',   price: 50.00, category: 'Acessórios',      img: 'assets/produtos/rollingMachine.jpeg',     imgs: [], desc: 'Máquina de enrolar' }
  ];
  localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
}

// =====================================================
// ADMIN MODAL
// =====================================================

// Armazena as fotos extras do formulário de adição
let _adminPendingImgs = [];

function toggleAdminModal() {
  if (!adminLoggedIn) {
    const pass = prompt('Senha Admin:', '');
    if (pass !== 'admin123') {
      alert('Senha incorreta');
      return;
    }
    adminLoggedIn = true;
    localStorage.setItem('adminLoggedIn', 'true');
  }

  if (document.getElementById('adminModal')) return;

  _adminPendingImgs = [];

  const categoryOptions = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');

  const modal = document.createElement('div');
  modal.id = 'adminModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto;';
  modal.innerHTML = `
    <style>
      #adminModal .admin-modal-box { width: min(720px, 100%); max-height: 92vh; overflow: auto; }
      #adminModal .admin-panel-header { display:flex;justify-content:space-between;gap:1rem;align-items:center;margin-bottom:1.75rem; }
      #adminModal .admin-panel-header h2 { margin:0; color:#f8fafc; font-size:1.95rem; }
      #adminModal .admin-panel-header p { margin:0; color:#94a3b8; font-size:0.95rem; }
      #adminModal .admin-panel-actions { display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:flex-end; }
      #adminModal .admin-panel-actions button { border:none; border-radius:0.85rem; padding:0.75rem 1rem; font-weight:700; cursor:pointer; }
      #adminModal .admin-panel-actions .logout-btn { background:#ef4444; color:white; }
      #adminModal .admin-panel-actions .close-btn { background:rgba(255,255,255,0.08); color:#e2e8f0; font-size:1.2rem; width:42px; height:42px; }
      #adminModal .admin-panel-block { border-radius:1.75rem; background:#0d1117; border:1px solid rgba(255,255,255,0.09); padding:1.75rem; box-shadow:0 22px 70px rgba(0,0,0,0.3); }
      #adminModal .admin-panel-block + .admin-panel-block { margin-top:1.5rem; }
      #adminModal .admin-panel-block h3 { margin:0 0 1rem 0; color:#10b981; font-size:1.25rem; }
      #adminModal .admin-panel-block form { display:grid; gap:1rem; }
      #adminModal .admin-panel-block .field-row { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
      #adminModal .admin-input,
      #adminModal .admin-select,
      #adminModal .admin-textarea { width:100%; border-radius:1rem; border:1px solid rgba(255,255,255,0.08); background:#111827; color:#e2e8f0; padding:1rem 1.1rem; font-size:0.96rem; outline:none; box-sizing:border-box; }
      #adminModal .admin-input:focus,
      #adminModal .admin-select:focus,
      #adminModal .admin-textarea:focus { border-color:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,0.14); }

      /* Upload área multi-foto */
      #adminModal .upload-zone {
        border: 2px dashed rgba(16,185,129,0.4);
        border-radius: 1.2rem;
        background: rgba(16,185,129,0.04);
        padding: 1.5rem;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
      }
      #adminModal .upload-zone:hover { border-color:#10b981; background: rgba(16,185,129,0.09); }
      #adminModal .upload-zone .uz-icon { font-size: 2rem; margin-bottom: 0.5rem; }
      #adminModal .upload-zone p { color:#94a3b8; margin:0; font-size:0.9rem; }
      #adminModal .upload-zone span { color:#10b981; font-weight:700; }

      /* Grid de thumbnails */
      #adminModal .photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 0.75rem;
        margin-top: 0.75rem;
      }
      #adminModal .photo-thumb {
        position: relative;
        aspect-ratio: 1;
        border-radius: 0.85rem;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.1);
        background: #090b10;
      }
      #adminModal .photo-thumb img {
        width: 100%; height: 100%; object-fit: cover;
      }
      #adminModal .photo-thumb .thumb-remove {
        position: absolute; top: 4px; right: 4px;
        width: 22px; height: 22px;
        background: rgba(239,68,68,0.85);
        border: none; border-radius: 50%;
        color: white; font-size: 0.75rem; font-weight: 700;
        cursor: pointer; display: flex; align-items: center; justify-content: center;
        line-height: 1;
      }
      #adminModal .photo-thumb .thumb-badge {
        position: absolute; bottom: 4px; left: 4px;
        background: rgba(16,185,129,0.9);
        color: white; font-size: 0.65rem; font-weight: 700;
        padding: 2px 6px; border-radius: 999px;
      }

      #adminModal .admin-submit { width:100%; border-radius:1.5rem; border:none; background:#0f766e; color:#f8fafc; font-weight:800; padding:1.15rem 1.35rem; font-size:1.03rem; display:inline-flex; align-items:center; justify-content:center; gap:0.75rem; transition:transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease; box-shadow:0 18px 32px rgba(16,185,129,0.18); cursor:pointer; }
      #adminModal .admin-submit:hover { background:#10b981; transform:scale(1.02); box-shadow:0 24px 40px rgba(16,185,129,0.32); }
      #adminModal .products-list-header { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:1rem; margin-bottom:1rem; }
      #adminModal .products-list-header .badge { display:inline-flex; align-items:center; gap:0.5rem; padding:0.65rem 0.95rem; border-radius:999px; background:rgba(212,175,55,0.14); border:1px solid rgba(212,175,55,0.22); color:#f8e6ad; font-size:0.85rem; }
      #adminModal .products-grid { display:grid; gap:1rem; max-height:330px; overflow:auto; }
      #adminModal .product-row { display:grid; grid-template-columns:72px 1fr auto; gap:1rem; align-items:center; padding:1rem; border-radius:1.25rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); }
      #adminModal .product-row img { width:72px; height:72px; object-fit:cover; border-radius:1rem; }
      #adminModal .product-info h4 { margin:0; color:white; font-size:1rem; }
      #adminModal .product-info p { margin:0.45rem 0 0; color:#94a3b8; font-size:0.9rem; line-height:1.4; }
      #adminModal .product-meta { display:flex; flex-wrap:wrap; gap:0.5rem; color:#a3e635; font-size:0.85rem; }
      #adminModal .product-actions { display:flex; flex-direction:column; gap:0.5rem; }
      #adminModal .action-btn { border:none; border-radius:0.95rem; padding:0.65rem 0.85rem; cursor:pointer; font-weight:700; font-size:0.85rem; transition:transform 0.2s ease; }
      #adminModal .action-btn:hover { transform:translateY(-1px); }
      #adminModal .action-btn.edit { background:rgba(16,185,129,0.14); color:#a7f3d0; }
      #adminModal .action-btn.delete { background:rgba(239,68,68,0.18); color:#fecaca; }
      @media (max-width: 720px) {
        #adminModal .admin-panel-block { padding:1.25rem; }
        #adminModal .admin-panel-header { flex-direction:column; align-items:flex-start; }
        #adminModal .products-grid { max-height:none; }
        #adminModal .product-row { grid-template-columns:1fr; }
        #adminModal .product-actions { flex-direction:row; }
        #adminModal .admin-panel-block .field-row { grid-template-columns:1fr; }
      }
    </style>
    <div class="admin-modal-box">
      <div class="admin-panel-header">
        <div>
          <h2>Painel Admin</h2>
          <p>Gerencie produtos com uma interface premium escura e moderna.</p>
        </div>
        <div class="admin-panel-actions">
          <button class="logout-btn" onclick="logoutAdmin()">Sair</button>
          <button class="close-btn" onclick="closeAdminModal()">×</button>
        </div>
      </div>

      <div class="admin-panel-block">
        <h3>+ Novo Produto</h3>
        <form id="addForm">
          <input id="ap-name" class="admin-input" placeholder="Nome do produto" required />
          <div class="field-row">
            <input id="ap-price" class="admin-input" type="number" step="0.01" placeholder="Preço R$" required />
            <select id="ap-category" class="admin-select">
              ${categoryOptions}
            </select>
          </div>

          <!-- Upload multi-foto -->
          <div>
            <div class="upload-zone" id="ap-upload-zone">
              <div class="uz-icon">🖼️</div>
              <p>Arraste imagens aqui ou <span>clique para selecionar</span></p>
              <p style="font-size:0.8rem;margin-top:0.35rem;">Múltiplas fotos permitidas — a primeira será a capa</p>
            </div>
            <input id="ap-photos" type="file" accept="image/*" multiple style="display:none;" />
            <div class="photos-grid" id="ap-photos-grid"></div>
          </div>

          <textarea id="ap-desc" class="admin-textarea" placeholder="Descrição (opcional)" rows="4"></textarea>
          <button type="submit" class="admin-submit"><span style="font-size:1.4rem;line-height:1;">+</span>Adicionar Produto</button>
        </form>
      </div>

      <div class="admin-panel-block">
        <div class="products-list-header">
          <div>
            <h3>Produtos Cadastrados</h3>
            <p id="admin-product-count">${adminProducts.length} produtos disponíveis</p>
          </div>
          <span class="badge">Premium</span>
        </div>
        <div class="products-grid" id="productsList"></div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  // Clique fora fecha
  modal.addEventListener('click', (e) => {
    if (e.target.id === 'adminModal') closeAdminModal();
  });

  // Upload zone → dispara input
  document.getElementById('ap-upload-zone').addEventListener('click', () => {
    document.getElementById('ap-photos').click();
  });

  // Drag & drop
  const zone = document.getElementById('ap-upload-zone');
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#10b981'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.style.borderColor = '';
    handleAdminPhotoFiles(e.dataTransfer.files);
  });

  // Seleção via input
  document.getElementById('ap-photos').addEventListener('change', (e) => {
    handleAdminPhotoFiles(e.target.files);
    e.target.value = ''; // reset para permitir re-selecionar mesmo arquivo
  });

  // Submit
  document.getElementById('addForm').onsubmit = (e) => {
    e.preventDefault();
    if (_adminPendingImgs.length === 0) {
      alert('Adicione ao menos uma foto para o produto.');
      return;
    }
    const newProduct = {
      id: Date.now(),
      name: document.getElementById('ap-name').value.trim(),
      price: parseFloat(document.getElementById('ap-price').value),
      category: document.getElementById('ap-category').value,
      img: _adminPendingImgs[0],
      imgs: [..._adminPendingImgs],
      desc: document.getElementById('ap-desc').value.trim()
    };
    adminProducts.push(newProduct);
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    if (firebaseEnabled) saveProductToFirebase(newProduct);
    alert('✅ Produto adicionado com sucesso!');
    _adminPendingImgs = [];
    renderAdminPhotoGrid();
    document.getElementById('addForm').reset();
    renderProducts();
  };

  renderProducts();
}

function handleAdminPhotoFiles(files) {
  const fileArray = Array.from(files);
  let loaded = 0;
  fileArray.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      _adminPendingImgs.push(ev.target.result);
      loaded++;
      if (loaded === fileArray.filter(f => f.type.startsWith('image/')).length) {
        renderAdminPhotoGrid();
      }
    };
    reader.readAsDataURL(file);
  });
}

function renderAdminPhotoGrid() {
  const grid = document.getElementById('ap-photos-grid');
  if (!grid) return;
  if (_adminPendingImgs.length === 0) {
    grid.innerHTML = '';
    return;
  }
  grid.innerHTML = _adminPendingImgs.map((src, i) => `
    <div class="photo-thumb">
      <img src="${src}" alt="Foto ${i + 1}" />
      ${i === 0 ? '<span class="thumb-badge">Capa</span>' : ''}
      <button class="thumb-remove" onclick="removeAdminPendingPhoto(${i})" title="Remover">×</button>
    </div>
  `).join('');
}

function removeAdminPendingPhoto(index) {
  _adminPendingImgs.splice(index, 1);
  renderAdminPhotoGrid();
}

function renderProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  const countEl = document.getElementById('admin-product-count');
  if (countEl) countEl.textContent = `${adminProducts.length} produtos disponíveis`;

  list.innerHTML = adminProducts.map(p => `
    <div class="product-row">
      <img src="${p.img}" alt="${p.name}" />
      <div class="product-info">
        <div class="product-meta">R$ ${p.price.toFixed(2).replace('.', ',')} · ${p.category}${p.imgs && p.imgs.length > 1 ? ` · ${p.imgs.length} fotos` : ''}</div>
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
      </div>
      <div class="product-actions">
        <button class="action-btn delete" onclick="deleteProduct(${p.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

function deleteProduct(id) {
  adminProducts = adminProducts.filter(p => p.id !== id);
  localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  if (firebaseEnabled) deleteProductFromFirebase(id);
  renderProducts();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
  adminLoggedIn = false;
  localStorage.removeItem('adminLoggedIn');
  _adminPendingImgs = [];
}

function logoutAdmin() {
  closeAdminModal();
}

// =====================================================
// CATÁLOGO
// =====================================================

function renderCatalog(products = adminProducts) {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  if (products.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#888;">Nenhum produto encontrado.</div>';
    return;
  }

  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x300/333/fff?text=Produto'">
      </div>
      <div class="product-body">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
          <button type="button" class="add-btn" onclick="event.stopPropagation(); addToCartById(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');

  animateCards();
}

function addToCartById(id) {
  const product = adminProducts.find(p => p.id === id);
  if (product) {
    addToCart(product);
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel && !cartPanel.classList.contains('open')) toggleCart();
  }
}

function animateCards() {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('card-visible');
    card.classList.add('reveal');
  });
}

// =====================================================
// MODAL DE VISUALIZAÇÃO DO PRODUTO (com carrossel)

