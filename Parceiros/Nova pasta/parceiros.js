
// ===========================================
// DADOS FICTÍCIOS PARA TESTES - REMOVER DEPOIS
// ===========================================
const parceirosFicticios = [
  {
    nome: "Restaurante Sabor do Mar",
    imagem: "https://via.placeholder.com/80",
    novo: true
  },
  {
    nome: "Agência de Passeios Cabo Tour",
    imagem: "https://via.placeholder.com/80",
    novo: false
  },
  {
    nome: "Spa Relaxar",
    imagem: "https://via.placeholder.com/80",
    novo: false
  }
];
// ===========================================
// FIM DOS DADOS DE TESTE
// ===========================================

function renderizarParceiros() {
  const container = document.getElementById("partners-list");
  container.innerHTML = "";

  parceirosFicticios.forEach(parceiro => {
    const card = document.createElement("div");
    card.className = "partner-card";

    card.innerHTML = `
      <div class="partner-logo">
        <img src="${parceiro.imagem}" alt="${parceiro.nome}">
      </div>
      <div class="partner-info">
        <div class="partner-name">${parceiro.nome}</div>
        ${parceiro.novo ? '<div class="new-tag">Novo</div>' : ''}
      </div>
    `;

    container.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderizarParceiros);





// Simulated user data
let userData = {
    isLoggedIn: true,
    name: '',
    email: '',
    points: 0,
    history: [],
    level: 'Bronze',
    notifications: []  // Add notifications array to store user notifications
};

// Current selected partner
let currentPartner = null;

// Connection to WebSim multiplayer system
const room = new WebsimSocket();

// Valid codes for testing
const validCodes = {
    'RESERVE123': 100,
    'CABO2023': 200,
    'REAL5000': 500
};

// Example notifications data
const exampleNotifications = [
    {
        id: 1,
        title: "Boas-vindas",
        message: "Bem-vindo ao programa de fidelidade do Hotel Real Cabo Frio!",
        date: "2023-06-15",
        read: false
    },
    {
        id: 2,
        title: "Oferta Especial",
        message: "Ganhe o dobro de pontos em sua próxima hospedagem!",
        date: "2023-06-20",
        read: false
    },
    {
        id: 3,
        title: "Novo Parceiro",
        message: "Restaurante Praia Azul é nosso novo parceiro. Troque seus pontos por refeições!",
        date: "2023-06-25",
        read: false
    }
];

// DOM Elements
let sections;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    sections = {
        login: document.getElementById('login-section'),
        register: document.getElementById('register-section'),
        dashboard: document.getElementById('dashboard-section'),
        manualPoints: document.getElementById('manual-points-section'),
        partners: document.getElementById('partners-section'),
    };

    // Add partner profile section
    const partnerProfileSection = document.createElement('section');
    partnerProfileSection.id = 'partner-profile-section';
    partnerProfileSection.innerHTML = `
        <div class="section-header">
            <button id="partner-profile-back" class="back-button">
                <i class="fas fa-arrow-left"></i>
            </button>
            <h2 class="section-title">Detalhes do Parceiro</h2>
            <div style="width: 24px;"></div>
        </div>
        
        <div class="partner-profile-header">
            <div class="partner-profile-name">
                <span id="partner-profile-name">Restaurante Praia Azul</span>
                <span class="partner-status-tag" id="partner-status">Troca de pontos</span>
            </div>
        </div>
        
        <img id="partner-featured-image" src="https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Imagem do parceiro" class="partner-featured-image">
        
        <div class="partner-nav">
            <div class="partner-nav-button active" id="partner-nav-offers">Ofertas</div>
            <div class="partner-nav-button" id="partner-nav-about">Sobre</div>
        </div>
        
        <div class="partner-points-display">
            <div class="partner-points-label">Seus pontos disponíveis:</div>
            <div class="partner-points-value" id="partner-points-value">0</div>
        </div>
        
        <div class="partner-offers active" id="partner-offers">
            <div class="partner-content">
                <h3 class="partner-section-title">Os Mais Resgatados</h3>
                <div class="partner-offers" id="partner-offers-list">
                    <!-- Offers will be populated dynamically -->
                </div>
            </div>
        </div>
        
        <div class="partner-about" id="partner-about">
            <p id="partner-description">
                O Restaurante Praia Azul oferece a melhor experiência gastronômica à beira-mar em Cabo Frio, com um cardápio especializado em frutos do mar frescos e pratos da culinária local.
            </p>
            
            <div class="partner-info-block">
                <h4>Informações</h4>
                <div class="partner-info-item">
                    <div class="partner-info-icon">
                        <i class="fas fa-map-marker-alt"></i>
                    </div>
                    <div class="partner-info-text" id="partner-address">
                        Av. do Mar, 1234, Praia do Forte, Cabo Frio
                    </div>
                </div>
                <div class="partner-info-item">
                    <div class="partner-info-icon">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="partner-info-text" id="partner-phone">
                        (22) 9876-5432
                    </div>
                </div>
                <div class="partner-info-item">
                    <div class="partner-info-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="partner-info-text" id="partner-hours">
                        Seg-Dom: 11h às 23h
                    </div>
                </div>
            </div>
            
            <div class="map-placeholder">
                <i class="fas fa-map-marked-alt" style="font-size: 2rem; color: #999;"></i>
            </div>
        </div>
    `;
    document.querySelector('main').appendChild(partnerProfileSection);

    // Update the sections object to include the partner profile section
    sections.partnerProfile = document.getElementById('partner-profile-section');

    // Add data-id attributes to partner cards
    document.querySelectorAll('.partner-card').forEach((card, index) => {
        const partnerIds = ['restaurant', 'quiosque', 'bar', 'shopping', 'translado', 'spa'];
        card.setAttribute('data-id', partnerIds[index] || 'restaurant');
    });

    initApp();
    setupEventListeners();
    setupWebsimConnection();
});

