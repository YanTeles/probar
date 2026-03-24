/* ============================================================
   TABACARIA PREMIUM — script.js
   ============================================================ */

'use strict';

// ===== PRODUCTS DATA =====
// DICA: O nome no 'img' deve ser IGUALZINHO ao arquivo na pasta assets/produtos
const productList = [
  { name: "ALEDA CELULOSE KING SIZE", price: 53.00, img: "aleda-celulose.jpg" },
  { name: "ALUMINIO PARA NARGUILE", price: 15.00, img: "aluminio-narguile.jpg" },
  { name: "BAG G TONABE", price: 65.00, img: "bag-g.jpg" },
  { name: "BAG P TONABE", price: 25.00, img: "bag-p.jpg" },
  { name: "BOLADOR HI TOBACCO 110MM", price: 11.50, img: "bolador-110.jpg" },
  { name: "BOLADOR HI TOBACCO 78 MM", price: 10.55, img: "bolador-78.jpg" },
  { name: "CAIXA TUBELITO PORTA CIGARROS PAPELITO C/ 12", price: 110.00, img: "tubelito.jpg" },
  { name: "CARVÃO ZOMO 1KG", price: 30.00, img: "carvao-zomo.jpg" },
  { name: "CASE SADHU IMPERMEÁVEL G", price: 57.00, img: "case-sadhu.jpg" },
  { name: "CASE TONABE GRANDE", price: 30.00, img: "case-tonabe-g.jpg" },
  { name: "CASE TONABE PEQUENA", price: 25.00, img: "case-tonabe-p.jpg" },
  { name: "CINZEIRO AUTOMOTIVO TONABE", price: 65.00, img: "cinzeiro-auto.jpg" },
  { name: "CINZEIRO DE VIDRO TONABE", price: 15.00, img: "cinzeiro-vidro.jpg" },
  { name: "CINZEIRO SQUADAFUM QUADRADO GRANDE", price: 29.90, img: "cinzeiro-sq-g.jpg" },
  { name: "CINZEIRO SQUADAFUM REDONDO PEQUENO", price: 20.99, img: "cinzeiro-sq-p.jpg" },
  { name: "CLIPPER GRANDE 24UN", price: 129.60, img: "clipper-24.jpg" },
  { name: "CONES PRE BOLADOS G", price: 25.00, img: "cones-g.jpg" },
  { name: "CONES PRE BOLADOS P", price: 12.50, img: "cones-p.jpg" },
  { name: "CUIA SILICONE TONABE", price: 8.00, img: "cuia-silicone.jpg" },
  { name: "DIAMANTE NEGRO DP C/12X34G", price: 39.99, img: "diamante-negro.jpg" },
  { name: "DICHAVADOR ACRÍLICO BEM BOLADO PEQUENO DISPLAY COM 7 UNIDADES", price: 66.90, img: "dichavadorBemBolado.jpeg" },
  { name: "DICHAVADOR FIBRA DE COCO", price: 3.00, img: "dichavador-coco.jpg" },
  { name: "DICHAVADOR TONABE", price: 30.00, img: "dichavador-tonabe.jpg" },
  { name: "DICHAV. BEM BOLADO ACRILICO GD", price: 138.90, img: "dichavador-bb-g.jpg" },
  { name: "DROP HALLS CEREJA", price: 25.50, img: "halls-cereja.jpg" },
  { name: "DROP HALLS EXTRA FORTE PRETO", price: 25.50, img: "halls-preto.jpg" },
  { name: "DROP HALLS MELANCIA", price: 25.20, img: "halls-melancia.jpg" },
  { name: "DROP HALLS MENTA VERDE", price: 25.20, img: "halls-menta.jpg" },
  { name: "DROP HALLS MENTOL AZUL", price: 25.20, img: "halls-azul.jpg" },
  { name: "DROP HALLS MORANGO", price: 25.20, img: "halls-morango.jpg" },
  { name: "FLUIDO VOLCANO", price: 21.50, img: "fluido-volcano.jpg" },
  { name: "GAS VOLCANO", price: 21.90, img: "gas-volcano.jpg" },
  { name: "GATORADE FD C 6", price: 29.34, img: "gatorade.jpg" },
  { name: "GUDA - INCENSO (25 CX COM 7 VARETAS)", price: 30.00, img: "incenso-guda.jpg" },
  { name: "HERBAL WRAP KING MIX SABORES VARIADOS KING SIZE REGULAR - DISPLAY COM 25 BAGS", price: 125.00, img: "kingHerbalWrap.jpeg" },
  { name: "HEXAGONAL SILVER INCENSO - (6 CXS COM 20 VARETAS)", price: 30.00, img: "incenso-hex.jpg" },
  { name: "INDIA SOUL INCENSO (12 CX COM 13 VARETAS)", price: 95.00, img: "incenso-india.jpg" },
  { name: "ISQUEIRO BIC MAXI CARTELA C/12", price: 51.00, img: "bic-maxi.jpg" },
  { name: "ISQUEIRO BIC MINI CARTELA C/12", price: 39.00, img: "bic-mini.jpg" },
  { name: "ISQUEIRO CRICKET C/10", price: 45.90, img: "cricket.jpg" },
  { name: "ISQUEIRO HIPER BANDEJA C/ 50 UN", price: 60.00, img: "isqueiro-hiper.jpg" },
  { name: "LAKA BRANCO DP C/12X34G", price: 39.99, img: "laka.jpg" },
  { name: "MAÇARICO NAAR", price: 0.00, img: "macarico-naar.jpg" },
  { name: "MACARICO SADHU", price: 25.00, img: "macarico-sadhu.jpg" },
  { name: "MAÇARICO ZENGAZ CORES", price: 24.00, img: "macarico-zengaz.jpg" },
  { name: "NEW PUFF ISQUEIRO EMBORRACHADO", price: 27.50, img: "new-puff-isq.jpg" },
  { name: "NEW PUFF SHOULDER BAG - CINZA", price: 129.90, img: "bag-cinza.jpg" },
  { name: "NEW PUFF SHOULDER BAG - PINK", price: 129.90, img: "bag-pink.jpg" },
  { name: "NEW PUFF SHOULDER BAG - PRETA", price: 129.90, img: "bag-preta.jpg" },
  { name: "NEW PUFF SHOULDER BAG - VERDE", price: 129.90, img: "bag-verde.jpg" },
  { name: "OCB", price: 210.00, img: "ocb.jpg" },
  { name: "PACOCA RIQUITA RETANGULAR CX C 170 UN", price: 45.90, img: "pacoca-ret.jpg" },
  { name: "PAÇOCA RIQUITA ROLHINHA CX COM 100 UN", price: 24.90, img: "pacoca-rolha.jpg" },
  { name: "PAÇOCA TIPO CASEIRA UN", price: 0.99, img: "pacoca-un.jpg" },
  { name: "PALHA CAPITÃO", price: 125.00, img: "palha-capitao.jpg" },
  { name: "PALHA ESPECIAL MATA LEÃO", price: 125.00, img: "palha-mata-leao.jpg" },
  { name: "PAPEL SEDA ALEDA OURO BROWN", price: 39.99, img: "aleda-ouro.jpg" },
  { name: "PAPEL SEDA ALEDA PRATA KING SIZE", price: 39.99, img: "aleda-prata.jpg" },
  { name: "PAPEL TRANSPARENTE ALEDA BLUE SIZE - DISPLAY COM 20 UNIDADES PT ALEDA BS", price: 50.00, img: "aleda-blue.jpg" },
  { name: "PAY PAY ALFAFA", price: 235.00, img: "pay-pay.jpg" },
  { name: "PITEIRA BEM BOLADO BROWN LARGE", price: 58.90, img: "piteira-bb-brown.jpg" },
  { name: "PITEIRA BEM BOLADO EXTRA LARGE CX 24X32", price: 65.00, img: "piteira-bb-xl.jpg" },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN ROXA", price: 95.00, img: "piteira-gig-roxa.jpg" },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN (ROXA HIPER LARGE)", price: 100.00, img: "piteira-gig-hiper.jpg" },
  { name: "PITEIRA BEM BOLADO GIRLS IN GREEN (VERDE)", price: 95.00, img: "piteira-gig-verde.jpg" },
  { name: "PITEIRA BEM BOLADO POP LARGE (VERDE)", price: 56.00, img: "piteira-pop-l.jpg" },
  { name: "PITEIRA BEM BOLADO POP SLIM (LARANJA)", price: 51.00, img: "piteiraBemBoladoLaranja.jpeg" },
  { name: "PITEIRA BEM BOLADO PREMIUM", price: 55.00, img: "piteira-bb-prem.jpg" },
  { name: "PITEIRA DE PAPEL MEGA LONGA TONABE", price: 125.00, img: "piteira-mega.jpg" },
  { name: "PITEIRA TONABE COTTON", price: 90.00, img: "piteira-cotton.jpg" },
  { name: "PITEIRA TONABE EXTRA LARGE", price: 99.00, img: "piteira-xl.jpg" },
  { name: "PITEIRA TONABE LARGE PAPEL VERGÊ", price: 100.00, img: "piteira-verge.jpg" },
  { name: "PITEIRA TONABE LIXO MANIA CX C 30", price: 75.00, img: "piteira-lixo.jpg" },
  { name: "PITEIRA TONABE ULTRA LONGA C 30", price: 120.00, img: "piteira-ultra.jpg" },
  { name: "PITEIRA ULTRA LONGA TONABE", price: 99.00, img: "piteira-ultra-2.jpg" },
  { name: "PITEIRA YELLOW FINGER ROXA", price: 89.90, img: "yellow-roxa.jpg" },
  { name: "POTE HERMÉTICO", price: 12.00, img: "pote-hermetico.jpg" },
  { name: "PUFF ALÇA - GANJA", price: 34.90, img: "puff-ganja.jpg" },
  { name: "PUFF ALÇA - RELEVO", price: 34.90, img: "puff-relevo.jpg" },
  { name: "PUFF CASE CLÁSSICA VENTS", price: 109.99, img: "puff-vents.jpg" },
  { name: "PUFF CASE CLASSICO - COLORS", price: 101.90, img: "puff-colors.jpg" },
  { name: "PUFF CASE CLASSICO - CREME", price: 99.90, img: "puff-creme.jpg" },
  { name: "PUFF CASE CLASSICO LIL WHIND", price: 107.90, img: "puff-whind.jpg" },
  { name: "PUFF CASE CLASSICO - PRETO", price: 99.90, img: "puff-preto.jpg" },
  { name: "PUFF CASE CLASSICO RAW", price: 119.90, img: "puff-raw.jpg" },
  { name: "PUFF CASE CLASSICO - STREET", price: 101.90, img: "puff-street.jpg" },
  { name: "PUFF CASE MINI - CREME", price: 59.90, img: "puff-mini-creme.jpg" },
  { name: "PUFF CASE MINI PRETO", price: 59.90, img: "puff-mini-preto.jpg" },
  { name: "PUFF CASE PITEIRA DE VIDRO COLLAB HIPPIE BONG", price: 99.90, img: "puff-hippie.jpg" },
  { name: "PUFF CASE PRO COLORS", price: 169.99, img: "puff-pro-colors.jpg" },
  { name: "PUFF CASE PRO LIL WHIND", price: 173.90, img: "puff-pro-whind.jpg" },
  { name: "PUFF CASE PRO - PRETO", price: 154.90, img: "puff-pro-preto.jpg" },
  { name: "PUFF CASE PRO - RAW CASTOR", price: 0.00, img: "puff-pro-raw.jpg" },
  { name: "PUFF CASE PRO VENTS", price: 175.99, img: "puff-pro-vents.jpg" },
  { name: "PUFF CASE SLIM ALEDA", price: 79.90, img: "puff-slim-aleda.jpg" },
  { name: "PUFF CASE SLIM BADAUI 2.0", price: 84.90, img: "puff-slim-badaui.jpg" },
  { name: "PUFF CASE SLIM BADEGO", price: 89.90, img: "puff-slim-badego.jpg" },
  { name: "PUFF CASE SLIM COLLORS", price: 89.99, img: "puff-slim-colors.jpg" },
  { name: "PUFF CASE SLIM - CREME", price: 74.99, img: "puff-slim-creme.jpg" },
  { name: "PUFF CASE SLIM LIL WHIND", price: 89.90, img: "puff-slim-whind.jpg" },
  { name: "PUFF CASE SLIM PRETO", price: 74.99, img: "puff-slim-preto.jpg" },
  { name: "PUFF CASE SLIM VENTS", price: 89.99, img: "puff-slim-vents.jpg" },
  { name: "PUFF CORDAO CHAVEIRO", price: 65.90, img: "puff-cordao.jpg" },
  { name: "PUFF HAND BAG URBAN", price: 83.90, img: "puff-urban.jpg" },
  { name: "PUFF MINI SHOULDER BAG", price: 79.99, img: "puff-mini-bag.jpg" },
  { name: "PUFF PORTA PITEIRA", price: 28.90, img: "puff-porta-piteira.jpg" },
  { name: "PUFF TUBO", price: 20.90, img: "puff-tubo.jpg" },
  { name: "PUFF ZIP 1.0", price: 0.00, img: "puff-zip.jpg" },
  { name: "SEDA RAW C/ PITEIRA", price: 230.00, img: "raw-piteira.jpg" },
  { name: "SEDA RAW ORIGINAL", price: 270.00, img: "raw-original.jpg" },
  { name: "REFIL VOLCANO", price: 25.00, img: "refil-volcano.jpg" },
  { name: "SATYA INCENSO - (12 CX COM 12 VARETAS)", price: 95.00, img: "satya.jpg" },
  { name: "SEDA ALEDA 1/4 MINI SIZE", price: 45.00, img: "aleda-mini.jpg" },
  { name: "SEDA BEM BOLADO BROWN LARGE CX C 50UN", price: 140.00, img: "bb-brown-l.jpg" },
  { name: "SEDA BEM BOLADO BROWN SLIM CX C 50UN", price: 130.00, img: "bb-brown-s.jpg" },
  { name: "SEDA BEM BOLADO LARGE CX C 50UN", price: 105.00, img: "bb-large.jpg" },
  { name: "SEDA BEM BOLADO LONG SIZE LARGE", price: 0.00, img: "bb-long.jpg" },
  { name: "SEDA BEM BOLADO SLIM CX C 50UN", price: 105.00, img: "bb-slim.jpg" },
  { name: "SEDA ELEMENTS SLIM", price: 240.00, img: "elements.jpg" },
  { name: "SEDA KING PAPER BROWN", price: 40.00, img: "king-brown.jpg" },
  { name: "SEDA KING PAPER WHITE", price: 14.00, img: "king-white.jpg" },
  { name: "SEDA OCB MINI SIZE", price: 0.00, img: "ocb-mini.jpg" },
  { name: "SEDA PAPELITO BRANCO SLIM", price: 100.00, img: "papelito-branco.jpg" },
  { name: "SEDA PAPELITO BROWN KING SIZE", price: 120.00, img: "papelito-brown-ks.jpg" },
  { name: "SEDA PAPELITO BROWN LONGA", price: 90.00, img: "papelito-brown-l.jpg" },
  { name: "SEDA PAPELITO BROWN SLIM", price: 120.00, img: "papelito-brown-s.jpg" },
  { name: "SEDA PAPELITO TRADICIONAL (AMARELO) C/ 50", price: 96.00, img: "papelito-trad.jpg" },
  { name: "SEDA PAPELITO TRADICIONAL LONGA", price: 75.00, img: "papelito-trad-l.jpg" },
  { name: "SEDA PAPELITO TROPICAL", price: 105.00, img: "papelito-tropical.jpg" },
  { name: "SEDA + PITEIRA ALEDA LIMITED EDITION BRANCO KING SIZE REGULAR - DISPLAY COM 24 LIVRETOS", price: 150.00, img: "aleda-ltd.jpg" },
  { name: "SEDA PUFF LIFE", price: 103.50, img: "puff-life.jpg" },
  { name: "SEDA RAW BLACK", price: 320.00, img: "raw-black.jpg" },
  { name: "SEDA RAW CLÁSSICA", price: 290.00, img: "raw-classic.jpg" },
  { name: "SEDA SABOTAGE BEM BOLADO", price: 80.00, img: "sabotage.jpg" },
  { name: "SEDA SMOKING BROWN", price: 0.00, img: "smoking-brown.jpg" },
  { name: "SEDA SMOKING SUPREME KS", price: 200.00, img: "smoking-supreme.jpg" },
  { name: "SEDA TATU DO BEM BROWN", price: 55.00, img: "tatu-brown.jpg" },
  { name: "SEDA TATU DO BEM LARANJA", price: 50.00, img: "tatu-laranja.jpg" },
  { name: "SEDA TATU DO BEM VERDE", price: 50.00, img: "tatu-verde.jpg" },
  { name: "SILVER INCENSO - (12 CX COM 12 VARETAS)", price: 95.00, img: "incenso-silver.jpg" },
  { name: "SILVER INCENSO MINI - (25 CXS COM 7 VARETAS)", price: 115.00, img: "incenso-silver-mini.jpg" },
  { name: "SLICK TONABE 5 ML SILICONE C/10", price: 65.00, img: "slick-silicone.jpg" },
  { name: "SLICK VIDRO TONABE DISPLAY COM 6 UNID", price: 75.00, img: "slick-vidro.jpg" },
  { name: "SMOLKING BROWN ORIGINAL CX C/50 LIVRETOS", price: 240.00, img: "smoking-br-50.jpg" },
  { name: "SMOLKING PRATA  (ORIGINAL) CX C/50 LIVRETOS", price: 220.00, img: "smoking-prata.jpg" },
  { name: "SMOLKING PRETO (ORIGINAL) CX C/50 LIVRETOS", price: 220.00, img: "smoking-preto.jpg" },
  { name: "SNICKERS BRANCO", price: 69.99, img: "snickers-branco.jpg" },
  { name: "SNICKERS TRADICIONAL", price: 69.99, img: "snickers-trad.jpg" },
  { name: "TESOURA AÇO INOXIDAVEL", price: 10.00, img: "tesoura.jpg" },
  { name: "TESOURA TONABE", price: 80.00, img: "tesoura-tonabe.jpg" },
  { name: "TOLIMPÃO TONABE", price: 0.00, img: "tolimpao.jpg" },
  { name: "ZOMO BROWN 50 LIVRETOS", price: 70.00, img: "zomo-brown.jpg" },
  { name: "ZOMO ALFAFA CX C 50", price: 90.00, img: "zomo-alfafa.jpg" },
  { name: "ZOMO BLACK CX C 50UN", price: 70.00, img: "zomo-black.jpg" },
  { name: "ZOMO PINK CX C 25UN", price: 35.00, img: "zomo-pink.jpg" },
];

