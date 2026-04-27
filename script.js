// =====================================================
// FIREBASE
// =====================================================
let firebaseEnabled = false;
let db = null;

function isFirebaseConfigured() {
  return window.firebaseConfig &&
    window.firebaseConfig.apiKey &&
    !window.firebaseConfig.apiKey.includes('REPLACE');
}

function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Config ausente. Modo local ativado.');
    return;
  }
  try {
    firebase.initializeApp(window.firebaseConfig);
    db = firebase.firestore();
    firebaseEnabled = true;
    console.log('[Firebase] OK.');
  } catch (e) {
    console.warn('[Firebase] Falha ao inicializar:', e);
  }
}

let firestoreUnsubscribe = null;
let _pendingWrite = false;
let _snapshotDebounce = null;

function _mapDoc(doc) {
  const d = doc.data();
  return {
    id: Number(doc.id) || Date.now(),
    name:     d.name     || '',
    price:    parseFloat(d.price) || 0,
    category: d.category || '',
    img:      d.img      || 'assets/produtos/tabacaria.jpeg',
    imgs:     d.imgs     || [],
    desc:     d.desc     || ''
  };
}

function subscribeFirestore() {
  return new Promise((resolve) => {
    if (!firebaseEnabled || !db) { resolve(); return; }
    if (firestoreUnsubscribe) firestoreUnsubscribe();

    let resolved = false;

    firestoreUnsubscribe = db.collection('products').onSnapshot(
      { includeMetadataChanges: true },
      (snap) => {
        const fromServer = !snap.metadata.fromCache;

        if (!resolved) {
          if (!fromServer) {
            console.log('[Firebase] Cache local ignorado, aguardando servidor...');
            return;
          }
          resolved = true;

          if (!snap.empty) {
            adminProducts = snap.docs.map(_mapDoc);
            _saveLocal();
            console.log('[Firebase] Carregado do servidor:', adminProducts.length, 'produtos.');
          } else {
            console.warn('[Firebase] Servidor respondeu vazio — mantendo localStorage.');
          }

          renderCatalog();
          renderProducts();
          resolve();
          return;
        }

        if (_pendingWrite || !fromServer) return;
        if (snap.empty) return;

        const docs = snap.docs.map(_mapDoc);
        clearTimeout(_snapshotDebounce);
        _snapshotDebounce = setTimeout(() => {
          if (_pendingWrite) return;
          adminProducts = docs;
          _saveLocal();
          console.log('[Firebase] Sincronizado:', adminProducts.length, 'produtos.');
          renderCatalog();
          renderProducts();
        }, 400);
      },
      (err) => {
        console.warn('[Firebase] Erro no listener:', err);
        if (!resolved) { resolved = true; resolve(); }
      }
    );

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[Firebase] Timeout — usando dados locais.');
        resolve();
      }
    }, 8000);
  });
}

async function uploadImageToStorage(base64, filename) {
  const ref = firebase.storage().ref(`products/${filename}`);
  await ref.putString(base64, 'data_url');
  return await ref.getDownloadURL();
}

async function saveProductToFirebase(product) {
  if (!firebaseEnabled || !db) return;
  try {
    _pendingWrite = true;
    const id = String(product.id);
    const srcs = (product.imgs && product.imgs.length > 0) ? product.imgs : [product.img];

    const urls = await Promise.all(srcs.map(async (src, i) => {
      if (src && src.startsWith('data:')) {
        return await uploadImageToStorage(src, `${id}_${i}_${Date.now()}.jpg`);
      }
      return src;
    }));

    product.img  = urls[0];
    product.imgs = urls;

    const idx = adminProducts.findIndex(p => p.id === product.id);
    if (idx !== -1) adminProducts[idx] = { ...product };
    _saveLocal();

    await db.collection('products').doc(id).set({
      name: product.name, price: product.price,
      category: product.category, img: urls[0],
      imgs: urls, desc: product.desc
    });

    console.log('[Firebase] Produto salvo:', product.name);
    renderCatalog();
    renderProducts();
  } catch (e) {
    console.warn('[Firebase] Erro ao salvar:', e);
    alert('Erro ao salvar imagem. Verifique as regras do Firebase Storage.');
  } finally {
    setTimeout(() => { _pendingWrite = false; }, 2500);
  }
}

