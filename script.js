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

// Default products if none in localStorage
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
  modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.9);z-index:10000;display:flex;align-items:center;justify-content:center;padding:1rem;';
  modal.innerHTML = `
    <div style="background:#1a1a1a;color:white;padding:2.5rem;border-radius:16px;max-width:600px;width:95%;max-height:90vh;overflow:auto;box-shadow:0 20px 60px rgba(0,0,0,0.8);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;border-bottom:1px solid #444;padding-bottom:1rem;">
        <h2 style="margin:0;font-size:1.8rem;">🔧 Painel Admin</h2>
        <div>
          <button onclick="logoutAdmin()" style="background:#e55;color:white;border:none;border-radius:8px;padding:0.5rem 1rem;margin-left:0.5rem;cursor:pointer;font-size:1rem;">Sair</button>
          <button onclick="closeAdminModal()" style="background:none;border:none;color:#ccc;font-size:1.8rem;cursor:pointer;padding:0.25rem;">×</button>
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

function closeAdminModal() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.remove();
  }
  adminLoggedIn = false;
  localStorage.removeItem('adminLoggedIn');
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
          <button class="add-btn">+</button>
        </div>
      </div>
    </div>
  `).join('');
  
  animateCards();
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

function toggleProduct(id) {
  const product = adminProducts.find(p => p.id === id);
  if (product) {
    alert(`Produto: ${product.name}\nPreço: R$ ${product.price.toFixed(2)}\nDescrição: ${product.desc}`);
  }
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
  
  // Funções básicas sem erro
  window.toggleCart = toggleCart;
  window.openCheckout = () => alert('Checkout');
  window.sendToWhatsApp = () => window.open('https://wa.me/5531900000000');
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
