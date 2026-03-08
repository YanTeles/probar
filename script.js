/* ============================================================
   TABACARIA PREMIUM — script.js
   ============================================================ */

'use strict';

// ===== PRODUCTS DATA =====
const productList = [
  { name: "ALEDA CELULOSE KING SIZE", price: 53.00 },
  { name: "ALUMINIO PARA NARGUILE", price: 15.00 },
  { name: "BAG G TONABE", price: 65.00 },
  { name: "BAG P TONABE", price: 25.00 },
  { name: "BOLADOR HI TOBACCO 110MM", price: 11.50 },
  { name: "BOLADOR HI TOBACCO 78 MM", price: 10.55 },
  { name: "CAIXA TUBELITO PORTA CIGARROS PAPELITO C/ 12", price: 110.00 },
  { name: "CARVÃO ZOMO 1KG", price: 30.00 },
  { name: "CASE SADHU IMPERMEÁVEL G", price: 57.00 },
  { name: "CASE TONABE GRANDE", price: 30.00 },
  { name: "CASE TONABE PEQUENA", price: 25.00 },
  { name: "CINZEIRO AUTOMOTIVO TONABE", price: 65.00 },
  { name: "CINZEIRO DE VIDRO TONABE", price: 15.00 },
  { name: "CINZEIRO SQUADAFUM QUADRADO GRANDE", price: 29.90 },
  { name: "CINZEIRO SQUADAFUM REDONDO PEQUENO", price: 20.99 },
  { name: "CLIPPER GRANDE 24UN", price: 129.60 },
  { name: "CONES PRE BOLADOS G", price: 25.00 },
  { name: "CONES PRE BOLADOS P", price: 12.50 },
  { name: "CUIA SILICONE TONABE", price: 8.00 },
  { name: "DIAMANTE NEGRO DP C/12X34G", price: 39.99 },
  { name: "DICHAVADOR ACRÍLICO BEM BOLADO PEQUENO DISPLAY COM 7 UNIDADES", price: 66.90 },
  { name: "DICHAVADOR FIBRA DE COCO", price: 3.00 },
  { name: "DICHAVADOR TONABE", price: 30.00 },
  { name: "DICHAV. BEM BOLADO ACRILICO GD", price: 138.90 },
  { name: "DROP HALLS CEREJA", price: 25.50 },
  { name: "DROP HALLS EXTRA FORTE PRETO", price: 25.50 },
  { name: "DROP HALLS MELANCIA", price: 25.20 },
  { name: "DROP HALLS MENTA VERDE", price: 25.20 },
  { name: "DROP HALLS MENTOL AZUL", price: 25.20 },
  { name: "DROP HALLS MORANGO", price: 25.20 },
  { name: "FLUIDO VOLCANO", price: 21.50 },
  { name: "GAS VOLCANO", price: 21.90 },
  { name: "GATORADE FD C 6", price: 29.34 },
  { name: "GUDA - INCENSO (25 CX COM 7 VARETAS)", price: 30.00 },
  { name: "HERBAL WRAP KING MIX SABORES VARIADOS KING SIZE REGULAR - DISPLAY COM 25 BAGS", price: 125.00 },
  { name: "HEXAGONAL SILVER INCENSO - (6 CXS COM 20 VARETAS)", price: 30.00 },
  { name: "INDIA SOUL INCENSO (12 CX COM 13 VARETAS)", price: 95.00 },
  { name: "ISQUEIRO BIC MAXI CARTELA C/12", price: 51.00 },
  { name: "ISQUEIRO BIC MINI CARTELA C/12", price: 39.00 },
  { name: "ISQUEIRO CRICKET C/10", price: 45.90 },
  { name: "ISQUEIRO HIPER BANDEJA C/ 50 UN", price: 60.00 },
  { name: "LAKA BRANCO DP C/12X34G", price: 39.99 },
  { name: "MAÇARICO NAAR", price: 0.00 },
  { name: "MACARICO SADHU", price: 25.00 },
  { name: "MAÇARICO ZENGAZ CORES", price: 24.00 },
  { name: "NEW PUFF ISQUEIRO EMBORRACHADO", price: 27.50 },
  { name: "NEW PUFF SHOULDER BAG - CINZA", price: 129.90 },
  { name: "NEW PUFF SHOULDER BAG - PINK", price: 129.90 },
  { name: "NEW PUFF SHOULDER BAG - PRETA", price: 129.90 },
  { name: "NEW PUFF SHOULDER BAG - VERDE", price: 129.90 },
  { name: "OCB", price: 210.00 },
  { name: "PACOCA RIQUITA RETANGULAR CX C 170 UN", price: 45.90 },
  { name: "PAÇOCA RIQUITA ROLHINHA CX COM 100 UN", price: 24.90 },
  { name: "PAÇOCA TIPO CASEIRA UN", price: 0.99 },
  { name: "PALHA CAPITÃO", price: 125.00 },
  { name: "PALHA ESPECIAL MATA LEÃO", price: 125.00 },
  { name: "PAPEL SEDA ALEDA OURO BROWN", price: 39.99 },
  { name: "PAPEL SEDA ALEDA PRATA KING SIZE", price: 39.99 },
  { name: "PAPEL TRANSPARENTE ALEDA BLUE SIZE - DISPLAY COM 20 UNIDADES PT ALEDA BS", price: 50.00 },
  { name: "PAY PAY ALFAFA", price: 235.00 },
  { name: "PITEIRA BEM BOLADO BROWN LARGE", price: 58.90 },
  { name: "PITEIRA BEM BOLADO EXTRA LARGE CX 24X32", price: 65.00 },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN ROXA", price: 95.00 },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN (ROXA HIPER LARGE)", price: 100.00 },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN (VERDE)", price: 95.00 },
  { name: "PITEIRA BEM BOLADO POP LARGE (VERDE)", price: 56.00 },
  { name: "PITEIRA BEM BOLADO POP SLIM (LARANJA)", price: 51.00 },
  { name: "PITEIRA BEM BOLADO PREMIUM", price: 55.00 },
  { name: "PITEIRA DE PAPEL MEGA LONGA TONABE", price: 125.00 },
  { name: "PITEIRA TONABE COTTON", price: 90.00 },
  { name: "PITEIRA TONABE EXTRA LARGE", price: 99.00 },
  { name: "PITEIRA TONABE LARGE PAPEL VERGÊ", price: 100.00 },
  { name: "PITEIRA TONABE LIXO MANIA CX C 30", price: 75.00 },
  { name: "PITEIRA TONABE ULTRA LONGA C 30", price: 120.00 },
  { name: "PITEIRA ULTRA LONGA TONABE", price: 99.00 },
  { name: "PITEIRA YELLOW FINGER ROXA", price: 89.90 },
  { name: "POTE HERMÉTICO", price: 12.00 },
  { name: "PUFF ALÇA - GANJA", price: 34.90 },
  { name: "PUFF ALÇA - RELEVO", price: 34.90 },
  { name: "PUFF CASE CLÁSSICA VENTS", price: 109.99 },
  { name: "PUFF CASE CLASSICO - COLORS", price: 101.90 },
  { name: "PUFF CASE CLASSICO - CREME", price: 99.90 },
  { name: "PUFF CASE CLASSICO LIL WHIND", price: 107.90 },
  { name: "PUFF CASE CLASSICO - PRETO", price: 99.90 },
  { name: "PUFF CASE CLASSICO RAW", price: 119.90 },
  { name: "PUFF CASE CLASSICO - STREET", price: 101.90 },
  { name: "PUFF CASE MINI - CREME", price: 59.90 },
  { name: "PUFF CASE MINI PRETO", price: 59.90 },
  { name: "PUFF CASE PITEIRA DE VIDRO COLLAB HIPPIE BONG", price: 99.90 },
  { name: "PUFF CASE PRO COLORS", price: 169.99 },
  { name: "PUFF CASE PRO LIL WHIND", price: 173.90 },
  { name: "PUFF CASE PRO - PRETO", price: 154.90 },
  { name: "PUFF CASE PRO - RAW CASTOR", price: 0.00 },
  { name: "PUFF CASE PRO VENTS", price: 175.99 },
  { name: "PUFF CASE SLIM ALEDA", price: 79.90 },
  { name: "PUFF CASE SLIM BADAUI 2.0", price: 84.90 },
  { name: "PUFF CASE SLIM BADEGO", price: 89.90 },
  { name: "PUFF CASE SLIM COLLORS", price: 89.99 },
  { name: "PUFF CASE SLIM - CREME", price: 74.99 },
  { name: "PUFF CASE SLIM LIL WHIND", price: 89.90 },
  { name: "PUFF CASE SLIM PRETO", price: 74.99 },
  { name: "PUFF CASE SLIM VENTS", price: 89.99 },
  { name: "PUFF CORDAO CHAVEIRO", price: 65.90 },
  { name: "PUFF HAND BAG URBAN", price: 83.90 },
  { name: "PUFF MINI SHOULDER BAG", price: 79.99 },
  { name: "PUFF PORTA PITEIRA", price: 28.90 },
  { name: "PUFF TUBO", price: 20.90 },
  { name: "PUFF ZIP 1.0", price: 0.00 },
  { name: "SEDA RAW C/ PITEIRA", price: 230.00 },
  { name: "SEDA RAW ORIGINAL", price: 270.00 },
  { name: "REFIL VOLCANO", price: 25.00 },
  { name: "SATYA INCENSO - (12 CX COM 12 VARETAS)", price: 95.00 },
  { name: "SEDA ALEDA 1/4 MINI SIZE", price: 45.00 },
  { name: "SEDA BEM BOLADO BROWN LARGE CX C 50UN", price: 140.00 },
  { name: "SEDA BEM BOLADO BROWN SLIM CX C 50UN", price: 130.00 },
  { name: "SEDA BEM BOLADO LARGE CX C 50UN", price: 105.00 },
  { name: "SEDA BEM BOLADO LONG SIZE LARGE", price: 0.00 },
  { name: "SEDA BEM BOLADO SLIM CX C 50UN", price: 105.00 },
  { name: "SEDA ELEMENTS SLIM", price: 240.00 },
  { name: "SEDA KING PAPER BROWN", price: 40.00 },
  { name: "SEDA KING PAPER WHITE", price: 14.00 },
  { name: "SEDA OCB MINI SIZE", price: 0.00 },
  { name: "SEDA PAPELITO BRANCO SLIM", price: 100.00 },
  { name: "SEDA PAPELITO BROWN KING SIZE", price: 120.00 },
  { name: "SEDA PAPELITO BROWN LONGA", price: 90.00 },
  { name: "SEDA PAPELITO BROWN SLIM", price: 120.00 },
  { name: "SEDA PAPELITO TRADICIONAL (AMARELO) C/ 50", price: 96.00 },
  { name: "SEDA PAPELITO TRADICIONAL LONGA", price: 75.00 },
  { name: "SEDA PAPELITO TROPICAL", price: 105.00 },
  { name: "SEDA + PITEIRA ALEDA LIMITED EDITION BRANCO KING SIZE REGULAR - DISPLAY COM 24 LIVRETOS", price: 150.00 },
  { name: "SEDA PUFF LIFE", price: 103.50 },
  { name: "SEDA RAW BLACK", price: 320.00 },
  { name: "SEDA RAW CLÁSSICA", price: 290.00 },
  { name: "SEDA SABOTAGE BEM BOLADO", price: 80.00 },
  { name: "SEDA SMOKING BROWN", price: 0.00 },
  { name: "SEDA SMOKING SUPREME KS", price: 200.00 },
  { name: "SEDA TATU DO BEM BROWN", price: 55.00 },
  { name: "SEDA TATU DO BEM LARANJA", price: 50.00 },
  { name: "SEDA TATU DO BEM VERDE", price: 50.00 },
  { name: "SILVER INCENSO - (12 CX COM 12 VARETAS)", price: 95.00 },
  { name: "SILVER INCENSO MINI - (25 CXS COM 7 VARETAS)", price: 115.00 },
  { name: "SLICK TONABE 5 ML SILICONE C/10", price: 65.00 },
  { name: "SLICK VIDRO TONABE DISPLAY COM 6 UNID", price: 75.00 },
  { name: "SMOLKING BROWN ORIGINAL CX C/50 LIVRETOS", price: 240.00 },
  { name: "SMOLKING PRATA  (ORIGINAL) CX C/50 LIVRETOS", price: 220.00 },
  { name: "SMOLKING PRETO (ORIGINAL) CX C/50 LIVRETOS", price: 220.00 },
  { name: "SNICKERS BRANCO", price: 69.99 },
  { name: "SNICKERS TRADICIONAL", price: 69.99 },
  { name: "TESOURA AÇO INOXIDAVEL", price: 10.00 },
  { name: "TESOURA TONABE", price: 80.00 },
  { name: "TOLIMPÃO TONABE", price: 0.00 },
  { name: "ZOMO BROWN 50 LIVRETOS", price: 70.00 },
  { name: "ZOMO ALFAFA CX C 50", price: 90.00 },
  { name: "ZOMO BLACK CX C 50UN", price: 70.00 },
  { name: "ZOMO PINK CX C 25UN", price: 35.00 },
];

