/* ============================================================
   TABACARIA PREMIUM — script.js FIXED Age Gate
   ============================================================ */

function confirmAge(isAdult) {
  console.log('confirmAge called', isAdult);
  if (isAdult) {
    const gate = document.getElementById('age-gate');
    console.log('gate found:', !!gate);
    if (gate) {
      gate.style.transition = 'opacity 0.5s';
      gate.style.opacity = '0';
      setTimeout(() => {
        gate.style.display = 'none';
        const mainSite = document.getElementById('main-site');
        console.log('main-site found:', !!mainSite);
        if (mainSite) {
          mainSite.style.opacity = '1';
          mainSite.style.visibility = 'visible';
          mainSite.classList.add('visible');
          console.log('main-site visible');
          initApp();
        }
      }, 500);
    } else {
      // Fallback
      document.body.style.opacity = '1';
      initApp();
    }
  } else {
    const gate = document.getElementById('age-gate');
    if (gate) gate.style.display = 'none';
    const warning = document.getElementById('age-warning');
    if (warning) warning.style.display = 'flex';
  }
}

function initApp() {
  console.log('initApp called');
  checkStoreStatus();
  initParticles();
  initHeaderScroll();
  initScrollReveal();
  updateCartUI();
  // loadProducts will be called later
}

function checkStoreStatus() {
  const now = new Date();
  const day = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  let open = (day >= 1 && day <= 5 && time >= 540 && time < 1080) || (day === 6 && time >= 540 && time < 780);
  const els = document.querySelectorAll('#store-status, #store-status2');
  els.forEach(el => {
    if (el) el.innerHTML = open ? '<span class="status-badge status-open">● Aberto agora</span>' : '<span class="status-badge status-closed">● Fechado</span>';
  });
}

function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;
  const count = window.innerWidth <= 600 ? 12 : 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.width = (Math.random() * 3 + 1) + 'px';
    p.style.height = (Math.random() * 3 + 1) + 'px';
    p.style.setProperty('--dur', (Math.random() * 8 + 6) + 's');
    p.style.setProperty('--delay', (Math.random() * 8) + 's');
    p.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
    p.style.setProperty('--op', Math.random() * 0.5 + 0.2);
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
  if (header) {
    window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 50), { passive: true });
  }
}

// Products
let products = [];
let activeFilter = 'all';
let searchTerm = '';

async function loadProducts() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;
  
  grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;">Carregando...</div>';
  
  try {
    let data = [];
    const res = await fetch('/api/products');
    if (res.ok) data = await res.json();
    
    products = data.map(item => ({
      id: item.id,
      name: item.name,
      cat: item.category || 'acessório',
      price: parseFloat(item.price),
      img: item.img_filename ? `assets/produtos/${item.img_filename}` : '',
      fallback: 'https://via.placeholder.com/300x300/333/fff?text=Produto'
    })).filter(p => p.img);
    
    renderCatalog();
  } catch (e) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#ff6b6b;">Erro carregamento produtos</div>';
  }
}

function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid || products.length === 0) return;
  
  grid.innerHTML = products.map(p => `
    <div class="product-card" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.img}" alt="${p.name}" onerror="this.src='${p.fallback}'" />
      </div>
      <div class="product-body">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <div class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
          <button class="add-btn">+</button>
        </div>
      </div>
    </div>
  `).join('');
}

function toggleProduct(id) {
  console.log('toggleProduct', id);
}

// Cart simple
let cart = [];
function updateCartUI() {
  const count = cart.length;
  document.querySelectorAll('[id*=\"cart-count\"]').forEach(el => el.textContent = count);
}

function toggleCart() {
  const panel = document.getElementById('cart-panel');
  if (panel) panel.classList.toggle('open');
}

// DOM Ready safe
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Global functions for onclick (basic)
window.toggleNav = () => {};
window.closeNav = () => {};
window.toggleFaq = () => {};
window.sendToWhatsApp = () => alert('WhatsApp');
window.openCheckout = () => alert('Checkout');