function setupWebsimConnection() {
    // Handle incoming messages
    room.onmessage = (event) => {
        const data = event.data;
        if (data.type === "connected") {
            console.log(`Client ${data.clientId}, ${data.username} connected`);
            // Auto login if connected to websim
            if (data.username && !userData.isLoggedIn) {
                userData = {
                    isLoggedIn: true,
                    name: data.username,
                    email: `${data.username}@example.com`,
                    points: 0,
                    history: [],
                    level: 'Bronze'
                };
                
                // Check if user data exists in persisted records
                checkExistingUserData(data.username);
                
                showSection('dashboard');
                updateDashboard();
            }
        }
    };
}

async function checkExistingUserData(username) {
    // Try to get existing user data from records
    const userRecords = await room.collection('hotelRealUsers').filter({ username: username }).getList();
    
    if (userRecords.length > 0) {
        // User exists, load their data
        const userRecord = userRecords[0];
        userData = {
            isLoggedIn: true,
            name: userRecord.username,
            email: userRecord.email || `${username}@example.com`,
            points: userRecord.points || 0,
            history: userRecord.history || [],
            level: userRecord.level || 'Bronze',
            notifications: userRecord.notifications || []
        };
        
        // Add example notifications if email matches and no notifications exist
        if (userRecord.email === "euapatroa14@gmail.com" && (!userRecord.notifications || userRecord.notifications.length === 0)) {
            userData.notifications = exampleNotifications;
            await saveUserData(); // Save immediately to update the notifications
        }
        
        updateDashboard();
        updateNotificationBadge();
    } else {
        // First time user, create a record
        await saveUserData();
    }
}

async function saveUserData() {
    
    
    try {
        // Get existing user records
        const userRecords = await room.collection('hotelRealUsers').filter({ username: userData.name }).getList();
        
        if (userRecords.length > 0) {
            // Update existing user
            await room.collection('hotelRealUsers').update(userRecords[0].id, {
                username: userData.name,
                email: userData.email,
                points: userData.points,
                history: userData.history,
                level: userData.level,
                notifications: userData.notifications
            });
        } else {
            // Create new user
            await room.collection('hotelRealUsers').create({
                username: userData.name,
                email: userData.email,
                points: userData.points,
                history: userData.history,
                level: userData.level,
                notifications: userData.notifications || []
            });
        }
    } catch (error) {
        console.error("Error saving user data:", error);
    }
}