// Function to categorize products based on name
function getCategoryByName(name) {
  const nameUpper = name.toUpperCase();
  
  if (nameUpper.includes('CHARUTO') || nameUpper.includes('COHIBA') || nameUpper.includes('MONTECRISTO') || nameUpper.includes('ROMEO')) return 'charuto';
  if (nameUpper.includes('NARGUILÉ') || nameUpper.includes('NARGUILE') || nameUpper.includes('ESSÊNCIA') || nameUpper.includes('FUMO')) return 'narguilé';
  if (nameUpper.includes('CACHIMBO')) return 'cachimbo';
  if (nameUpper.includes('CIGARRO') || nameUpper.includes('CIGARRILHA') || nameUpper.includes('SMOKING')) return 'cigarro';
  
  return 'acessório';
}

// Build products array with categories
const products = productList.map((item, idx) => ({
  id: idx + 1,
  name: item.name,
  cat: getCategoryByName(item.name),
  price: item.price,
  desc: `Produto ${item.name}. De alta qualidade e melhor preço.`,
  img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70"
}));

let cart = [];
let activeFilter = 'all';
let productsPerPage = 24;
let currentPage = 1;

/* ─────────────────────────────────────────
   CUSTOM CURSOR
───────────────────────────────────────── */
function initCursor() {
  // custom cursor and its animations have been disabled per user request
  // to restore the native mouse pointer. This function is left here as a
  // no-op in case other code still tries to call it.
}

