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

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  if (panel) {
    panel.classList.toggle('active');
  }
  if (overlay) {
    overlay.classList.toggle('active');
  }
}

function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

let adminProducts = JSON.parse(localStorage.getItem('adminProducts') || '[]');
let adminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';

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

  const modal = document.createElement('div');
  modal.id = 'adminModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#1a1a1a;color:white;padding:2.5rem;border-radius:16px;max-width:600px;width:95%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.8);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;border-bottom:1px solid #444;padding-bottom:1rem;">
        <h2 style="margin:0;font-size:1.8rem;">🔧 Painel Admin</h2>
        <div>
          <button onclick="logoutAdmin()" style="background:#e55;color:white;border:none;border-radius:8px;padding:0.5rem 1rem;margin-left:0.5rem;cursor:pointer;font-size:1rem;">Sair</button>
          <button onclick="document.getElementById('adminModal').remove()" style="background:none;border:none;color:#ccc;font-size:1.8rem;cursor:pointer;padding:0.25rem;">×</button>
        </div>
      </div>
      
      <!-- Add Form -->
      <div style="background:#2a2a2a;padding:1.5rem;border-radius:12px;margin-bottom:2rem;">
        <h3 style="margin:0 0 1rem 0;color:#48e011;">➕ Novo Produto</h3>
        <form id="addForm" style="display:grid;gap:1rem;">
          <input id="name" placeholder="Nome do produto" required style="padding:1rem;border:1px solid #555;border-radius:8px;background:#333;color:white;font-size:1rem;">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
            <input id="price" type="number" step="0.01" placeholder="Preço R$" required style="padding:1rem;border:1px solid #555;border-radius:8px;background:#333;color:white;">
            <select id="category" style="padding:1rem;border:1px solid #555;border-radius:8px;background:#333;color:white;">
              <option value="charuto">Charuto</option>
              <option value="narguilé">Narguilé</option>
              <option value="cigarro">Cigarro</option>
              <option value="acessório">Acessório</option>
            </select>
          </div>
          <input id="photo" type="file" accept="image/*" required style="padding:1rem;border:1px solid #555;border-radius:8px;background:#333;color:white;">
          <textarea id="desc" placeholder="Descrição (opcional)" rows="3" style="padding:1rem;border:1px solid #555;border-radius:8px;background:#333;color:white;"></textarea>
          <button type="submit" style="padding:1rem;background:#48e011;color:white;border:none;border-radius:8px;font-weight:600;font-size:1.1rem;cursor:pointer;">Adicionar</button>
        </form>
      </div>
      
      <!-- Products List -->
      <div>
        <h3 style="margin:0 0 1.5rem 0;color:#48e011;">📦 Produtos (${adminProducts.length})</h3>
        <div id="productsList" style="display:grid;gap:1rem;max-height:300px;overflow:auto;"></div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
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
        renderProducts();
        form.reset();
        alert('✅ Produto adicionado!');
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
    <div style="background:#333;padding:1rem;border-radius:8px;display:flex;align-items:center;gap:1rem;">
      <img src="${p.img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">
      <div style="flex:1;">
        <div style="font-weight:600;font-size:1.1rem;">${p.name}</div>
        <div>R$ ${p.price.toFixed(2)} | ${p.category}</div>
        <div style="font-size:0.9rem;color:#ccc;margin-top:0.25rem;">${p.desc}</div>
      </div>
      <button onclick="deleteProduct(${p.id})" style="background:#e55;color:white;border:none;border-radius:6px;padding:0.5rem 1rem;cursor:pointer;font-size:0.9rem;">🗑️</button>
    </div>
  `).join('');
}

function deleteProduct(id) {
  adminProducts = adminProducts.filter(p => p.id !== id);
  localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
  renderProducts();
}

function logoutAdmin() {
  localStorage.removeItem('adminLoggedIn');
  adminLoggedIn = false;
  document.getElementById('adminModal').remove();
}

document.addEventListener('DOMContentLoaded', function() {
  // Auto-show main-site after 1 second para debug
  setTimeout(() => {
    const mainSite = document.getElementById('main-site');
    const gate = document.getElementById('age-gate');
    if (mainSite && gate) {
      gate.style.display = 'none';
      mainSite.style.display = 'block';
    }
  }, 500);

  // Catálogo dinâmico do localStorage admin
  renderCatalog();
  
  function renderCatalog() {
    const grid = document.getElementById('catalog-grid');
    if (!grid) return;
    
    if (adminProducts.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#888;">Nenhum produto. Use FAB 🔧 para adicionar! 📱</div>';
      return;
    }
    
    grid.innerHTML = adminProducts.map(p => `
      <div class="product-card" onclick="toggleProduct(${p.id})">
        <div class="product-img-wrap">
          <img class="product-img" src="${p.img}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x300/333/fff?text=Produto'">
        </div>
        <div class="product-body">
          <div class="product-cat">${p.category}</div>
          <div class="product-name">${p.name}</div>
          <div class="product-footer">
            <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
            <button class="add-btn">+</button>
          </div>
        </div>
      </div>
    `).join('');
    
    animateCards();
  }
  
  // Status loja
  const statusEls = document.querySelectorAll('#store-status, #store-status2');
  statusEls.forEach(el => {
    el.innerHTML = '<span class="status-badge status-open">● Aberto agora</span>';
  });
  
  // Funções básicas sem erro
  window.toggleCart = toggleCart;
  window.openCheckout = () => alert('Checkout');
  window.sendToWhatsApp = () => window.open('https://wa.me/5531900000000');
  window.toggleNav = () => {};
  window.filterProducts = () => {};
  window.handleSearch = () => {};
  window.loadProducts = () => {};
  window.loadMoreProducts = () => {};
  window.toggleFaq = (btn) => btn.classList.toggle('active');
  window.toggleDrawerSub = () => {};
  window.closeNav = () => {};
  
  window.confirmAge = confirmAge;
  window.toggleNavItem = toggleNavItem;
  window.closeCheckout = closeCheckout;
  window.toggleAdminModal = toggleAdminModal;
});
