// Simulated user data
let userData = {
    isLoggedIn: false,
    name: '',
    email: '',
    points: 0,
    history: [],
    level: 'Bronze',
    notifications: []  // Add notifications array to store user notifications
};

// Simulated clients list for admin
const hotelClients = [
    { id: 1, name: "Maria Silva", email: "maria@example.com" },
    { id: 2, name: "João Santos", email: "joao@example.com" },
    { id: 3, name: "Ana Oliveira", email: "ana@example.com" },
    { id: 4, name: "Carlos Souza", email: "carlos@example.com" },
    { id: 5, name: "Patrícia Lima", email: "patricia@example.com" }
];

// Connection to WebSim multiplayer system
// const room = new WebsimSocket(); // Simulação local
const room = {
    onmessage: null,
    party: {
        client: {
            username: "euapatroa14"
        }
    },
    collection: () => ({
        filter: () => ({
            getList: async () => [
                {
                    id: "user-001",
                    username: "euapatroa14",
                    email: "euapatroa14@gmail.com",
                    points: 1200,
                    level: "Ouro",
                    history: [
                        { date: "2023-03-01", description: "Reserva inicial", points: 1000, type: "credit" },
                        { date: "2023-03-10", description: "Resgate: Upgrade de quarto", points: 1000, type: "debit" },
                        { date: "2023-04-01", description: "Reserva adicional", points: 1200, type: "credit" }
                    ],
                    notifications: [
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
                        }
                    ]
                }
            ]
        }),
        update: async () => {},
        create: async () => {}
    })
};


// Valid codes for testing
const validCodes = {
    'RESERVE123': 100,
    'CABO2023': 200,
    'REAL5000': 500
};

// QR scanner variables
let videoElement;
let scannerActive = false;
let scannerStream = null;

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

// Simulated reservation data
const simulatedReservations = [
    {
        id: 'RES-20230615',
        checkIn: '15/06/2023',
        checkOut: '18/06/2023',
        roomType: 'Suíte Master com Vista para o Mar',
        status: 'completed',
        statusText: 'Concluída',
        time: '14:00'
    },
    {
        id: 'RES-20231020',
        checkIn: '20/10/2023',
        checkOut: '25/10/2023',
        roomType: 'Quarto Luxo Duplo',
        status: 'completed',
        statusText: 'Concluída',
        time: '15:30'
    },
    {
        id: 'RES-20240105',
        checkIn: '05/01/2024',
        checkOut: '10/01/2024',
        roomType: 'Suíte Família',
        status: 'upcoming',
        statusText: 'Agendada',
        time: '12:00'
    }
];

