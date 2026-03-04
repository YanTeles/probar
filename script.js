/* ============================================================
   TABACARIA PREMIUM — script.js
   ============================================================ */

'use strict';

// ===== PRODUCTS DATA =====
const products = [
  { id: 1,  name: "Charuto Cohiba Siglo IV",         cat: "charuto",   price: 189.90, desc: "Cubano premium de sabor complexo, com notas amadeiradas e terrosas.",          img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70" },
  { id: 2,  name: "Charuto Montecristo No. 4",        cat: "charuto",   price: 145.00, desc: "Clássico cubano equilibrado, perfeito para iniciantes e veteranos.",            img: "https://images.unsplash.com/photo-1519311726-5bcd1f5d8b2c?w=400&q=70" },
  { id: 3,  name: "Charuto Romeo y Julieta",          cat: "charuto",   price: 119.90, desc: "Sabor suave com toque floral. Ideal para momentos especiais.",                  img: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=70" },
  { id: 4,  name: "Narguilé Luxo Egípcio",            cat: "narguilé",  price: 399.00, desc: "Estrutura em aço inox, design clássico egípcio. Altura 80cm.",                  img: "https://images.unsplash.com/photo-1611070027792-3a8e2dcdb6a2?w=400&q=70" },
  { id: 5,  name: "Essência Al Fakher Dupla Maçã",    cat: "narguilé",  price: 39.90,  desc: "250g. Sabor icônico de maçã verde e vermelha, o clássico do narguilé.",         img: "https://images.unsplash.com/photo-1515859005217-8a1f08870f59?w=400&q=70" },
  { id: 6,  name: "Essência Adalya Love 66",          cat: "narguilé",  price: 44.90,  desc: "250g. Mistura frutal com notas de morango, melão e menta.",                     img: "https://images.unsplash.com/photo-1558618047-f4a21ec05e3c?w=400&q=70" },
  { id: 7,  name: "Cachimbo Briar Importado",         cat: "cachimbo",  price: 229.00, desc: "Cachimbo artesanal em raiz de urze, filtro de 9mm. Alta durabilidade.",         img: "https://images.unsplash.com/photo-1564419320461-6870880221ad?w=400&q=70" },
  { id: 8,  name: "Fumo Captain Black",               cat: "cachimbo",  price: 49.90,  desc: "42g. Blend suave com toque de baunilha e mel. Americano premium.",              img: "https://images.unsplash.com/photo-1524486361537-8ad15b9d7e9e?w=400&q=70" },
  { id: 9,  name: "Cigarro Marlboro Gold",            cat: "cigarro",   price: 12.50,  desc: "Maço com 20 unidades. Sabor suave e equilibrado.",                              img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70" },
  { id: 10, name: "Cigarrilha Café Crème",            cat: "cigarro",   price: 32.00,  desc: "Caixa com 10 unidades. Sabor cremoso com aroma de café.",                      img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70" },
  { id: 11, name: "Isqueiro Zippo Original",          cat: "acessório", price: 159.00, desc: "Zippo Street Chrome clássico. Recarregável, garantia vitalícia.",               img: "https://images.unsplash.com/photo-1514314939-6f6a0d9e2c8d?w=400&q=70" },
  { id: 12, name: "Cortador de Charuto Premium",      cat: "acessório", price: 89.90,  desc: "Guilhotina dupla lâmina em aço inox. Corte preciso e limpo.",                   img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=70" },
];

let cart = [];
let activeFilter = 'all';

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
function renderCatalog(filter = 'all') {
  const grid = document.getElementById('catalog-grid');
  const filtered = filter === 'all' ? products : products.filter(p => p.cat === filter);

  grid.innerHTML = filtered.map(p => `
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

  // Trigger staggered card animations
  requestAnimationFrame(() => animateCards());
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
  renderCatalog(cat);
}

function toggleProduct(id) {
  const product = products.find(p => p.id === id);
  const idx = cart.findIndex(c => c.id === id);
  if (idx > -1) { cart.splice(idx, 1); }
  else { cart.push(product); }
  updateCartUI();
  renderCatalog(activeFilter);
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