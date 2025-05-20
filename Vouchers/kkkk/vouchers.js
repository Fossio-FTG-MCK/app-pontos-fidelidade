// const room = new WebsimSocket(); // Desativado para ambiente local
const room = {
  onmessage: null,
  party: {},
  collection: () => ({
    filter: () => ({ getList: async () => [] }),
    update: async () => {},
    create: async () => {}
  })
};

// DADOS FICTÍCIOS - REMOVER DEPOIS
const userData = {
  isLoggedIn: true,
  points: 3500,
  finishedVouchers: [
    {
      id: 1,
      title: 'Jantar Especial',
      partner: 'Restaurante Vista Mar',
      date: '2023-12-10',
      points: 1500,
      status: 'Utilizado'
    },
    {
      id: 2,
      title: 'Massagem Relaxante',
      partner: 'Spa Beira-Mar',
      date: '2023-11-15',
      points: 800,
      status: 'Expirado'
    }
  ]
};

function updateVouchersScreen() {
  const pointsValue = document.getElementById('vouchers-points-value');
  if (pointsValue) pointsValue.textContent = userData.points;
}

function showFinishedVouchers() {
  const container = document.getElementById('finished-vouchers-list');
  container.innerHTML = '';
  if (userData.finishedVouchers.length === 0) {
    container.innerHTML = '<p class="empty-state">Nenhum voucher finalizado encontrado</p>';
    return;
  }
  userData.finishedVouchers.forEach(voucher => {
    const statusClass = voucher.status === 'Utilizado' ? 'status-used' : 'status-expired';
    const item = document.createElement('div');
    item.className = 'finished-voucher-item';
    item.innerHTML = `
      <div class="voucher-header">
        <h4>${voucher.title}</h4>
        <span class="voucher-date">${voucher.date}</span>
      </div>
      <div class="voucher-details">
        <p>Parceiro: ${voucher.partner}</p>
        <p>Pontos: ${voucher.points}</p>
        <span class="voucher-status ${statusClass}">${voucher.status}</span>
      </div>
    `;
    container.appendChild(item);
  });
  document.getElementById('finished-vouchers-sidemenu').classList.add('active');
  document.getElementById('finished-vouchers-overlay').classList.add('active');
}

function hideFinishedVouchers() {
  document.getElementById('finished-vouchers-sidemenu').classList.remove('active');
  document.getElementById('finished-vouchers-overlay').classList.remove('active');
}

function initPartnerProfileEvents() {
  const partnerIcons = document.querySelectorAll('.partner-icon');
  partnerIcons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
      const partnerId = index + 1;
      showPartnerProfile(partnerId);
    });
  });
}

function setupEventListeners() {
  const btn = document.getElementById('vouchers-back');
  if (btn) btn.addEventListener('click', () => showSection('dashboard'));

  const btnFinished = document.querySelector('.btn-finished-vouchers');
  if (btnFinished) btnFinished.addEventListener('click', showFinishedVouchers);

  const closeBtn = document.getElementById('close-finished-vouchers');
  if (closeBtn) closeBtn.addEventListener('click', hideFinishedVouchers);

  const overlay = document.getElementById('finished-vouchers-overlay');
  if (overlay) overlay.addEventListener('click', hideFinishedVouchers);
}

document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateVouchersScreen();
  initPartnerProfileEvents();
});

// Override do showSection para garantir update local
const originalShowSection = window.showSection;
window.showSection = function (id) {
  if (id === 'vouchers') {
    updateVouchersScreen();
  }
  if (typeof originalShowSection === 'function') {
    originalShowSection(id);
  }
};
