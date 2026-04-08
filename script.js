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

function toggleAdminModal() {
  alert('Acesso de Admin não configurado');
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

  // Catálogo estático
  const grid = document.getElementById('catalog-grid');
  if (grid) {
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:#888;">Catálogo em manutenção - WhatsApp para produtos! 📱</div>';
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