async function deleteProductFromFirebase(id) {
  if (!firebaseEnabled || !db) return;
  try {
    _pendingWrite = true;
    await db.collection('products').doc(String(id)).delete();
    console.log('[Firebase] Produto excluído:', id);
  } catch (e) {
    console.warn('[Firebase] Erro ao excluir:', e);
  } finally {
    setTimeout(() => { _pendingWrite = false; }, 2500);
  }
}

async function loadProducts() {
  initFirebase();
  if (firebaseEnabled) {
    await subscribeFirestore();
  }
}

// =====================================================
// HELPERS
// =====================================================
function _saveLocal() {
  try {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  } catch (e) {
    console.warn('[localStorage] Falha ao salvar:', e);
  }
}

function _loadLocal() {
  try {
    const raw = localStorage.getItem('adminProducts');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[localStorage] JSON corrompido:', e);
    return [];
  }
}

// =====================================================
// CATEGORIAS
// =====================================================
const CATEGORIES = [
  'Sedas', 'Piteiras', 'Acessórios', 'Cigarros', 'Cigarros de Palha',
  'Tabacos', 'Charutos', 'Narguilé', 'Isqueiros', 'Bombonieres',
  'Bebidas', 'Incensos'
];

// =====================================================
// ESTADO GLOBAL
// =====================================================
let adminProducts  = _loadLocal();
let catalogCategory = 'all';
let adminLoggedIn   = localStorage.getItem('adminLoggedIn') === 'true';

let cartItems = [];
try {
  const raw = localStorage.getItem('cartItems');
  if (raw) { const p = JSON.parse(raw); if (Array.isArray(p)) cartItems = p; }
} catch (e) { cartItems = []; }

// =====================================================
// AGE GATE — sempre aparece ao carregar a página
// =====================================================
function _setBodyScroll(locked) {
  document.body.classList.toggle('age-locked', locked);
}

function _trapFocus(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const focusables = container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusables.length === 0) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  first.focus();
  container._focusTrap = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  container.addEventListener('keydown', container._focusTrap);
}

function _untrapFocus(containerId) {
  const container = document.getElementById(containerId);
  if (container && container._focusTrap) {
    container.removeEventListener('keydown', container._focusTrap);
    delete container._focusTrap;
  }
}

function confirmAge(isAdult) {
  const gate     = document.getElementById('age-gate');
  const mainSite = document.getElementById('main-site');
  const warning  = document.getElementById('age-warning');
  if (isAdult) {
    // Não salva no localStorage — gate sempre aparece na próxima visita
    if (gate)     gate.style.display = 'none';
    if (warning)  warning.style.display = 'none';
    if (mainSite) {
      mainSite.classList.remove('hidden');
      mainSite.style.display = 'block';
    }
    _setBodyScroll(false);
    _untrapFocus('age-gate');
  } else {
    if (gate)    gate.style.display    = 'none';
    if (warning) warning.style.display = 'flex';
    _setBodyScroll(true);
    _untrapFocus('age-gate');
    _trapFocus('age-warning');
  }
}

function resetAgeGate() {
  const gate     = document.getElementById('age-gate');
  const warning  = document.getElementById('age-warning');
  if (warning) warning.style.display = 'none';
  if (gate) {
    gate.style.display = 'flex';
    _trapFocus('age-gate');
  }
  _setBodyScroll(true);
}

function initAgeGate() {
  const gate     = document.getElementById('age-gate');
  const mainSite = document.getElementById('main-site');
  const warning  = document.getElementById('age-warning');
  if (!gate || !mainSite) return;

  if (warning) warning.style.display = 'none';

  // Sempre exibe o gate — sem verificar localStorage
  gate.style.display = 'flex';
  mainSite.classList.add('hidden');
  mainSite.style.display = 'none';
  _setBodyScroll(true);
  _trapFocus('age-gate');

  // Impede fechar com ESC
  document.addEventListener('keydown', function ageEsc(e) {
    if (e.key === 'Escape' && gate && gate.style.display !== 'none') {
      e.preventDefault();
    }
  });
}

// =====================================================
// NAV
// =====================================================
function toggleNavItem(dropId) {
  const drop = document.getElementById(dropId);
  if (drop) drop.style.display = drop.style.display === 'none' ? 'block' : 'none';
}