/* ─────────────────────────────────────────
   HERO PARTICLES
───────────────────────────────────────── */
function initParticles() {
  const container = document.querySelector('.hero-particles');
  if (!container) return;

  const count = window.innerWidth <= 600 ? 12 : 28;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      --dur: ${Math.random() * 8 + 6}s;
      --delay: ${Math.random() * 8}s;
      --dx: ${(Math.random() - 0.5) * 120}px;
      --op: ${Math.random() * 0.5 + 0.2};
    `;
    container.appendChild(p);
  }
}

/* ─────────────────────────────────────────
   SCROLL REVEAL (IntersectionObserver)
───────────────────────────────────────── */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Animate dividers
        if (entry.target.classList.contains('divider')) {
          entry.target.classList.add('revealed');
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .divider')
    .forEach(el => observer.observe(el));
}

/* ─────────────────────────────────────────
   PRODUCT CARDS — staggered entrance
───────────────────────────────────────── */
function animateCards() {
  const cards = document.querySelectorAll('.product-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = (parseInt(entry.target.dataset.idx) % 4) * 90;
        setTimeout(() => entry.target.classList.add('card-visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -20px 0px' });

  cards.forEach((card, i) => {
    card.dataset.idx = i;
    // Reset for re-animation on filter change
    card.style.transition = `opacity 0.55s cubic-bezier(0.16,1,0.3,1) ${(i % 4) * 0.08}s, transform 0.55s cubic-bezier(0.16,1,0.3,1) ${(i % 4) * 0.08}s`;
    observer.observe(card);
  });
}

/* ─────────────────────────────────────────
   HEADER SCROLL EFFECT
───────────────────────────────────────── */
function initHeaderScroll() {
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });
}

/* ─────────────────────────────────────────
   CATALOG
───────────────────────────────────────── */
function renderCatalog(filter = 'all', reset = true) {
  if (reset) {
    currentPage = 1;
  }

  const grid = document.getElementById('catalog-grid');
  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);
  const start = 0;
  const end = currentPage * productsPerPage;
  const paginated = filtered.slice(start, end);

  if (reset) {
    grid.innerHTML = '';
  }

  const html = paginated.map(p => `
    <div class="product-card ${cart.find(c => c.id === p.id) ? 'selected' : ''}" id="card-${p.id}" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70'" />
      </div>
      <div class="product-body">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price"><span>R$</span> ${p.price.toFixed(2).replace('.', ',')}</div>
          <button class="add-btn" title="Selecionar">
            ${cart.find(c => c.id === p.id) ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  `).join('');

  if (reset) {
    grid.innerHTML = html;
  } else {
    grid.innerHTML += html;
  }

  // Update load more button visibility
  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) {
    loadBtn.style.display = end < filtered.length ? 'block' : 'none';
  }

  // Trigger staggered card animations
  requestAnimationFrame(() => animateCards());
}

function loadMoreProducts() {
  currentPage++;
  const filtered = activeFilter === 'all' ? products : products.filter(p => p.cat === activeFilter);
  
  const start = (currentPage - 1) * productsPerPage;
  const end = currentPage * productsPerPage;
  const toAdd = filtered.slice(start, end);

  const grid = document.getElementById('catalog-grid');
  const html = toAdd.map(p => `
    <div class="product-card ${cart.find(c => c.id === p.id) ? 'selected' : ''}" id="card-${p.id}" onclick="toggleProduct(${p.id})">
      <div class="product-img-wrap">
        <img class="product-img" src="${p.img}" alt="${p.name}" loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70'" />
      </div>
      <div class="product-body">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-footer">
          <div class="product-price"><span>R$</span> ${p.price.toFixed(2).replace('.', ',')}</div>
          <button class="add-btn" title="Selecionar">
            ${cart.find(c => c.id === p.id) ? '✓' : '+'}
          </button>
        </div>
      </div>
    </div>
  `).join('');

  grid.innerHTML += html;

  // Update load more button
  const loadBtn = document.getElementById('load-more-btn');
  if (loadBtn) {
    loadBtn.style.display = end < filtered.length ? 'block' : 'none';
  }

  requestAnimationFrame(() => animateCards());
  
  // Scroll to new products
  setTimeout(() => {
    const newCards = document.querySelectorAll('.product-card');
    if (newCards.length > 0) {
      newCards[newCards.length - 12]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

function filterProducts(cat, btn) {
  activeFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) {
    btn.classList.add('active');
  } else {
    document.querySelectorAll('.filter-btn').forEach(b => {
      if (b.textContent.toLowerCase().includes(cat === 'all' ? 'todos' : cat))
        b.classList.add('active');
    });
  }
  renderCatalog(cat, true);
}

function toggleProduct(id) {
  const product = products.find(p => p.id === id);
  const idx = cart.findIndex(c => c.id === id);
  if (idx > -1) { cart.splice(idx, 1); }
  else { cart.push(product); }
  updateCartUI();
  renderCatalog(activeFilter, false);
}

/* ─────────────────────────────────────────
   AGE GATE
───────────────────────────────────────── */
function confirmAge(isAdult) {
  if (isAdult) {
    const gate = document.getElementById('age-gate');
    gate.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    gate.style.opacity = '0';
    gate.style.transform = 'scale(1.04)';

    setTimeout(() => {
      gate.style.display = 'none';
      const site = document.getElementById('main-site');
      site.classList.add('visible');

      // Stagger site entrance
      requestAnimationFrame(() => {
        initScrollReveal();
        renderCatalog();
        updateCartUI();
        checkStoreStatus();
        initParticles();
        // initCursor() — disabled, native cursor will show
        initHeaderScroll();
      });
    }, 500);
  } else {
    document.getElementById('age-gate').style.display = 'none';
    document.getElementById('age-warning').classList.add('show');
  }
}

/* ─────────────────────────────────────────
   STORE STATUS
───────────────────────────────────────── */
function checkStoreStatus() {
  const now  = new Date();
  const day  = now.getDay();
  const time = now.getHours() * 60 + now.getMinutes();
  let open = false;
  if (day >= 1 && day <= 5) open = time >= 540 && time < 1080;
  if (day === 6)            open = time >= 540 && time < 780;
  const el = document.getElementById('store-status');
  el.innerHTML = open
    ? '<span class="status-badge status-open">● Aberto agora</span>'
    : '<span class="status-badge status-closed">● Fechado no momento</span>';
}

/* ─────────────────────────────────────────
   NAV — MEGA MENU
───────────────────────────────────────── */
let activeNavItem = null;
let navOpen = false;

function toggleNavItem(id) {
  const el = document.getElementById(id);
  if (activeNavItem && activeNavItem !== el) activeNavItem.classList.remove('active');
  const isNowActive = el.classList.toggle('active');
  activeNavItem = isNowActive ? el : null;
  document.getElementById('nav-overlay').classList.toggle('show', isNowActive);
}

function closeAllNav() {
  document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
  activeNavItem = null;
  document.getElementById('nav-overlay').classList.remove('show');
}

function toggleNav() {
  navOpen = !navOpen;
  document.getElementById('nav-drawer').classList.toggle('open', navOpen);
  document.getElementById('hamburger').classList.toggle('open', navOpen);
  document.body.style.overflow = navOpen ? 'hidden' : '';
}

function closeNav() {
  navOpen = false;
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = '';
}

function toggleDrawerSub(btn) {
  const sub = btn.nextElementSibling;
  const isOpen = sub.classList.toggle('open');
  btn.classList.toggle('open', isOpen);
}

/* ─────────────────────────────────────────
   CART
───────────────────────────────────────── */
function updateCartUI() {
  const count = cart.length;

  // Update all counters
  ['cart-count', 'hci-badge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = count;
      el.classList.remove('pop');
      requestAnimationFrame(() => el.classList.add('pop'));
    }
  });

  const fabCount = document.getElementById('cart-fab-count');
  if (fabCount) fabCount.textContent = count;

  // FAB visibility (controlled also by scroll)
  const fab = document.getElementById('cart-fab');
  if (fab) {
    const heroH = document.querySelector('.hero')?.offsetHeight || 400;
    fab.style.display = (window.scrollY > heroH && count > 0) ? 'flex' : 'none';
  }

  const list = document.getElementById('cart-items-list');
  if (!list) return;

  if (count === 0) {
    list.innerHTML = '<div class="cart-empty">Nenhum produto selecionado ainda.<br>Explore nosso catálogo! 🚬</div>';
    document.getElementById('cart-total-price').textContent = 'R$ 0,00';
  } else {
    const total = cart.reduce((s, p) => s + p.price, 0);
    list.innerHTML = cart.map(p => `
      <div class="cart-item">
        <img class="cart-item-img" src="${p.img}" alt="${p.name}"
          onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">R$ ${p.price.toFixed(2).replace('.', ',')}</div>
        </div>
        <button class="remove-item" onclick="event.stopPropagation(); toggleProduct(${p.id})" aria-label="Remover">✕</button>
      </div>
    `).join('');
    document.getElementById('cart-total-price').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
  }
}

function toggleCart() {
  const panel   = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  const isOpen  = panel.classList.toggle('open');
  overlay.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  if (navOpen) closeNav();
}

/* ─────────────────────────────────────────
   CHECKOUT
───────────────────────────────────────── */
function openCheckout() {
  if (cart.length === 0) { alert('Selecione ao menos um produto!'); return; }

  document.getElementById('cart-panel').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');

  const total   = cart.reduce((s, p) => s + p.price, 0);
  const summary = document.getElementById('order-summary');
  summary.innerHTML = `
    <div class="order-summary-title">Resumo do Pedido</div>
    ${cart.map(p => `
      <div class="order-summary-item">
        <span>${p.name}</span>
        <span>R$ ${p.price.toFixed(2).replace('.', ',')}</span>
      </div>`).join('')}
    <div class="order-summary-item" style="border-top:1px solid #C9A84C22;margin-top:.5rem;padding-top:.5rem;color:var(--gold);">
      <strong>Total estimado</strong>
      <strong>R$ ${total.toFixed(2).replace('.', ',')}</strong>
    </div>
  `;

  document.getElementById('checkout-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.remove('open');
  document.body.style.overflow = '';
}

function sendToWhatsApp() {
  const nome     = document.getElementById('field-nome').value.trim();
  const cpf      = document.getElementById('field-cpf').value.trim();
  const endereco = document.getElementById('field-endereco').value.trim();
  const telefone = document.getElementById('field-telefone').value.trim();
  const email    = document.getElementById('field-email').value.trim();

  if (!nome || !cpf || !endereco || !telefone) {
    alert('Por favor, preencha todos os campos obrigatórios (*).');
    return;
  }

  const total = cart.reduce((s, p) => s + p.price, 0);
  const lista = cart.map(p => `• ${p.name} – R$ ${p.price.toFixed(2).replace('.', ',')}`).join('\n');

  const msg =
    `🚬 *PEDIDO - TABACARIA*\n\n` +
    `📋 *Dados do Cliente:*\n` +
    `Nome: ${nome}\n` +
    `CPF/CNPJ: ${cpf}\n` +
    `Endereço: ${endereco}\n` +
    `Telefone: ${telefone}\n` +
    (email ? `E-mail: ${email}\n` : '') +
    `\n🛒 *Produtos Selecionados:*\n${lista}\n\n` +
    `💰 *Total Estimado: R$ ${total.toFixed(2).replace('.', ',')}*\n\n` +
    `Aguardo confirmação de disponibilidade e valores. Obrigado!`;

  const whatsappNumber = '5531900000000'; // ← substitua pelo número real
  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  closeCheckout();
}

/* ─────────────────────────────────────────
   FAQ
───────────────────────────────────────── */
function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  const isOpen = answer.classList.contains('open');
  document.querySelectorAll('.faq-answer').forEach(a => a.classList.remove('open'));
  document.querySelectorAll('.faq-question').forEach(b => b.classList.remove('active'));
  if (!isOpen) { answer.classList.add('open'); btn.classList.add('active'); }
}

/* ─────────────────────────────────────────
   SCROLL LISTENER
───────────────────────────────────────── */
window.addEventListener('scroll', () => {
  if (navOpen) closeNav();
  if (activeNavItem) closeAllNav();

  const heroH = document.querySelector('.hero')?.offsetHeight || 400;
  const fab   = document.getElementById('cart-fab');
  if (fab) {
    fab.style.display = (window.scrollY > heroH && cart.length > 0) ? 'flex' : 'none';
  }
}, { passive: true });

/* ─────────────────────────────────────────
   CLOSE MODAL ON BACKDROP CLICK
───────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.addEventListener('click', e => { if (e.target === modal) closeCheckout(); });
  }
});