function initApp() {
    // Check for WebSim connection instead of local storage
    if (room.party && room.party.client && room.party.client.username) {
        const username = room.party.client.username;
        // Will check for user data in the checkExistingUserData function
    } else {
        showSection('partners');
    }
}

function setupEventListeners() {
    // Authentication Event Listeners
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('show-register').addEventListener('click', () => showSection('register'));
    document.getElementById('show-login').addEventListener('click', () => showSection('login'));
    
    // Menu icon event listener
    document.getElementById('menu-icon').addEventListener('click', toggleMenu);
    document.getElementById('close-menu').addEventListener('click', toggleMenu);
    document.getElementById('menu-overlay').addEventListener('click', toggleMenu);
    
    // Notification icon event listener
    document.getElementById('notification-icon').addEventListener('click', showNotifications);
    
    // Side menu item listeners
    document.getElementById('menu-home').addEventListener('click', () => {
        toggleMenu();
        if (userData.isLoggedIn) {
            showSection('dashboard');
        } else {
            showSection('partners');
        }
    });
    
    document.getElementById('menu-logout').addEventListener('click', () => {
        toggleMenu();
        userData.isLoggedIn = false;
        showSection('partners');
        showModal('Você foi desconectado');
    });
    
    // Partners menu item
    document.getElementById('menu-partners').addEventListener('click', () => {
        toggleMenu();
        
        showSection('partners');
    });
    
    // Back button in partners section
    document.getElementById('partners-back').addEventListener('click', () => {
        showSection('dashboard');
    });
    
    // Generic function for menu items that show a modal
    const menuItems = ['vouchers', 'shopping', 'statement', 'profile', 'scan', 'contact', 'help'];
    menuItems.forEach(item => {
        document.getElementById(`menu-${item}`).addEventListener('click', () => {
            toggleMenu();
            if (!userData.isLoggedIn && item !== 'help') {
                showModal('Faça login para acessar esta funcionalidade');
                return;
            }
            showModal(`Funcionalidade "${document.getElementById(`menu-${item}`).querySelector('span').textContent}" em desenvolvimento`);
        });
    });
    
    // Dashboard Event Listeners
    document.getElementById('manual-points-btn').addEventListener('click', () => showSection('manualPoints'));
    document.getElementById('scan-code-btn').addEventListener('click', handleScanCode);
    document.getElementById('back-to-dashboard').addEventListener('click', () => showSection('dashboard'));
    document.getElementById('code-form').addEventListener('submit', handleCodeSubmission);
    
    // Modal close events
    document.querySelector('.close').addEventListener('click', hideModal);
    document.getElementById('modal-ok').addEventListener('click', hideModal);
    
    // Redeem buttons
    document.querySelectorAll('.btn-redeem').forEach(button => {
        button.addEventListener('click', handleRedeemClick);
    });

    // Partner card click event
    document.querySelectorAll('.partner-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const partnerId = e.currentTarget.dataset.id;
            showPartnerProfile(partnerId);
        });
    });

    // Partner profile back button
    document.getElementById('partner-profile-back').addEventListener('click', () => {
        showSection('partners');
    });

    // Partner profile navigation buttons
    document.getElementById('partner-nav-offers').addEventListener('click', () => {
        togglePartnerSection('offers');
    });

    document.getElementById('partner-nav-about').addEventListener('click', () => {
        togglePartnerSection('about');
    });

    // Offer redeem buttons
    document.querySelectorAll('.btn-offer-redeem').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const pointsNeeded = parseInt(e.target.dataset.points);
            const offerName = e.target.closest('.offer-item').querySelector('.offer-title').textContent;

            if (userData.points >= pointsNeeded) {
                addPoints(-pointsNeeded, `Resgate: ${offerName} em ${currentPartner.name}`);
                showModal(`Oferta resgatada com sucesso! Você utilizou ${pointsNeeded} pontos.`);
                updatePartnerPointsDisplay();
            } else {
                showModal(`Pontos insuficientes. Você precisa de ${pointsNeeded} pontos para esta oferta.`);
            }
        });
    });
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Simple validation
    if (!email || !password) {
        showModal('Por favor, preencha todos os campos');
        return;
    }
    
    // For demo purposes, any login is accepted
    userData = {
        isLoggedIn: true,
        name: email.split('@')[0], // Use part of email as name
        email: email,
        points: 0,
        history: [],
        level: 'Bronze',
        notifications: email === "euapatroa14@gmail.com" ? exampleNotifications : []
    };
    
    // Save to WebSim storage instead of localStorage
    saveUserData();
    
    showSection('dashboard');
    updateDashboard();
    updateNotificationBadge();
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const phone = document.getElementById('reg-phone').value;
    const password = document.getElementById('reg-password').value;
    
    // Simple validation
    if (!name || !email || !phone || !password) {
        showModal('Por favor, preencha todos os campos');
        return;
    }
    
    // Create new user
    userData = {
        isLoggedIn: true,
        name: name,
        email: email,
        phone: phone,
        points: 100, // Welcome bonus
        history: [{
            date: new Date().toLocaleDateString(),
            description: 'Bônus de boas-vindas',
            points: 100,
            type: 'credit'
        }],
        level: 'Bronze',
        notifications: []
    };
    
    // Save to WebSim storage instead of localStorage
    saveUserData();
    
    showModal('Cadastro realizado com sucesso! Você ganhou 100 pontos de boas-vindas.');
    showSection('dashboard');
    updateDashboard();
    updateNotificationBadge();
}

