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
    subscribeToFirestoreProducts(); // Auto real-time sync
    console.log('[Firebase] Listener real-time ativo');
  }
}

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
  const day = now.getDay(); // 0 = Sunday, 1 = Monday
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
  if (panel) {
    panel.classList.toggle('open');
  }
  if (overlay) {
    overlay.classList.toggle('open');
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('open');
  }
  document.body.style.overflow = '';
}

let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');

function openCheckout() {
  if (cartItems.length === 0) {
    alert('Seu carrinho está vazio. Adicione produtos antes de finalizar.');
    return;
  }

  const panel = document.getElementById('cart-panel');
  if (panel && panel.classList.contains('open')) {
    toggleCart();
  }

  renderCheckoutSummary();
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('open');
  }
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

// Default products if none in localStorage
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

  if (badge) {
    badge.textContent = getCartCount();
  }
  if (fabCount) {
    fabCount.textContent = getCartCount();
  }
  if (totalPrice) {
    totalPrice.textContent = formatBRL(getCartTotal());
  }
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
  if (item.quantity <= 0) {
    cartItems = cartItems.filter(item => item.id !== id);
  }
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
    { id: 1, name: 'Aleda Ouro', price: 25.00, category: 'charuto', img: 'assets/produtos/aledaOuro.jpeg', desc: 'Charuto premium cubano' },
    { id: 2, name: 'Aleda LTD', price: 30.00, category: 'charuto', img: 'assets/produtos/aleda-ltd.jpeg', desc: 'Edição limitada' },
    { id: 3, name: 'Blunt King Brown', price: 15.00, category: 'cigarro', img: 'assets/produtos/bb-brown-1.jpeg', desc: 'Cigarro artesanal' },
    { id: 4, name: 'Cinzeiro Tonabe', price: 20.00, category: 'acessório', img: 'assets/produtos/cinzeiro-tonabe.jpeg', desc: 'Cinzeiro de cerâmica' },
    { id: 5, name: 'Piteira BB Premium', price: 12.00, category: 'acessório', img: 'assets/produtos/piteira-bb-premium.jpeg', desc: 'Piteira para blunt' },
    { id: 6, name: 'Zomo Black', price: 18.00, category: 'narguilé', img: 'assets/produtos/zomo-black.jpeg', desc: 'Tabaco para narguilé' },
    { id: 7, name: 'King Herbal Wrap', price: 8.00, category: 'cigarro', img: 'assets/produtos/kingHerbalWrap.jpeg', desc: 'Wrap herbal' },
    { id: 8, name: 'Puff Life', price: 10.00, category: 'cigarro', img: 'assets/produtos/puff-life.jpeg', desc: 'Cigarro premium' },
    { id: 9, name: 'Tesoura Tonabe', price: 15.00, category: 'acessório', img: 'assets/produtos/tesoura-tonabe.jpeg', desc: 'Tesoura para tabaco' },
    { id: 10, name: 'Rolling Machine', price: 50.00, category: 'acessório', img: 'assets/produtos/rollingMachine.jpeg', desc: 'Máquina de enrolar' }
  ];
  localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
}

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

  if (document.getElementById('adminModal')) {
    return;
  }

  const modal = document.createElement('div');
  modal.id = 'adminModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;overflow:auto;';
  modal.innerHTML = `
    <style>
      #adminModal .admin-modal-box { width: min(680px, 100%); max-height: 92vh; overflow: auto; }
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
      #adminModal .admin-textarea { width:100%; border-radius:1rem; border:1px solid rgba(255,255,255,0.08); background:#111827; color:#e2e8f0; padding:1rem 1.1rem; font-size:0.96rem; outline:none; }
      #adminModal .admin-input:focus,
      #adminModal .admin-select:focus,
      #adminModal .admin-textarea:focus { border-color:#10b981; box-shadow:0 0 0 4px rgba(16,185,129,0.14); }
      #adminModal .upload-row { display:flex; align-items:center; justify-content:space-between; gap:1rem; border:1px dashed rgba(16,185,129,0.35); padding:1rem 1rem; border-radius:1rem; background:rgba(16,185,129,0.05); color:#cbd5e1; }
      #adminModal .upload-row label { cursor:pointer; color:#10b981; font-weight:700; }
      #adminModal .preview-box { margin-top:1rem; min-height:12rem; border:1px dashed rgba(255,255,255,0.12); border-radius:1.2rem; background:#090b10; display:flex; align-items:center; justify-content:center; color:#64748b; overflow:hidden; }
      #adminModal .preview-box img { width:100%; height:100%; object-fit:cover; }
      #adminModal .admin-submit { width:100%; border-radius:1.5rem; border:none; background:#0f766e; color:#f8fafc; font-weight:800; padding:1.15rem 1.35rem; font-size:1.03rem; display:inline-flex; align-items:center; justify-content:center; gap:0.75rem; transition:transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease; box-shadow:0 18px 32px rgba(16,185,129,0.18); }
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
          <input id="name" class="admin-input" placeholder="Nome do produto" required />
          <div class="field-row">
            <input id="price" class="admin-input" type="number" step="0.01" placeholder="Preço R$" required />
            <select id="category" class="admin-select">
              <option value="charuto">Charuto</option>
              <option value="narguilé">Narguilé</option>
              <option value="cigarro">Cigarro</option>
              <option value="acessório">Acessório</option>
            </select>
          </div>
          <div class="upload-row">
            <span>Arraste ou selecione uma imagem</span>
            <label for="photo">Escolher arquivo</label>
          </div>
          <input id="photo" type="file" accept="image/*" required style="display:none;" />
          <div class="preview-box" id="imagePreview">Nenhuma imagem selecionada</div>
          <textarea id="desc" class="admin-textarea" placeholder="Descrição (opcional)" rows="4"></textarea>
          <button type="submit" class="admin-submit"><span style="font-size:1.4rem;line-height:1;">+</span>Adicionar Produto</button>
        </form>
      </div>
      <div class="admin-panel-block">
        <div class="products-list-header">
          <div>
            <h3>Produtos Cadastrados</h3>
            <p>${adminProducts.length} produtos disponíveis</p>
          </div>
          <span class="badge">Premium</span>
        </div>
        <div class="products-grid" id="productsList"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  document.getElementById('photo').addEventListener('change', previewAdminImage);
  document.getElementById('photo').closest('div').querySelector('label').addEventListener('click', () => document.getElementById('photo').click());
  document.getElementById('adminModal').addEventListener('click', (event) => {
    if (event.target.id === 'adminModal') closeAdminModal();
  });
  
  // Add form
  document.getElementById('addForm').onsubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const photo = form.photo.files[0];
    
    if (photo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newProduct = {
          id: Date.now(),
          name: form.name.value,
          price: parseFloat(form.price.value),
          category: form.category.value,
          img: e.target.result,
          desc: form.desc.value || ''
        };
        adminProducts.push(newProduct);
        localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
        if (firebaseEnabled) {
          saveProductToFirebase(newProduct);
          alert('✅ Produto adicionado');
        } else {
          alert('✅ Produto adicionado');
        }
        renderProducts();
        form.reset();
      };
      reader.readAsDataURL(photo);
    }
  };
  
  renderProducts();
}

function renderProducts() {
  const list = document.getElementById('productsList');
  if (!list) return;
  
  list.innerHTML = adminProducts.map(p => `
    <div class="product-row">
      <img src="${p.img}" alt="${p.name}" />
      <div class="product-info">
        <div class="product-meta">R$ ${p.price.toFixed(2).replace('.', ',')} · ${p.category}</div>
        <h4>${p.name}</h4>
        <p>${p.desc}</p>
      </div>
      <div class="product-actions">
        <button class="action-btn edit">Editar</button>
        <button class="action-btn delete" onclick="deleteProduct(${p.id})">Excluir</button>
      </div>
    </div>
  `).join('');
}

function deleteProduct(id) {
  adminProducts = adminProducts.filter(p => p.id !== id);
  localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  if (firebaseEnabled) {
    deleteProductFromFirebase(id);
  }
  renderProducts();
}

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.remove();
  }
  document.body.style.overflow = '';
  adminLoggedIn = false;
  localStorage.removeItem('adminLoggedIn');
}

function previewAdminImage(event) {
  const preview = document.getElementById('imagePreview');
  const file = event.target.files[0];
  if (!file) {
    preview.innerHTML = 'Nenhuma imagem selecionada';
    return;
  }
  const url = URL.createObjectURL(file);
  preview.innerHTML = `<img src="${url}" alt="Imagem do produto" />`;
}

function logoutAdmin() {
  closeAdminModal();
}

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
    if (cartPanel && !cartPanel.classList.contains('open')) {
      toggleCart();
    }
  }
}

function animateCards() {
  // Simple animation for product cards
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('card-visible');
    card.classList.add('reveal');
  });
}

// =====================================================
// MODAL DE VISUALIZAÇÃO DO PRODUTO
// =====================================================

function openProductModal(id) {
  const product = adminProducts.find(p => p.id === id);
  if (!product) return;

  // Remove modal anterior se existir
  const existing = document.getElementById('product-view-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'product-view-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(14px);
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
    animation: pvmFadeIn 0.28s ease;
  `;

  modal.innerHTML = `
    <style>
      @keyframes pvmFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes pvmSlideUp {
        from { opacity: 0; transform: translateY(40px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      #product-view-modal .pvm-box {
        position: relative;
        width: min(520px, 100%);
        background: #0d1117;
        border: 1px solid rgba(255,255,255,0.09);
        border-radius: 2rem;
        overflow: hidden;
        box-shadow: 0 32px 80px rgba(0,0,0,0.6);
        animation: pvmSlideUp 0.32s cubic-bezier(.22,.68,0,1.2);
        display: flex;
        flex-direction: column;
      }
      #product-view-modal .pvm-img-wrap {
        width: 100%;
        aspect-ratio: 4/3;
        overflow: hidden;
        background: #090b10;
        flex-shrink: 0;
      }
      #product-view-modal .pvm-img-wrap img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      #product-view-modal .pvm-img-wrap img:hover {
        transform: scale(1.04);
      }
      #product-view-modal .pvm-body {
        padding: 1.75rem 2rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      #product-view-modal .pvm-cat {
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #10b981;
        background: rgba(16,185,129,0.1);
        border: 1px solid rgba(16,185,129,0.22);
        display: inline-block;
        padding: 0.3rem 0.85rem;
        border-radius: 999px;
        width: fit-content;
      }
      #product-view-modal .pvm-name {
        font-size: 1.65rem;
        font-weight: 800;
        color: #f8fafc;
        line-height: 1.2;
        margin: 0;
      }
      #product-view-modal .pvm-desc {
        color: #94a3b8;
        font-size: 0.97rem;
        line-height: 1.65;
        margin: 0;
      }
      #product-view-modal .pvm-price {
        font-size: 1.9rem;
        font-weight: 900;
        color: #a3e635;
        letter-spacing: -0.02em;
      }
      #product-view-modal .pvm-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
      #product-view-modal .pvm-close-btn {
        flex: 0 0 auto;
        border: 1px solid rgba(255,255,255,0.12);
        background: rgba(255,255,255,0.05);
        color: #94a3b8;
        border-radius: 1.2rem;
        padding: 0 1.2rem;
        height: 52px;
        font-size: 1.5rem;
        cursor: pointer;
        transition: background 0.2s, color 0.2s;
        display: flex; align-items: center; justify-content: center;
      }
      #product-view-modal .pvm-close-btn:hover {
        background: rgba(239,68,68,0.15);
        color: #fca5a5;
        border-color: rgba(239,68,68,0.3);
      }
      #product-view-modal .pvm-add-btn {
        flex: 1;
        border: none;
        background: linear-gradient(135deg, #10b981, #0f766e);
        color: #fff;
        border-radius: 1.2rem;
        height: 52px;
        font-size: 1rem;
        font-weight: 800;
        cursor: pointer;
        letter-spacing: 0.02em;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 8px 24px rgba(16,185,129,0.3);
      }
      #product-view-modal .pvm-add-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(16,185,129,0.45);
      }
      #product-view-modal .pvm-add-btn:active {
        transform: scale(0.97);
      }
    </style>
    <div class="pvm-box">
      <div class="pvm-img-wrap">
        <img src="${product.img}" alt="${product.name}"
             onerror="this.src='https://via.placeholder.com/520x390/111/555?text=Produto'" />
      </div>
      <div class="pvm-body">
        <span class="pvm-cat">${product.category}</span>
        <h2 class="pvm-name">${product.name}</h2>
        ${product.desc ? `<p class="pvm-desc">${product.desc}</p>` : ''}
        <div class="pvm-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
        <div class="pvm-actions">
          <button class="pvm-close-btn" onclick="closeProductModal()" title="Voltar ao catálogo">✕</button>
          <button class="pvm-add-btn" onclick="addToCartFromModal(${product.id})">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;

  // Fechar ao clicar no backdrop
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeProductModal();
  });

  // Fechar com ESC
  document.addEventListener('keydown', _pvmEscHandler);

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function _pvmEscHandler(e) {
  if (e.key === 'Escape') closeProductModal();
}

function closeProductModal() {
  const modal = document.getElementById('product-view-modal');
  if (modal) {
    modal.style.animation = 'pvmFadeIn 0.2s ease reverse';
    setTimeout(() => modal.remove(), 180);
  }
  document.body.style.overflow = '';
  document.removeEventListener('keydown', _pvmEscHandler);
}

function addToCartFromModal(id) {
  const product = adminProducts.find(p => p.id === id);
  if (product) {
    addToCart(product);
    closeProductModal();
    const cartPanel = document.getElementById('cart-panel');
    if (cartPanel && !cartPanel.classList.contains('open')) {
      toggleCart();
    }
  }
}

// =====================================================
// SUBSTITUA a função toggleProduct existente por esta:
// =====================================================
function toggleProduct(id) {
  openProductModal(id);
}

document.addEventListener('DOMContentLoaded', async function() {
  // Auto-show main-site after 1 second para debug
  setTimeout(() => {
    const mainSite = document.getElementById('main-site');
    const gate = document.getElementById('age-gate');
    if (mainSite && gate) {
      gate.style.display = 'none';
      mainSite.style.display = 'block';
    }
  }, 500);

  // Carregar produtos do Firebase / fallback local
  await loadProducts();
  renderCatalog();
  renderCart();
  updateStoreStatus();
  
  // Funções básicas sem erro
  window.toggleCart = toggleCart;
  window.toggleNav = () => {};
  window.filterProducts = (category, btn) => {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
    
    let filtered = adminProducts;
    if (category !== 'all') {
      filtered = adminProducts.filter(p => p.category === category);
    }
    renderCatalog(filtered);
  };
  window.handleSearch = (query) => {
    const filtered = adminProducts.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.desc.toLowerCase().includes(query.toLowerCase())
    );
    renderCatalog(filtered);
  };
  window.loadProducts = loadProducts;
  window.loadMoreProducts = () => {};
  window.toggleFaq = (btn) => {
    const answer = btn.nextElementSibling;
    btn.classList.toggle('active');
    if (answer) answer.classList.toggle('open');
  };
  window.toggleDrawerSub = () => {};
  window.closeNav = () => {};
  
  window.confirmAge = confirmAge;
  window.toggleNavItem = toggleNavItem;
  window.closeCheckout = closeCheckout;
  window.toggleAdminModal = toggleAdminModal;
  window.openCheckout = openCheckout;
  window.sendToWhatsApp = sendToWhatsApp;
});
