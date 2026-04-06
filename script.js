/* ============================================================
   TABACARIA PREMIUM — script.js
   ============================================================ */

'use strict';

// ===== Produtos carregados do banco Hostinger ====
let products = [];  // Carregado dinamicamente via API

async function loadProducts() {
  try {
    const grid = document.getElementById('catalog-grid');
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--gold);">🔄 Carregando do Firebase Firestore...</div>';
    
    // Tenta API primeiro (backend), fallback Firebase client
    let dbProducts;
    try {
      const res = await fetch('/api/products');
      dbProducts = await res.json();
    } catch {
      // Firebase client-side para Netlify
      const snapshot = await getDocs(query(collection(window.db, 'products'), orderBy('created_at', 'desc')));
      dbProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    products = dbProducts.map(item => ({
      id: item.id,
      name: item.name,
      cat: item.category || getCategoryByName(item.name),
      price: parseFloat(item.price),
      desc: item.desc || 'Produto premium para apreciadores.',
      img: item.img_filename ? `assets/produtos/${item.img_filename}` : '',
      img_filename: item.img_filename,
      fallback: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70"
    })).filter(p => p.img);  // Só produtos com foto
    
    if (products.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">Nenhum produto no banco. Use Admin FAB (🔧) para adicionar. 😌</div>';
      return;
    }
    
    renderCatalog(activeFilter, true);
  } catch (e) {
    console.error('Erro loadProducts:', e);
    document.getElementById('catalog-grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#ff6b6b;">❌ Erro ao carregar produtos. Verifique http://localhost:3000/api/products (F12 Console).<br><small>Clique F12 > Console para detalhes.</small></div>';
  }
}


function getCategoryByName(name) {
  const n = name.toUpperCase();
  if (n.includes('CHARUTO')) return 'charuto';
  if (n.includes('NARGUILÉ') || n.includes('NARGUILE') || n.includes('CARVÃO')) return 'narguilé';
  if (n.includes('CACHIMBO')) return 'cachimbo';
  if (n.includes('CIGARRO') || n.includes('SEDA') || n.includes('PAPEL') || n.includes('PITEIRA')) return 'cigarro';
  return 'acessório';
}



let cart = [];
let activeFilter = 'all';
let searchTerm = '';
let currentPage = 1;
let productsPerPage = window.innerWidth <= 600 ? 4 : 8;

/* ─────────────────────────────────────────
   INITIALIZERS & UTILS
───────────────────────────────────────── */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  const count = window.innerWidth <= 600 ? 12 : 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left: ${Math.random() * 100}%; width: ${Math.random() * 3 + 1}px; height: ${Math.random() * 3 + 1}px; --dur: ${Math.random() * 8 + 6}s; --delay: ${Math.random() * 8}s; --dx: ${(Math.random() - 0.5) * 120}px; --op: ${Math.random() * 0.5 + 0.2};`;
    container.appendChild(p);
  }
}

function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .divider').forEach(el => observer.observe(el));
}

function animateCards() {
  const cards = document.querySelectorAll('.product-card:not(.card-visible)');
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add('card-visible'), i * 80);
  });
}

function initHeaderScroll() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
}

/* ─────────────────────────────────────────
   CATALOG CORE & SEARCH (CORRIGIDO)
───────────────────────────────────────── */
function handleSearch(value) {
  searchTerm = value.toLowerCase();
  currentPage = 1;
  if (products.length > 0) {
    renderCatalog(activeFilter, true);
  }
}

function renderCatalog(filter = 'all', reset = true) {
  if (reset) {
    currentPage = 1;
    productsPerPage = window.innerWidth <= 600 ? 4 : 8;
  }
  activeFilter = filter;

  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  // Filtra a lista completa
  let filtered = products.filter(p => {
    const matchesFilter = filter === 'all' || p.cat === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  // Calcula o pedaço da lista a ser exibido
  const start = reset ? 0 : (currentPage - 1) * productsPerPage;
  const end = currentPage * productsPerPage;
  const paginated = filtered.slice(start, end);

  if (reset) grid.innerHTML = '';

  const html = paginated.map(p => `
    <div class="product-card ${cart.find(c => c.id === p.id) ? 'selected' : ''}" id="card-${p.id}" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy" onerror="this.src='${p.fallback}'" />
      </div>
      <div class="product-body">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price"><span>R$</span> ${p.price.toFixed(2).replace('.', ',')}</div>
          <button class="add-btn">${cart.find(c => c.id === p.id) ? '✓' : '+'}</button>
        </div>
      </div>
    </div>
  `).join('');

  grid.insertAdjacentHTML('beforeend', html);

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="no-results" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gold); font-size: 1.2rem;">Nenhum produto encontrado. 😕</div>';
  }

  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) loadBtn.style.display = (end < filtered.length) ? 'block' : 'none';

  animateCards();
}

function loadMoreProducts() {
  currentPage++;
  renderCatalog(activeFilter, false);
}

function filterProducts(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (products.length > 0) {
    renderCatalog(cat, true);
  } else {
    loadProducts();  // Recarrega se necessário
  }
}

function toggleProduct(id) {
  const product = products.find(p => p.id === id);
  const idx = cart.findIndex(c => c.id === id);
  if (idx > -1) cart.splice(idx, 1);
  else cart.push(product);
  
  updateCartUI();
  
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.toggle('selected');
    const btn = card.querySelector('.add-btn');
    btn.textContent = cart.find(c => c.id === id) ? '✓' : '+';
  }
}

/* ─────────────────────────────────────────
   AGE GATE, STATUS, NAV & CART
───────────────────────────────────────── */
function confirmAge(isAdult) {
  if (isAdult) {
    const gate = document.getElementById('age-gate');
    gate.style.opacity = '0';
    setTimeout(() => {
      gate.style.display = 'none';
      document.getElementById('main-site').classList.add('visible');
      loadProducts();
      updateCartUI();

      checkStoreStatus();
      initParticles();
      initHeaderScroll();
      initScrollReveal();
    }, 500);
  } else {
    document.getElementById('age-gate').style.display = 'none';
    document.getElementById('age-warning').classList.add('show');
  }
}

function checkStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  let open = (day >= 1 && day <= 5 && time >= 540 && time < 1080) || (day === 6 && time >= 540 && time < 780);
  const el = document.getElementById('store-status');
  if (el) el.innerHTML = open ? '<span class="status-badge status-open">● Aberto agora</span>' : '<span class="status-badge status-closed">● Fechado</span>';
}

function toggleNav() {
  const isOpen = document.getElementById('nav-drawer').classList.toggle('open');
  document.getElementById('hamburger').classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeNav() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

function updateCartUI() {
  const count = cart.length;
  ['cart-count', 'hci-badge', 'cart-fab-count'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = count;
  });

  const fab = document.getElementById('cart-fab');
  if (fab) fab.style.display = (window.scrollY > 400 && count > 0) ? 'flex' : 'none';

  const list = document.getElementById('cart-items-list');
  const totalEl = document.getElementById('cart-total-price');
  if (!list) return;

  if (count === 0) {
    list.innerHTML = '<div class="cart-empty">Carrinho vazio 🚬</div>';
    if (totalEl) totalEl.textContent = 'R$ 0,00';
  } else {
    const total = cart.reduce((s, p) => s + p.price, 0);
    list.innerHTML = cart.map(p => `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.img}" onerror="this.src='${p.fallback}'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
        </div>
        <button class="remove-item" onclick="event.stopPropagation(); toggleProduct(${p.id})">✕</button>
      </div>
    `).join('');
    if (totalEl) totalEl.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
  }
}

function toggleCart() {
  const isOpen = document.getElementById('cart-panel').classList.toggle('open');
  document.getElementById('cart-overlay').classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function openCheckout() {
  if (cart.length === 0) return alert('Selecione produtos!');
  toggleCart();
  const total = cart.reduce((s, p) => s + p.price, 0);
  document.getElementById('order-summary').innerHTML = `
    ${cart.map(p => `<div class="order-summary-item"><span>${p.name}</span><span>R$ ${p.price.toFixed(2).replace('.', ',')}</span></div>`).join('')}
    <div class="order-summary-item" style="color:var(--gold); font-weight:bold; border-top:1px solid #333; margin-top:10px; padding-top:10px;">
      <span>Total</span><span>R$ ${total.toFixed(2).replace('.', ',')}</span>
    </div>
  `;
  document.getElementById('checkout-modal').classList.add('open');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function sendToWhatsApp() {
  const campos = {
    nome: document.getElementById('field-nome').value.trim(),
    cpf: document.getElementById('field-cpf').value.trim(),
    end: document.getElementById('field-endereco').value.trim(),
    tel: document.getElementById('field-telefone').value.trim()
  };

  if (!campos.nome || !campos.cpf || !campos.end || !campos.tel) return alert('Preencha os campos!');

  const lista = cart.map(p => `• ${p.name} (R$ ${p.price.toFixed(2).replace('.', ',')})`).join('\n');
  const total = cart.reduce((s, p) => s + p.price, 0);
  // Altere o número abaixo para o número da sua tabacaria
  const msg = `🚬 *PEDIDO - TABACARIA*\n\n*Cliente:* ${campos.nome}\n*CPF:* ${campos.cpf}\n*Endereço:* ${campos.end}\n*Telefone:* ${campos.tel}\n\n*Produtos:*\n${lista}\n\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

  window.open(`https://wa.me/5531900000000?text=${encodeURIComponent(msg)}`, '_blank');
}

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(b => b.classList.remove('active'));
  if (!isOpen) { answer.classList.add('open'); btn.classList.add('active'); }
}

function toggleDrawerSub(btn) {
  const sub = btn.nextElementSibling;
  const isOpen = sub.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
}

function toggleNavItem(id) {
  const el = document.getElementById(id);
  const isNowActive = el.classList.toggle('active');
  document.getElementById('nav-overlay').classList.toggle('show', isNowActive);
}

function closeAllNav() {
  document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
  document.getElementById('nav-overlay').classList.remove('show');
}

window.addEventListener('scroll', () => {
  const fab = document.getElementById('cart-fab');
  if (fab) fab.style.display = (window.scrollY > 400 && cart.length > 0) ? 'flex' : 'none';
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeCheckout(); });
});