function handleScanCode() {
    showModal('Funcionalidade de escaneamento em desenvolvimento');
}

function handleCodeSubmission(e) {
    e.preventDefault();
    const code = document.getElementById('reservation-code').value.trim().toUpperCase();
    
    if (!code) {
        showModal('Por favor, insira um código');
        return;
    }
    
    if (validCodes[code]) {
        addPoints(validCodes[code], `Reserva: ${code}`);
        document.getElementById('reservation-code').value = '';
        showModal(`Código validado com sucesso! Você ganhou ${validCodes[code]} pontos.`);
        showSection('dashboard');
    } else {
        showModal('Código inválido ou já utilizado');
    }
}

function handleRedeemClick(e) {
    const pointsNeeded = parseInt(e.target.dataset.points);
    const benefitName = e.target.previousElementSibling.querySelector('h4').textContent;

    if (userData.points >= pointsNeeded) {
        addPoints(-pointsNeeded, `Resgate: ${benefitName}`);
        showModal(`Benefício resgatado com sucesso! Você utilizou ${pointsNeeded} pontos.`);
    } else {
        showModal(`Pontos insuficientes. Você precisa de ${pointsNeeded} pontos para este benefício.`);
    }
}

function addPoints(amount, description) {
    userData.points += amount;
    userData.history.unshift({
        date: new Date().toLocaleDateString(),
        description: description,
        points: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit'
    });
    
    // Update user level
    if (userData.points >= 2000) {
        userData.level = 'Ouro';
    } else if (userData.points >= 1000) {
        userData.level = 'Prata';
    } else {
        userData.level = 'Bronze';
    }
    
    // Save to WebSim storage instead of localStorage
    saveUserData();
    
    // Update UI
    updateDashboard();
}

function showSection(sectionId) {
    // Make sure sections is defined
    if (!sections) return;
    
    Object.keys(sections).forEach(key => {
        sections[key].classList.remove('active-section');
    });

    if (sectionId === 'partnerProfile') {
        document.getElementById('partner-profile-section').classList.add('active-section');
    } else {
        sections[sectionId].classList.add('active-section');
    }
}

function toggleMenu() {
    document.getElementById('side-menu').classList.toggle('active');
    document.getElementById('menu-overlay').classList.toggle('active');
    
    // Update user info in menu
    if (userData.isLoggedIn) {
        document.getElementById('menu-user-name').textContent = userData.name;
        document.getElementById('menu-user-level').textContent = `Nível: ${userData.level}`;
    }
}

