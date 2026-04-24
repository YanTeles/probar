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
let _pendingWrite = false; // flag global, fora da função

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
      console.log('[Firebase] produtos carregados do Firestore.');
    } else {
      adminProducts = [];
      console.log('[Firebase] coleção vazia; sem fallback local.');
    }
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    renderCatalog();
    renderProducts();
  } catch (error) {
    console.warn('[Firebase] falha ao carregar produtos:', error);
  }
}

function subscribeToFirestoreProducts() {
  if (!firebaseEnabled || !db) return;
  if (firestoreUnsubscribe) firestoreUnsubscribe();

  firestoreUnsubscribe = db.collection('products').onSnapshot(snapshot => {
    // Se há uma escrita em andamento, ignora este snapshot intermediário
    if (_pendingWrite) return;

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
    } else {
      adminProducts = [];
    }
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    console.log('[Firebase] produtos sincronizados em tempo real.');
    renderCatalog();
    renderProducts();
  }, error => {
    console.warn('[Firebase] erro no snapshot do Firestore:', error);
  });
}

async function saveProductToFirebase(product) {
  if (!firebaseEnabled || !db) return;
  try {
    _pendingWrite = true; // bloqueia o listener durante a escrita
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
  } finally {
    _pendingWrite = false; // libera o listener após a escrita confirmar
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
  'Narguilé',
  'Isqueiros',
  'Bombonieres',
  'Bebidas',
  'Incensos'
];

const AGE_VERIFIED_KEY = 'colmeiaAgeVerified';

function confirmAge(isAdult) {
  const gate = document.getElementById('age-gate');
  const mainSite = document.getElementById('main-site');
  const warning = document.getElementById('age-warning');

  if (isAdult) {
    try {
      localStorage.setItem(AGE_VERIFIED_KEY, 'yes');
    } catch (e) { /* modo privado etc. */ }
    if (gate) gate.style.display = 'none';
    if (mainSite) {
      mainSite.classList.remove('hidden');
      mainSite.style.display = 'block';
    }
  } else {
    if (gate) gate.style.display = 'none';
    if (warning) warning.style.display = 'flex';
  }
}

function initAgeGate() {
  const gate = document.getElementById('age-gate');
  const mainSite = document.getElementById('main-site');
  const warning = document.getElementById('age-warning');
  if (!gate || !mainSite) return;

  let verified = false;
  try {
    verified = localStorage.getItem(AGE_VERIFIED_KEY) === 'yes';
  } catch (e) { verified = false; }

  if (warning) warning.style.display = 'none';

  if (verified) {
    gate.style.display = 'none';
    mainSite.classList.remove('hidden');
    mainSite.style.display = 'block';
    return;
  }

  gate.style.display = 'flex';
  mainSite.classList.add('hidden');
  mainSite.style.display = 'none';
}

function toggleNavItem(dropId) {
  const drop = document.getElementById(dropId);
  if (drop) {
    drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
  }
}

function toggleNav() {
  const drawer = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer || !hamburger) return;

  const isOpen = !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeNav() {
  const drawer = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer || !hamburger) return;

  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.classList.remove('nav-open');
  document.body.style.overflow = '';
}

function toggleDrawerSub(button) {
  if (!button) return;
  const subMenu = button.nextElementSibling;
  if (!subMenu || !subMenu.classList.contains('drawer-sub')) return;

  const isOpen = subMenu.classList.toggle('open');
  button.classList.toggle('open', isOpen);
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

let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');

/** Filtro ativo na vitrine (valor do botão / mega menu). */
let catalogCategory = 'all';

function stripDiacritics(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getFilteredCatalogProducts() {
  let list = adminProducts.slice();
  if (catalogCategory && catalogCategory !== 'all') {
    const needle = stripDiacritics(catalogCategory);
    list = list.filter(p => {
      const cat = stripDiacritics(p.category || '');
      return cat === needle || cat.includes(needle);
    });
  }
  const input = document.getElementById('product-search');
  const raw = input && input.value ? input.value.trim() : '';
  if (raw) {
    const q = stripDiacritics(raw);
    list = list.filter(p =>
      stripDiacritics(p.name || '').includes(q) ||
      stripDiacritics(p.category || '').includes(q) ||
      stripDiacritics(p.desc || '').includes(q)
    );
  }
  return list;
}

function filterProducts(tag, btnEl) {
  catalogCategory = tag || 'all';
  document.querySelectorAll('.catalog-filters .filter-btn').forEach(b => b.classList.remove('active'));
  if (btnEl && btnEl.classList) {
    btnEl.classList.add('active');
  }
  renderCatalog();
}

function handleSearch() {
  renderCatalog();
}

function loadMoreProducts() {
  /* Reservado: o grid já lista todos os produtos filtrados. */
}

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

/** Evita que `<`, `>` etc. na descrição/nome quebrem o HTML (innerHTML) ou “sumam” no modal. */
function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
        <strong>${escapeHtml(item.name)}</strong>
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
      <span>${item.quantity}x ${escapeHtml(item.name)}</span>
      <strong>${formatBRL(item.price * item.quantity)}</strong>
    </div>
  `).join('') + `
    <div class="summary-total">
      <span>Total</span>
      <strong>${formatBRL(getCartTotal())}</strong>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', async () => {
  initAgeGate();

  const drawer = document.getElementById('nav-drawer');
  if (drawer && drawer.parentElement !== document.body) {
    // Move o drawer para fora do header para evitar bugs de empilhamento/containing block.
    document.body.appendChild(drawer);
  }

  renderCart();
  updateStoreStatus();

  const drawerLinks = document.querySelectorAll('#nav-drawer a');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeNav();
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  // Render imediato com cache local e sincroniza com Firestore em seguida.
  renderCatalog();
  await loadProducts();
});

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
    renderCatalog();
  };

  renderProducts();
}