function toggleNav() {
  const drawer    = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer || !hamburger) return;
  const isOpen = !drawer.classList.contains('open');
  drawer.classList.toggle('open', isOpen);
  hamburger.classList.toggle('open', isOpen);
  document.body.classList.toggle('nav-open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeNav() {
  const drawer    = document.getElementById('nav-drawer');
  const hamburger = document.getElementById('hamburger');
  if (!drawer || !hamburger) return;
  drawer.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.classList.remove('nav-open');
  document.body.style.overflow = '';
}

function toggleDrawerSub(button) {
  if (!button) return;
  const sub = button.nextElementSibling;
  if (!sub || !sub.classList.contains('drawer-sub')) return;
  const isOpen = sub.classList.toggle('open');
  button.classList.toggle('open', isOpen);
}

// =====================================================
// LOJA — STATUS
// =====================================================
function updateStoreStatus() {
  const now    = new Date();
  const day    = now.getDay();
  const hour   = now.getHours();
  const minute = now.getMinutes();
  let isOpen   = false;
  if (day >= 1 && day <= 5)
    isOpen = hour >= 9 && (hour < 18 || (hour === 18 && minute === 0));
  else if (day === 6)
    isOpen = hour >= 9 && (hour < 12 || (hour === 12 && minute === 0));

  [document.getElementById('store-status'), document.getElementById('store-status2')]
    .filter(Boolean)
    .forEach(el => {
      el.classList.remove('status-open', 'status-closed');
      if (isOpen) { el.classList.add('status-open');   el.textContent = 'Aberto agora'; }
      else        { el.classList.add('status-closed');  el.textContent = 'Fechado'; }
    });
}

// =====================================================
// CARRINHO
// =====================================================
function saveCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
}

function getCartCount() { return cartItems.reduce((s, i) => s + i.quantity, 0); }
function getCartTotal() { return cartItems.reduce((s, i) => s + i.price * i.quantity, 0); }

function formatBRL(v) { return `R$ ${v.toFixed(2).replace('.', ',')}`; }

function escapeHtml(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}