// DOM Elements
const sections = {
    login: document.getElementById('login-section'),
    register: document.getElementById('register-section'),
    dashboard: document.getElementById('dashboard-section'),
    manualPoints: document.getElementById('manual-points-section'),
    partners: document.getElementById('partners-section'),
    addReservation: document.getElementById('add-reservation-section')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    // Login automático simulado
    checkExistingUserData("euapatroa14").then(() => {
        userData.isLoggedIn = true;
        showSection('dashboard');
        updateDashboard();
        updateNotificationBadge();
        initializeFeatures();
    });

    initApp();
    setupEventListeners();
    setupWebsimConnection();
    initializeFeatures(); // Initialize features content
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
    if (!userData.isLoggedIn) return;
    
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
        showSection('login');
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
            showSection('login');
        }
    });
    
    document.getElementById('menu-logout').addEventListener('click', () => {
        toggleMenu();
        userData.isLoggedIn = false;
        showSection('login');
        showModal('Você foi desconectado');
    });
    
    // Partners menu item
    document.getElementById('menu-partners').addEventListener('click', () => {
        toggleMenu();
        if (!userData.isLoggedIn) {
            showModal('Faça login para acessar estate funcionalidade');
            return;
        }
        showSection('partners');
    });
    
    // Back button in partners section
    document.getElementById('partners-back').addEventListener('click', () => {
        showSection('dashboard');
    });
    
    // Generic function for menu items that show a modal
    const menuItems = ['vouchers', 'shopping', 'statement', 'profile', 'scan', 'contact', 'help'];
    menuItems.forEach(item => {
    const el = document.getElementById(`menu-${item}`);
        if (el && el.getAttribute('href') === '#') {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                toggleMenu();
                if (!userData.isLoggedIn && item !== 'help') {
                    showModal('Faça login para acessar esta funcionalidade');
                    return;
                }
                showModal(`Funcionalidade "${el.querySelector('span').textContent}" em desenvolvimento`);
            });
        }
    });

    
    // Dashboard Event Listeners
    document.getElementById('manual-points-btn').addEventListener('click', () => showSection('manualPoints'));
    document.getElementById('scan-code-btn').addEventListener('click', openQRScanner);
    document.getElementById('add-reservation-btn').addEventListener('click', () => {
        showSection('addReservation');
        populateClientsDropdown();
    });
    document.getElementById('back-to-dashboard').addEventListener('click', () => showSection('dashboard'));
    document.getElementById('back-from-reservation').addEventListener('click', () => showSection('dashboard'));
    document.getElementById('code-form').addEventListener('submit', handleCodeSubmission);
    document.getElementById('reservation-form').addEventListener('submit', handleReservationSubmission);
    
    // Modal close events
    document.querySelector('.close').addEventListener('click', hideModal);
    document.getElementById('modal-ok').addEventListener('click', hideModal);
    
    // Redeem buttons
    document.querySelectorAll('.btn-redeem').forEach(button => {
        button.addEventListener('click', handleRedeemClick);
    });
    
    document.querySelector('.close-scanner').addEventListener('click', closeQRScanner);
    document.getElementById('cancel-scan').addEventListener('click', closeQRScanner);
    
    // Tab Navigation
    document.getElementById('tab-features').addEventListener('click', () => switchTab('features'));
    document.getElementById('tab-reservations').addEventListener('click', () => switchTab('reservations'));
    document.getElementById('tab-benefits').addEventListener('click', () => switchTab('benefits'));
    
    // Hotel site link
    document.getElementById('hotel-site-link').addEventListener('click', () => {
        window.open('https://www.hotelrealcabofrio.com.br', '_blank');
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
    openQRScanner();
}

function handleCodeSubmission(e) {
    e.preventDefault();
    const code = document.getElementById('reservation-code').value.trim().toUpperCase();
    
    if (!code) {
        showModal('Por favor, insira um código');
        return;
    }
    
    // Check if the code is in the validCodes list or if it contains "44"
    if (validCodes[code] || code.includes('44')) {
        // If it's a predefined code, use its value, otherwise assign 100 points for codes with "44"
        const pointsToAdd = validCodes[code] || 100;
        addPoints(pointsToAdd, `Reserva: ${code}`);
        document.getElementById('reservation-code').value = '';
        showModal(`Código validado com sucesso! Você ganhou ${pointsToAdd} pontos.`);
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
    if (!sections) return; // Add null check for sections object
    
    Object.keys(sections).forEach(key => {
        if (sections[key]) { // Add null check for each section
            sections[key].classList.remove('active-section');
        }
    });
    
    if (sections[sectionId]) { // Add null check before accessing the section
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

function openQRScanner() {
    if (!userData.isLoggedIn) {
        showModal('Faça login para escanear códigos');
        return;
    }
    
    // Show scanner modal
    document.getElementById('scanner-modal').style.display = 'flex';
    
    // Setup video element
    videoElement = document.getElementById('scanner-video');
    
    // Check if browser supports getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        // Start camera
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(function(stream) {
                scannerStream = stream;
                videoElement.srcObject = stream;
                // Remove automatic play and add event listener instead
                videoElement.addEventListener('canplay', function() {
                    if (videoElement.paused) {
                        videoElement.play().catch(function(error) {
                            console.log("Play prevented by browser:", error);
                            // Still proceed with scanner functionality even if autoplay is blocked
                            scannerActive = true;
                            scanQRCode();
                        });
                    }
                    scannerActive = true;
                    scanQRCode();
                });
            })
            .catch(function(error) {
                console.error("Cannot access camera: ", error);
                showModal('Não foi possível acessar a câmera do dispositivo. Verifique as permissões.');
                closeQRScanner();
            });
    } else {
        showModal('Seu navegador não suporta acesso à câmera');
        closeQRScanner();
    }
}

function closeQRScanner() {
    document.getElementById('scanner-modal').style.display = 'none';
    scannerActive = false;
    
    // Stop the camera stream
    if (scannerStream) {
        scannerStream.getTracks().forEach(track => {
            track.stop();
        });
        scannerStream = null;
    }
}

function scanQRCode() {
    // This is a simplified simulation of QR scanning
    // In a real app, you would use a library like jsQR or QuaggaJS
    
    if (!scannerActive) return;
    
    // For demo purposes, we'll simulate finding a QR code after 3 seconds
    setTimeout(() => {
        if (scannerActive) {
            // Generate a random code that contains "44" to ensure it's valid
            const randomDigits = Math.floor(Math.random() * 900) + 100;
            const simulatedCode = `QR44${randomDigits}`;
            
            // Process the scanned code
            processScannedCode(simulatedCode);
        }
    }, 3000);
}

function processScannedCode(code) {
    closeQRScanner();
    
    if (code) {
        // Check if the code is valid
        if (validCodes[code] || code.includes('44')) {
            // If it's a predefined code, use its value, otherwise assign 100 points for codes with "44"
            const pointsToAdd = validCodes[code] || 100;
            addPoints(pointsToAdd, `QR Code: ${code}`);
            showModal(`Código QR validado com sucesso! Você ganhou ${pointsToAdd} pontos.`);
        } else {
            showModal('Código QR inválido ou já utilizado');
        }
    } else {
        showModal('Não foi possível ler o código QR');
    }
}

function switchTab(tabId) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    document.getElementById(`tab-${tabId}`).classList.add('active');
    document.getElementById(`content-${tabId}`).classList.add('active');
}

function handleReservationSubmission(e) {
    e.preventDefault();
    const checkIn = document.getElementById('reservation-checkin').value;
    const checkOut = document.getElementById('reservation-checkout').value;
    const roomType = document.getElementById('reservation-room').value;
    const reservationTime = document.getElementById('reservation-time').value;
    const clientId = document.getElementById('reservation-client').value;
    
    if (!checkIn || !checkOut || !roomType || !reservationTime || !clientId) {
        showModal('Por favor, preencha todos os campos');
        return;
    }
    
    // Find selected client
    const selectedClient = hotelClients.find(client => client.id == clientId);
    if (!selectedClient) {
        showModal('Cliente inválido');
        return;
    }
    
    // Generate a reservation ID
    const reservationId = 'RES-' + new Date().getTime().toString().slice(-8);
    
    // Add to simulated reservations
    simulatedReservations.unshift({
        id: reservationId,
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut),
        roomType: roomType,
        status: 'upcoming',
        statusText: 'Agendada',
        time: reservationTime,
        clientName: selectedClient.name
    });
    
    // Add points for new reservation to the client
    addPoints(200, `Nova Reserva: ${reservationId}`);
    
    // Reset form
    document.getElementById('reservation-form').reset();
    
    showModal(`Reserva adicionada com sucesso para ${selectedClient.name}! 200 pontos adicionados.`);
    showSection('dashboard');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function updateDashboard() {
    if (!userData.isLoggedIn) return;
    
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
        button.style.cursor = userData.points < pointsNeeded ? 'not-allowed' : 'pointer';
    });
    
    // Initialize tabs (switch to features tab by default)
    switchTab('features');
    
    // Populate reservations list
    const reservationsContainer = document.getElementById('reservations-list');
    reservationsContainer.innerHTML = '';
    
    if (simulatedReservations.length === 0) {
        reservationsContainer.innerHTML = '<p class="empty-state">Nenhuma reserva encontrada</p>';
    } else {
        // Reverse the array to show the latest reservation first
        [...simulatedReservations].reverse().forEach(reservation => {
            const reservationItem = document.createElement('div');
            reservationItem.className = 'reservation-item';
            
            // Add WhatsApp button for upcoming reservations
            const whatsappButton = reservation.status === 'upcoming' ? 
                `<a href="https://wa.me/5522999999999" target="_blank" class="whatsapp-link">
                    <i class="fab fa-whatsapp"></i>
                </a>` : '';
            
            reservationItem.innerHTML = `
                <div class="reservation-dates">
                    <span>Check-in: ${reservation.checkIn} (${reservation.time})</span>
                    <span>Check-out: ${reservation.checkOut}</span>
                </div>
                <div class="reservation-room">${reservation.roomType}</div>
                <div class="reservation-footer">
                    <div>Reserva #${reservation.id}</div>
                    <span class="reservation-status status-${reservation.status}">${reservation.statusText}</span>
                    ${whatsappButton}
                </div>
            `;
            reservationsContainer.appendChild(reservationItem);
        });
    }
    
    // Also update notification badge
    updateNotificationBadge();
}