function handleAdminPhotoFiles(files) {
  const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (fileArray.length === 0) return;
  let loaded = 0;

  fileArray.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        _adminPendingImgs.push(canvas.toDataURL('image/jpeg', 0.75));
        loaded++;
        if (loaded === fileArray.length) renderAdminPhotoGrid();
      };
      img.src = ev.target.result;
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
      <img src="${escapeHtml(src)}" alt="Foto ${i + 1}" />
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
      <img src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" />
      <div class="product-info">
        <div class="product-meta">R$ ${p.price.toFixed(2).replace('.', ',')} · ${escapeHtml(p.category)}${p.imgs && p.imgs.length > 1 ? ` · ${p.imgs.length} fotos` : ''}</div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.desc)}</p>
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
  renderCatalog();
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

function renderCatalog(products) {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const list = products === undefined ? getFilteredCatalogProducts() : products;

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#888;">Nenhum produto encontrado.</div>';
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${escapeHtml(p.img)}" alt="${escapeHtml(p.name)}" onerror="this.src='https://via.placeholder.com/300x300/333/fff?text=Produto'">
      </div>
      <div class="product-body">
        <div class="product-cat">${escapeHtml(p.category)}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
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
// =====================================================
function toggleProduct(id) {
  const product = adminProducts.find((p) => p.id === id);
  if (!product) return;
  openProductModal(product);
}

function openProductModal(product) {
  closeProductModal();

  const overlay = document.createElement('div');
  overlay.id = 'product-modal';
  overlay.className = 'modal-overlay open';

  const gallery = (product.imgs && product.imgs.length > 0) ? product.imgs : [product.img];
  const safeDesc = (product.desc && product.desc.trim())
    ? escapeHtml(product.desc)
    : escapeHtml('Produto premium disponível em nossa tabacaria.');
  const hasMultipleImages = gallery.length > 1;

  overlay.innerHTML = `
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-handle"></div>
      <div class="modal-header" style="padding-bottom:0.5rem;">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.category)}</p>
      </div>
      <div class="modal-body" style="padding-top:0.5rem;">
        <div style="position:relative;">
          <img id="product-modal-image" src="${escapeHtml(gallery[0])}" alt="${escapeHtml(product.name)}" style="width:100%;height:260px;object-fit:cover;border-radius:14px;border:1px solid #5b7fa622;" />
          ${hasMultipleImages ? `
            <button id="product-modal-prev" type="button" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:999px;background:rgba(0,0,0,0.55);color:#fff;cursor:pointer;font-size:1rem;">‹</button>
            <button id="product-modal-next" type="button" style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:999px;background:rgba(0,0,0,0.55);color:#fff;cursor:pointer;font-size:1rem;">›</button>
            <div id="product-modal-counter" style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.55);color:#fff;padding:0.2rem 0.5rem;border-radius:999px;font-size:0.75rem;">1/${gallery.length}</div>
          ` : ''}
        </div>
        <p style="margin-top:1rem;line-height:1.7;color:var(--text-muted);font-size:1rem;">${safeDesc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.2rem;gap:0.8rem;">
          <strong style="font-family:'Playfair Display',serif;font-size:1.35rem;color:var(--gold);">R$ ${product.price.toFixed(2).replace('.', ',')}</strong>
          <button type="button" class="btn-primary" onclick="addToCartById(${product.id})">Adicionar ao carrinho</button>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeProductModal();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  if (hasMultipleImages) {
    let currentImageIndex = 0;
    const imageEl = document.getElementById('product-modal-image');
    const counterEl = document.getElementById('product-modal-counter');
    const prevBtn = document.getElementById('product-modal-prev');
    const nextBtn = document.getElementById('product-modal-next');

    const updateImage = () => {
      imageEl.src = gallery[currentImageIndex];
      if (counterEl) counterEl.textContent = `${currentImageIndex + 1}/${gallery.length}`;
    };

    prevBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      currentImageIndex = (currentImageIndex - 1 + gallery.length) % gallery.length;
      updateImage();
    });

    nextBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      currentImageIndex = (currentImageIndex + 1) % gallery.length;
      updateImage();
    });
  }
}

function closeProductModal() {
  const modal = document.getElementById('product-modal');
  if (modal) modal.remove();
  document.body.style.overflow = '';
}