function showModal(message) {
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal').style.display = 'flex';
}

function hideModal() {
    document.getElementById('modal').style.display = 'none';
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    if (!userData.isLoggedIn || !userData.notifications || userData.notifications.length === 0) {
        badge.style.display = 'none';
    } else {
        const unreadCount = userData.notifications.filter(notif => !notif.read).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function showNotifications() {
    if (!userData.isLoggedIn) {
        showModal('Faça login para ver suas notificações');
        return;
    }
    
    if (!userData.notifications || userData.notifications.length === 0) {
        showModal('Você não possui notificações');
        return;
    }
    
    // Create HTML for notifications
    let notificationHTML = '<div class="notifications-list">';
    
    userData.notifications.forEach(notification => {
        notificationHTML += `
            <div class="notification-item ${notification.read ? 'read' : 'unread'}" data-id="${notification.id}">
                <div class="notification-header">
                    <h4>${notification.title}</h4>
                    <span class="notification-date">${notification.date}</span>
                </div>
                <p>${notification.message}</p>
            </div>
        `;
    });
    
    notificationHTML += '</div>';
    
    // Show notifications in modal
    document.getElementById('modal-message').innerHTML = notificationHTML;
    document.getElementById('modal').style.display = 'flex';
    
    // Mark all as read when viewed
    userData.notifications.forEach(notification => {
        notification.read = true;
    });
    
    // Update notification badge
    updateNotificationBadge();
    
    // Save updated notifications status
    saveUserData();
    
    // Add click listeners to notification items
    document.querySelectorAll('.notification-item').forEach(item => {
        item.addEventListener('click', function() {
            // Add specific handling for notification clicks if needed
            hideModal();
        });
    });
}

function showPartnerProfile(partnerId) {
    // Get partner data (in a real app, this would come from a database)
    const partners = {
        'restaurant': {
            id: 'restaurant',
            name: 'Restaurante Praia Azul',
            status: 'Troca de pontos',
            image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O Restaurante Praia Azul oferece a melhor experiência gastronômica à beira-mar em Cabo Frio, com um cardápio especializado em frutos do mar frescos e pratos da culinária local.',
            address: 'Av. do Mar, 1234, Praia do Forte, Cabo Frio',
            phone: '(22) 9876-5432',
            hours: 'Seg-Dom: 11h às 23h',
            offers: [
                {
                    title: 'Entrada para 2 pessoas',
                    description: 'Escolha uma entrada do cardápio para compartilhar',
                    image: 'https://images.unsplash.com/photo-1534859108275-a3a6f52f821c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 500
                },
                {
                    title: 'Sobremesa Especial',
                    description: 'Pudim de leite condensado com calda de caramelo',
                    image: 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 300
                },
                {
                    title: 'Almoço Completo',
                    description: 'Prato principal + bebida + sobremesa',
                    image: 'https://images.unsplash.com/photo-1414235077428-685c5582fd35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 1200
                }
            ]
        },
        'quiosque': {
            id: 'quiosque',
            name: 'Quiosque Pé na Areia',
            status: 'Troca e pagamento',
            image: 'https://images.unsplash.com/photo-1520454974749-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O Quiosque Pé na Areia é o lugar perfeito para relaxar com os pés na areia enquanto desfruta de bebidas refrescantes e petiscos deliciosos com vista para o mar.',
            address: 'Praia do Forte, Quiosque 22, Cabo Frio',
            phone: '(22) 9432-8765',
            hours: 'Seg-Dom: 9h às 20h',
            offers: [
                {
                    title: 'Caipirinha Especial',
                    description: 'Caipirinha de frutas da estação',
                    image: 'https://images.unsplash.com/photo-1569578378375-c47905a5a58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 200
                },
                {
                    title: 'Porção de Petiscos',
                    description: 'Porção mista de petiscos para compartilhar',
                    image: 'https://images.unsplash.com/photo-1626082929543-5bab0f090c03?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 400
                },
                {
                    title: 'Day Use de Cadeiras',
                    description: '2 cadeiras + guarda-sol por um dia',
                    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 300
                }
            ]
        },
        'spa': {
            id: 'spa',
            name: 'Spa Oceano',
            status: 'Somente troca',
            image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O Spa Oceano oferece momentos de relaxamento e bem-estar completo, com tratamentos exclusivos inspirados nos elementos marinhos e aromaterapia.',
            address: 'Rua das Conchas, 456, Centro, Cabo Frio',
            phone: '(22) 3456-7890',
            hours: 'Ter-Dom: 10h às 19h',
            offers: [
                {
                    title: 'Massagem Relaxante',
                    description: 'Massagem corporal relaxante de 30 minutos',
                    image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 800
                },
                {
                    title: 'Hidratação Facial',
                    description: 'Tratamento facial com produtos marinhos',
                    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 600
                },
                {
                    title: 'Day Spa Completo',
                    description: 'Pacote completo de tratamentos por 2 horas',
                    image: 'https://images.unsplash.com/photo-1540555700478-d67d6ac08a4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 1500
                }
            ]
        },
        'bar': {
            id: 'bar',
            name: 'Bar do Mar',
            status: 'Troca e pagamento',
            image: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O Bar do Mar é o point perfeito para happy hour com vista para o mar, oferecendo os melhores drinks e petiscos da região em um ambiente descontraído e aconchegante.',
            address: 'Av. Litorânea, 789, Praia do Forte, Cabo Frio',
            phone: '(22) 9833-4567',
            hours: 'Seg-Qui: 16h às 00h, Sex-Dom: 16h às 02h',
            offers: [
                {
                    title: 'Drink Especial',
                    description: 'Qualquer drink da carta de especiais',
                    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 350
                },
                {
                    title: 'Tábua de Petiscos',
                    description: 'Tábua mista de petiscos para 2 pessoas',
                    image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 600
                },
                {
                    title: 'Happy Hour Completo',
                    description: '2 drinks + 1 petisco à escolha',
                    image: 'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 850
                }
            ]
        },
        'shopping': {
            id: 'shopping',
            name: 'Shopping Cabo Mall',
            status: 'Troca de pontos',
            image: 'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O Shopping Cabo Mall oferece a melhor experiência de compras em Cabo Frio, com as melhores lojas e opções de entretenimento para toda a família.',
            address: 'Rua do Comércio, 2000, Centro, Cabo Frio',
            phone: '(22) 3333-4444',
            hours: 'Seg-Sáb: 10h às 22h, Dom: 14h às 20h',
            offers: [
                {
                    title: 'Vale Compras R$50',
                    description: 'Vale compras para usar em qualquer loja do shopping',
                    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 800
                },
                {
                    title: 'Sessão de Cinema',
                    description: 'Ingresso para qualquer sessão do Cinemax',
                    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 500
                },
                {
                    title: 'Refeição na Praça',
                    description: 'Combo refeição em qualquer restaurante da praça de alimentação',
                    image: 'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 700
                }
            ]
        },
        'translado': {
            id: 'translado',
            name: 'Translado Executivo',
            status: 'Troca e pagamento',
            image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
            description: 'O serviço de Translado Executivo oferece conforto e praticidade para suas locomoções em Cabo Frio e região, com motoristas profissionais e veículos bem equipados.',
            address: 'Av. Central, 1010, Centro, Cabo Frio',
            phone: '(22) 99888-7777',
            hours: 'Todos os dias: 24 horas',
            offers: [
                {
                    title: 'Transfer Aeroporto',
                    description: 'Translado aeroporto-hotel ou hotel-aeroporto',
                    image: 'https://images.unsplash.com/photo-1610642434780-d67d6ac08a4b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 1000
                },
                {
                    title: 'City Tour',
                    description: 'Tour de 3 horas pelos principais pontos turísticos',
                    image: 'https://images.unsplash.com/photo-1569859880158-e8e6a078056b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 1800
                },
                {
                    title: 'Táxi Executivo',
                    description: 'Corrida de táxi executivo dentro da cidade',
                    image: 'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
                    points: 600
                }
            ]
        }
    };
    
    currentPartner = partners[partnerId] || partners['restaurant'];
    
    // Update partner profile content
    document.getElementById('partner-profile-name').textContent = currentPartner.name;
    document.getElementById('partner-status').textContent = currentPartner.status;
    document.getElementById('partner-featured-image').src = currentPartner.image;
    document.getElementById('partner-description').textContent = currentPartner.description;
    document.getElementById('partner-address').textContent = currentPartner.address;
    document.getElementById('partner-phone').textContent = currentPartner.phone;
    document.getElementById('partner-hours').textContent = currentPartner.hours;
    
    // Show offers
    const offersContainer = document.getElementById('partner-offers-list');
    offersContainer.innerHTML = '';
    
    currentPartner.offers.forEach(offer => {
        const offerElement = document.createElement('div');
        offerElement.className = 'offer-item';
        offerElement.innerHTML = `
            <img src="${offer.image}" alt="${offer.title}" class="offer-image">
            <div class="offer-details">
                <div>
                    <div class="offer-title">${offer.title}</div>
                    <div class="offer-description">${offer.description}</div>
                </div>
                <div class="offer-points">
                    <span>${offer.points} pontos</span>
                    <button class="btn-offer-redeem" data-points="${offer.points}">Resgatar</button>
                </div>
            </div>
        `;
        offersContainer.appendChild(offerElement);
    });
    
    // Reset offers/about tabs
    togglePartnerSection('offers');
    
    // Update points display
    updatePartnerPointsDisplay();
    
    // Show partner profile section
    showSection('partnerProfile');
    
    // Add event listeners to new offer buttons
    document.querySelectorAll('.btn-offer-redeem').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const pointsNeeded = parseInt(e.target.dataset.points);
            const offerName = e.target.closest('.offer-item').querySelector('.offer-title').textContent;
            
            if (userData.points >= pointsNeeded) {
                addPoints(-pointsNeeded, `Resgate: ${offerName} em ${currentPartner.name}`);
                showModal(`Oferta resgatada com sucesso! Você utilizou ${pointsNeeded} pontos.`);
                updatePartnerPointsDisplay();
            } else {
                showModal(`Pontos insuficientes. Você precisa de ${pointsNeeded} pontos para esta oferta.`);
            }
        });
    });
}