function populateClientsDropdown() {
    const dropdown = document.getElementById('reservation-client');
    dropdown.innerHTML = '<option value="">Selecione um cliente</option>';
    
    hotelClients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = `${client.name} (${client.email})`;
        dropdown.appendChild(option);
    });
}

// Features tab functionality
function initializeFeatures() {
    // Setup tab functionality
    document.getElementById('tab-features').addEventListener('click', () => switchTab('features'));
    populateFeaturesContent();
}

function populateFeaturesContent() {
    const featuresContainer = document.getElementById('content-features');
    if (!featuresContainer) return;
    
    featuresContainer.innerHTML = `
        <div class="features-list">
            <div class="feature-item">
                <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Café da manhã especial">
                <div class="feature-info">
                    <h4>Café da manhã especial</h4>
                    <p>Nosso café da manhã especial inclui pratos regionais e vista para o mar.</p>
                </div>
            </div>
            <div class="feature-item">
                <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Piscina exclusiva">
                <div class="feature-info">
                    <h4>Piscina exclusiva</h4>
                    <p>Nossa piscina exclusiva está disponível para hóspedes VIP.</p>
                </div>
            </div>
            <div class="feature-item">
                <img src="https://images.unsplash.com/photo-1445019980597-93fa8acb246c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" alt="Passeio de barco">
                <div class="feature-info">
                    <h4>Passeio de barco</h4>
                    <p>Desfrute de um passeio de barco pelas praias de Cabo Frio.</p>
                </div>
            </div>
        </div>
    `;
}