function getCategoryByName(name) {
  const n = name.toUpperCase();
  if (n.includes('CHARUTO')) return 'charuto';
  if (n.includes('NARGUILÉ') || n.includes('NARGUILE') || n.includes('CARVÃO')) return 'narguilé';
  if (n.includes('CACHIMBO')) return 'cachimbo';
  if (n.includes('CIGARRO') || n.includes('SEDA') || n.includes('PAPEL')) return 'cigarro';
  return 'acessório';
}

const products = productList.map((item, idx) => ({
  id: idx + 1,
  name: item.name,
  cat: getCategoryByName(item.name),
  price: item.price,
  desc: `Produto premium para apreciadores.`,
  // AJUSTADO PARA O CAMINHO DA SUA IMAGEM: assets/produtos/
  img: `assets/produtos/${item.img}`, 
  fallback: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70"
}));

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
   CATALOG CORE & SEARCH
───────────────────────────────────────── */
function handleSearch(value) {
  searchTerm = value.toLowerCase();
  currentPage = 1;
  renderCatalog(activeFilter, true);
}

function renderCatalog(filter = 'all', reset = true) {
  if (reset) {
    currentPage = 1;
    productsPerPage = window.innerWidth <= 600 ? 4 : 8;
  }
  activeFilter = filter;

  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  let filtered = products.filter(p => {
    const matchesFilter = filter === 'all' || p.cat === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const end = currentPage * productsPerPage;
  const paginated = filtered.slice(0, end);

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

  if (reset) {
    grid.innerHTML = html;
  } else {
    grid.innerHTML += html;
  }

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
  renderCatalog(cat, true);
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
      renderCatalog();
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
  const msg = `🚬 *PEDIDO - TABACARIA*\n\n*Cliente:* ${campos.nome}\n*Endereço:* ${campos.end}\n\n*Produtos:*\n${lista}\n\n*Total: R$ ${total.toFixed(2).replace('.', ',')}*`;

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