function renderCart() {
  const count = getCartCount();
  ['hci-badge', 'cart-count', 'cart-fab-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });
  const totalEl = document.getElementById('cart-total-price');
  if (totalEl) totalEl.textContent = formatBRL(getCartTotal());

  const list = document.getElementById('cart-items-list');
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
        <button class="cart-qty-btn" onclick="changeCartQuantity(${item.id},  1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeCartQuantity(id, delta) {
  const item = cartItems.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cartItems = cartItems.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function addToCart(product) {
  const ex = cartItems.find(i => i.id === product.id);
  if (ex) { ex.quantity += 1; }
  else    { cartItems.push({ ...product, quantity: 1 }); }
  saveCart(); renderCart();
}

function removeCartItem(id) {
  cartItems = cartItems.filter(i => i.id !== id);
  saveCart(); renderCart();
}

function toggleCart() {
  document.getElementById('cart-panel')?.classList.toggle('open');
  document.getElementById('cart-overlay')?.classList.toggle('open');
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
      <span>Total</span><strong>${formatBRL(getCartTotal())}</strong>
    </div>`;
}

function openCheckout() {
  if (cartItems.length === 0) { alert('Seu carrinho está vazio.'); return; }
  const panel = document.getElementById('cart-panel');
  if (panel?.classList.contains('open')) toggleCart();
  renderCheckoutSummary();
  const modal = document.getElementById('checkout-modal');
  if (modal) { modal.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

function closeCheckout() {
  document.getElementById('checkout-modal')?.classList.remove('open');
  document.body.style.overflow = '';
}

function sendToWhatsApp() {
  if (cartItems.length === 0) { alert('Seu carrinho está vazio.'); return; }
  const nome     = document.getElementById('field-nome')?.value.trim()    || '';
  const cpf      = document.getElementById('field-cpf')?.value.trim()     || '';
  const telefone = document.getElementById('field-telefone')?.value.trim()|| '';
  const endereco = document.getElementById('field-endereco')?.value.trim()|| '';
  const storeNumber = '5531995476577';
  const itens = cartItems.map(i =>
    `- ${i.quantity}x ${i.name} (R$ ${i.price.toFixed(2).replace('.', ',')})`
  ).join('\n');
  let msg = `Olá, tenho interesse nos seguintes produtos:\n\n${itens}\n\nTotal: ${formatBRL(getCartTotal())}`;
  if (nome)     msg += `\n\nNome: ${nome}`;
  if (cpf)      msg += `\nCPF: ${cpf}`;
  if (telefone) msg += `\nTelefone: ${telefone}`;
  if (endereco) msg += `\nEndereço: ${endereco}`;
  window.open(`https://wa.me/${storeNumber}?text=${encodeURIComponent(msg)}`, '_blank');
}

// =====================================================
// CATÁLOGO — FILTROS E BUSCA
// =====================================================
function stripDiacritics(str) {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getFilteredCatalogProducts() {
  let list = adminProducts.slice();
  if (catalogCategory && catalogCategory !== 'all') {
    const needle = stripDiacritics(catalogCategory);
    list = list.filter(p => stripDiacritics(p.category || '').includes(needle));
  }
  const input = document.getElementById('product-search');
  const raw   = input?.value?.trim() || '';
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
  if (btnEl?.classList) btnEl.classList.add('active');
  renderCatalog();
}

function handleSearch()      { renderCatalog(); }
function loadMoreProducts()  {}

// =====================================================
// CATÁLOGO — RENDER
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
        <img class="product-img"
          src="${escapeHtml(p.img)}"
          alt="${escapeHtml(p.name)}"
          onerror="this.src='https://via.placeholder.com/300x300/333/fff?text=Produto'">
      </div>
      <div class="product-body">
        <div class="product-cat">${escapeHtml(p.category)}</div>
        <div class="product-name">${escapeHtml(p.name)}</div>
        <div class="product-footer">
          <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
          <button type="button" class="add-btn"
            onclick="event.stopPropagation(); addToCartById(${p.id})">+</button>
        </div>
      </div>
    </div>
  `).join('');
  animateCards();
}

function addToCartById(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;
  addToCart(product);
  const panel = document.getElementById('cart-panel');
  if (panel && !panel.classList.contains('open')) toggleCart();
}

function animateCards() {
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.animationDelay = `${i * 0.1}s`;
    card.classList.add('card-visible', 'reveal');
  });
}

// =====================================================
// MODAL DE PRODUTO
// =====================================================
function toggleProduct(id) {
  const product = adminProducts.find(p => p.id === id);
  if (product) openProductModal(product);
}

function openProductModal(product) {
  closeProductModal();
  const overlay  = document.createElement('div');
  overlay.id     = 'product-modal';
  overlay.className = 'modal-overlay open';
  const gallery  = (product.imgs?.length > 0) ? product.imgs : [product.img];
  const safeDesc = (product.desc?.trim())
    ? escapeHtml(product.desc)
    : 'Produto premium disponível em nossa tabacaria.';
  const multi = gallery.length > 1;

  overlay.innerHTML = `
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-handle"></div>
      <div class="modal-header" style="padding-bottom:0.5rem;">
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.category)}</p>
      </div>
      <div class="modal-body" style="padding-top:0.5rem;">
        <div style="position:relative;">
          <img id="product-modal-image"
            src="${escapeHtml(gallery[0])}"
            alt="${escapeHtml(product.name)}"
            style="width:100%;aspect-ratio:1;object-fit:contain;border-radius:14px;border:1px solid #5b7fa622;background:#f5f5f5;" />
          ${multi ? `
            <button id="product-modal-prev" type="button"
              style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:999px;background:rgba(0,0,0,0.55);color:#fff;cursor:pointer;font-size:1rem;">‹</button>
            <button id="product-modal-next" type="button"
              style="position:absolute;right:10px;top:50%;transform:translateY(-50%);width:34px;height:34px;border:none;border-radius:999px;background:rgba(0,0,0,0.55);color:#fff;cursor:pointer;font-size:1rem;">›</button>
            <div id="product-modal-counter"
              style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.55);color:#fff;padding:0.2rem 0.5rem;border-radius:999px;font-size:0.75rem;">
              1/${gallery.length}
            </div>` : ''}
        </div>
        <p style="margin-top:1rem;line-height:1.7;color:var(--text-muted);font-size:1rem;">${safeDesc}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:1.2rem;gap:0.8rem;">
          <strong style="font-family:'Playfair Display',serif;font-size:1.35rem;color:var(--gold);">
            R$ ${product.price.toFixed(2).replace('.', ',')}
          </strong>
          <button type="button" class="btn-primary" onclick="addToCartById(${product.id})">
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>`;

  overlay.addEventListener('click', e => { if (e.target === overlay) closeProductModal(); });
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  if (multi) {
    let idx = 0;
    const imgEl     = document.getElementById('product-modal-image');
    const counterEl = document.getElementById('product-modal-counter');
    const update    = () => {
      imgEl.src = gallery[idx];
      if (counterEl) counterEl.textContent = `${idx + 1}/${gallery.length}`;
    };
    document.getElementById('product-modal-prev').addEventListener('click', e => {
      e.stopPropagation(); idx = (idx - 1 + gallery.length) % gallery.length; update();
    });
    document.getElementById('product-modal-next').addEventListener('click', e => {
      e.stopPropagation(); idx = (idx + 1) % gallery.length; update();
    });
  }
}

function closeProductModal() {
  document.getElementById('product-modal')?.remove();
  document.body.style.overflow = '';
}

// =====================================================
// ADMIN MODAL
// =====================================================
let _adminPendingImgs = [];

function toggleAdminModal() {
  if (!adminLoggedIn) {
    const pass = prompt('Senha Admin:', '');
    if (pass !== 'admin123') { alert('Senha incorreta'); return; }
    adminLoggedIn = true;
    localStorage.setItem('adminLoggedIn', 'true');
  }
  if (document.getElementById('adminModal')) return;
  _adminPendingImgs = [];

  const catOpts = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
  const modal   = document.createElement('div');
  modal.id      = 'adminModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto;';

  modal.innerHTML = `
    <style>
      #adminModal .admin-modal-box{width:min(720px,100%);max-height:92vh;overflow:auto}
      #adminModal .admin-panel-header{display:flex;justify-content:space-between;gap:1rem;align-items:center;margin-bottom:1.75rem}
      #adminModal .admin-panel-header h2{margin:0;color:#f8fafc;font-size:1.95rem}
      #adminModal .admin-panel-header p{margin:0;color:#94a3b8;font-size:.95rem}
      #adminModal .admin-panel-actions{display:flex;gap:.75rem;flex-wrap:wrap;justify-content:flex-end}
      #adminModal .admin-panel-actions button{border:none;border-radius:.85rem;padding:.75rem 1rem;font-weight:700;cursor:pointer}
      #adminModal .logout-btn{background:#ef4444;color:#fff}
      #adminModal .close-btn{background:rgba(255,255,255,.08);color:#e2e8f0;font-size:1.2rem;width:42px;height:42px}
      #adminModal .admin-panel-block{border-radius:1.75rem;background:#0d1117;border:1px solid rgba(255,255,255,.09);padding:1.75rem;box-shadow:0 22px 70px rgba(0,0,0,.3)}
      #adminModal .admin-panel-block+.admin-panel-block{margin-top:1.5rem}
      #adminModal .admin-panel-block h3{margin:0 0 1rem;color:#10b981;font-size:1.25rem}
      #adminModal .admin-panel-block form{display:grid;gap:1rem}
      #adminModal .field-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem}
      #adminModal .admin-input,#adminModal .admin-select,#adminModal .admin-textarea{width:100%;border-radius:1rem;border:1px solid rgba(255,255,255,.08);background:#111827;color:#e2e8f0;padding:1rem 1.1rem;font-size:.96rem;outline:none;box-sizing:border-box}
      #adminModal .admin-input:focus,#adminModal .admin-select:focus,#adminModal .admin-textarea:focus{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.14)}
      #adminModal .upload-zone{border:2px dashed rgba(16,185,129,.4);border-radius:1.2rem;background:rgba(16,185,129,.04);padding:1.5rem;text-align:center;cursor:pointer;transition:border-color .2s,background .2s}
      #adminModal .upload-zone:hover{border-color:#10b981;background:rgba(16,185,129,.09)}
      #adminModal .upload-zone .uz-icon{font-size:2rem;margin-bottom:.5rem}
      #adminModal .upload-zone p{color:#94a3b8;margin:0;font-size:.9rem}
      #adminModal .upload-zone span{color:#10b981;font-weight:700}
      #adminModal .photos-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(90px,1fr));gap:.75rem;margin-top:.75rem}
      #adminModal .photo-thumb{position:relative;aspect-ratio:1;border-radius:.85rem;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:#090b10}
      #adminModal .photo-thumb img{width:100%;height:100%;object-fit:cover}
      #adminModal .thumb-remove{position:absolute;top:4px;right:4px;width:22px;height:22px;background:rgba(239,68,68,.85);border:none;border-radius:50%;color:#fff;font-size:.75rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center}
      #adminModal .thumb-badge{position:absolute;bottom:4px;left:4px;background:rgba(16,185,129,.9);color:#fff;font-size:.65rem;font-weight:700;padding:2px 6px;border-radius:999px}
      #adminModal .admin-submit{width:100%;border-radius:1.5rem;border:none;background:#0f766e;color:#f8fafc;font-weight:800;padding:1.15rem 1.35rem;font-size:1.03rem;display:inline-flex;align-items:center;justify-content:center;gap:.75rem;transition:transform .22s,background .22s,box-shadow .22s;box-shadow:0 18px 32px rgba(16,185,129,.18);cursor:pointer}
      #adminModal .admin-submit:hover{background:#10b981;transform:scale(1.02);box-shadow:0 24px 40px rgba(16,185,129,.32)}
      #adminModal .products-list-header{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem}
      #adminModal .products-list-header .badge{display:inline-flex;align-items:center;gap:.5rem;padding:.65rem .95rem;border-radius:999px;background:rgba(212,175,55,.14);border:1px solid rgba(212,175,55,.22);color:#f8e6ad;font-size:.85rem}
      #adminModal .products-grid{display:grid;gap:1rem;max-height:330px;overflow:auto}
      #adminModal .product-row{display:grid;grid-template-columns:72px 1fr auto;gap:1rem;align-items:center;padding:1rem;border-radius:1.25rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08)}
      #adminModal .product-row img{width:72px;height:72px;object-fit:cover;border-radius:1rem}
      #adminModal .product-info h4{margin:0;color:#fff;font-size:1rem}
      #adminModal .product-info p{margin:.45rem 0 0;color:#94a3b8;font-size:.9rem;line-height:1.4}
      #adminModal .product-meta{display:flex;flex-wrap:wrap;gap:.5rem;color:#a3e635;font-size:.85rem}
      #adminModal .product-actions{display:flex;flex-direction:column;gap:.5rem}
      #adminModal .action-btn{border:none;border-radius:.95rem;padding:.65rem .85rem;cursor:pointer;font-weight:700;font-size:.85rem;transition:transform .2s}
      #adminModal .action-btn:hover{transform:translateY(-1px)}
      #adminModal .action-btn.delete{background:rgba(239,68,68,.18);color:#fecaca}
      @media(max-width:720px){
        #adminModal .admin-panel-block{padding:1.25rem}
        #adminModal .admin-panel-header{flex-direction:column;align-items:flex-start}
        #adminModal .products-grid{max-height:none}
        #adminModal .product-row{grid-template-columns:1fr}
        #adminModal .product-actions{flex-direction:row}
        #adminModal .field-row{grid-template-columns:1fr}
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
          <button class="close-btn"  onclick="closeAdminModal()">×</button>
        </div>
      </div>

      <div class="admin-panel-block">
        <h3>+ Novo Produto</h3>
        <form id="addForm">
          <input id="ap-name" class="admin-input" placeholder="Nome do produto" required />
          <div class="field-row">
            <input id="ap-price" class="admin-input" type="number" step="0.01" placeholder="Preço R$" required />
            <select id="ap-category" class="admin-select">${catOpts}</select>
          </div>
          <div>
            <div class="upload-zone" id="ap-upload-zone">
              <div class="uz-icon">🖼️</div>
              <p>Arraste imagens aqui ou <span>clique para selecionar</span></p>
              <p style="font-size:.8rem;margin-top:.35rem;">Múltiplas fotos — a primeira será a capa</p>
            </div>
            <input id="ap-photos" type="file" accept="image/*" multiple style="display:none;" />
            <div class="photos-grid" id="ap-photos-grid"></div>
          </div>
          <textarea id="ap-desc" class="admin-textarea" placeholder="Descrição (opcional)" rows="4"></textarea>
          <button type="submit" class="admin-submit">
            <span style="font-size:1.4rem;line-height:1;">+</span>Adicionar Produto
          </button>
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
    </div>`;

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';

  modal.addEventListener('click', e => { if (e.target.id === 'adminModal') closeAdminModal(); });

  const zone = document.getElementById('ap-upload-zone');
  zone.addEventListener('click', () => document.getElementById('ap-photos').click());
  zone.addEventListener('dragover',  e => { e.preventDefault(); zone.style.borderColor = '#10b981'; });
  zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.style.borderColor = '';
    handleAdminPhotoFiles(e.dataTransfer.files);
  });

  document.getElementById('ap-photos').addEventListener('change', e => {
    handleAdminPhotoFiles(e.target.files); e.target.value = '';
  });

  document.getElementById('addForm').onsubmit = e => {
    e.preventDefault();
    if (_adminPendingImgs.length === 0) { alert('Adicione ao menos uma foto.'); return; }
    const newProduct = {
      id:       Date.now(),
      name:     document.getElementById('ap-name').value.trim(),
      price:    parseFloat(document.getElementById('ap-price').value),
      category: document.getElementById('ap-category').value,
      img:      _adminPendingImgs[0],
      imgs:     [..._adminPendingImgs],
      desc:     document.getElementById('ap-desc').value.trim()
    };
    adminProducts.push(newProduct);
    _saveLocal();
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
  const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (!arr.length) return;
  let done = 0;
  arr.forEach(file => {
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else       { w = Math.round(w * MAX / h); h = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        _adminPendingImgs.push(canvas.toDataURL('image/jpeg', 0.80));
        if (++done === arr.length) renderAdminPhotoGrid();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function renderAdminPhotoGrid() {
  const grid = document.getElementById('ap-photos-grid');
  if (!grid) return;
  grid.innerHTML = _adminPendingImgs.map((src, i) => `
    <div class="photo-thumb">
      <img src="${escapeHtml(src)}" alt="Foto ${i + 1}" />
      ${i === 0 ? '<span class="thumb-badge">Capa</span>' : ''}
      <button class="thumb-remove" onclick="removeAdminPendingPhoto(${i})">×</button>
    </div>`).join('');
}

function removeAdminPendingPhoto(i) {
  _adminPendingImgs.splice(i, 1);
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
        <div class="product-meta">
          R$ ${p.price.toFixed(2).replace('.', ',')} · ${escapeHtml(p.category)}
          ${p.imgs?.length > 1 ? ` · ${p.imgs.length} fotos` : ''}
        </div>
        <h4>${escapeHtml(p.name)}</h4>
        <p>${escapeHtml(p.desc)}</p>
      </div>
      <div class="product-actions">
        <button class="action-btn delete" onclick="deleteProduct(${p.id})">Excluir</button>
      </div>
    </div>`).join('');
}

function deleteProduct(id) {
  adminProducts = adminProducts.filter(p => p.id !== id);
  _saveLocal();
  if (firebaseEnabled) deleteProductFromFirebase(id);
  renderProducts();
  renderCatalog();
}

function closeAdminModal() {
  document.getElementById('adminModal')?.remove();
  document.body.style.overflow = '';
  adminLoggedIn = false;
  localStorage.removeItem('adminLoggedIn');
  _adminPendingImgs = [];
}

function logoutAdmin() { closeAdminModal(); }

// =====================================================
// INICIALIZAÇÃO
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
  initAgeGate();

  const drawer = document.getElementById('nav-drawer');
  if (drawer && drawer.parentElement !== document.body) document.body.appendChild(drawer);

  renderCart();
  updateStoreStatus();

  document.querySelectorAll('#nav-drawer a').forEach(link => link.addEventListener('click', closeNav));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeNav(); });

  // Mostra dados do localStorage imediatamente (sem piscar)
  renderCatalog();

  // Sincroniza com Firebase (aguarda resposta real do servidor)
  await loadProducts();
});