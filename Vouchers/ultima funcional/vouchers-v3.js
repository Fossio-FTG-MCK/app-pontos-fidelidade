
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
  ],
  activeVouchers: [
    {
      id: 1,
      title: 'Desconto no Spa',
      points: 1000
    },
    {
      id: 2,
      title: 'Almoço Executivo',
      points: 800
    }
  ],
  partners: [
    {
      id: 1,
      name: "Restaurante Praia Azul",
      image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 2,
      name: "Quiosque Pé na Areia",
      image: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 3,
      name: "Bar do Mar",
      image: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 4,
      name: "Shopping Cabo Mall",
      image: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 5,
      name: "Translado Executivo",
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
    },
    {
      id: 6,
      name: "Spa Oceano",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80"
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

function renderActiveVouchers() {
  const list = document.getElementById('active-voucher-list');
  const empty = document.getElementById('no-active-vouchers');

  list.innerHTML = '';

  if (!userData.activeVouchers || userData.activeVouchers.length === 0) {
    list.style.display = 'none';
    if (empty) empty.style.display = 'block';
    return;
  }

  list.style.display = 'flex';
  if (empty) empty.style.display = 'none';

  userData.activeVouchers.forEach(voucher => {
    const item = document.createElement('div');
    item.className = 'voucher-item';
    item.innerHTML = `
      <div class="voucher-title">${voucher.title}</div>
      <div class="voucher-points">${voucher.points} pontos</div>
    `;
    list.appendChild(item);
  });
}

function renderPartnerIcons() {
  const container = document.getElementById('partners-scroll');
  if (!container || !userData.partners) return;

  container.innerHTML = '';

  userData.partners.forEach((partner, index) => {
    const div = document.createElement('div');
    div.className = 'partner-icon';
    div.innerHTML = `
      <img src="${partner.image}" alt="${partner.name}">
    `;
    div.addEventListener('click', () => {
      showPartnerProfile(partner.id || index + 1);
    });
    container.appendChild(div);
  });
}

function initPartnerProfileEvents() {
  // Removido: substituído pela renderPartnerIcons que já inclui os eventos de clique
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
  renderActiveVouchers();
  renderPartnerIcons();
});

// Override do showSection para garantir update local
const originalShowSection = window.showSection;
window.showSection = function (id) {
  if (id === 'vouchers') {
    updateVouchersScreen();
    renderActiveVouchers();
    renderPartnerIcons();
  }
  if (typeof originalShowSection === 'function') {
    originalShowSection(id);
  }
};