function togglePartnerSection(section) {
    // Update nav buttons
    document.getElementById('partner-nav-offers').classList.toggle('active', section === 'offers');
    document.getElementById('partner-nav-about').classList.toggle('active', section === 'about');
    
    // Show appropriate content
    document.getElementById('partner-offers').classList.toggle('active', section === 'offers');
    document.getElementById('partner-about').classList.toggle('active', section === 'about');
}

function updatePartnerPointsDisplay() {
    document.getElementById('partner-points-value').textContent = userData.points;
}

function updateDashboard() {
    
    
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-level').textContent = `Nível: ${userData.level}`;
    document.getElementById('points-count').textContent = userData.points;
    
    // Also update user info in side menu
    document.getElementById('menu-user-name').textContent = userData.name;
    document.getElementById('menu-user-level').textContent = `Nível: ${userData.level}`;
    
    // Update history
    const historyContainer = document.getElementById('points-history');
    historyContainer.innerHTML = '';
    
    if (userData.history.length === 0) {
        historyContainer.innerHTML = '<p class="empty-state">Nenhuma atividade recente</p>';
    } else {
        userData.history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.innerHTML = `
                <div>
                    <div>${item.description}</div>
                    <div class="date">${item.date}</div>
                </div>
                <div class="points ${item.type === 'credit' ? 'points-positive' : 'points-negative'}">
                    ${item.type === 'credit' ? '+' : '-'}${item.points}
                </div>
            `;
            historyContainer.appendChild(historyItem);
        });
    }
    
    // Update redeem buttons status
    document.querySelectorAll('.btn-redeem').forEach(button => {
        const pointsNeeded = parseInt(button.dataset.points);
        button.disabled = userData.points < pointsNeeded;
        button.style.opacity = userData.points < pointsNeeded ? '0.5' : '1';
    });
    
    // Also update notification badge
    updateNotificationBadge();
}













