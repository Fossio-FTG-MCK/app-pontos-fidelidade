// DOM References for partner profile
const partnerProfileSection = document.getElementById('partner-profile-section');
const partnerBackButton = document.getElementById('partner-back');
const partnerProfileContent = document.getElementById('partner-profile-content');

// Initialize partner profile related event listeners
function initPartnerProfileEvents() {
    // Back button event listener
    if (partnerBackButton) {
        partnerBackButton.addEventListener('click', () => {
            showSection('vouchers');
        });
    }
    
    // Setup partner icon click events in vouchers screen
    setupPartnerIconEvents();
}

// Setup click events for partner icons in the vouchers screen
function setupPartnerIconEvents() {
    const partnerIcons = document.querySelectorAll('.partner-icon');
    
    partnerIcons.forEach((icon, index) => {
        icon.addEventListener('click', () => {
            const partnerId = index + 1; // Simple way to match index to ID
            showPartnerProfile(partnerId);
        });
    });
}

// Show partner profile based on ID
function showPartnerProfile(partnerId) {
    const partner = getPartnerById(partnerId);
    
    if (!partner) {
return;
    }
    
    // Generate partner profile HTML
    partnerProfileContent.innerHTML = generatePartnerProfileHTML(partner);
    
    // Show partner profile section
    showSection('partner-profile');
    
    // Setup social icon event listeners
    setupSocialLinks();
}

// Generate HTML for partner profile
function generatePartnerProfileHTML(partner) {
    // Create HTML for social icons
    let socialIconsHTML = '';
    
    if (partner.social) {
        if (partner.social.instagram) {
            socialIconsHTML += `<a href="https://instagram.com/${partner.social.instagram}" class="social-icon"><i class="fab fa-instagram"></i></a>`;
        }
        if (partner.social.facebook) {
            socialIconsHTML += `<a href="https://facebook.com/${partner.social.facebook}" class="social-icon"><i class="fab fa-facebook"></i></a>`;
        }
        if (partner.social.twitter) {
            socialIconsHTML += `<a href="https://twitter.com/${partner.social.twitter}" class="social-icon"><i class="fab fa-twitter"></i></a>`;
        }
    }
    
    return `
        <div class="partner-header">
            <div class="partner-logo">
                <img src="${partner.logo}" alt="${partner.name}">
            </div>
            <div class="partner-title">
                <h3>${partner.name}</h3>
                ${partner.isNew ? '<span class="new-tag">Novo parceiro</span>' : ''}
            </div>
        </div>
        
        <div class="partner-banner">
            <img src="${partner.banner}" alt="${partner.name}">
        </div>
        
        <div class="partner-details">
            <div class="partner-description">
                <p>${partner.description}</p>
            </div>
            
            <div class="partner-contact-info">
                <div class="contact-item">
                    <i class="fas fa-phone"></i>
                    <span>${partner.phone}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-envelope"></i>
                    <span>${partner.email}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${partner.address}</span>
                </div>
                <div class="contact-item">
                    <i class="fas fa-globe"></i>
                    <span>${partner.website}</span>
                </div>
            </div>
            
            <div class="partner-social">
                ${socialIconsHTML}
            </div>
        </div>
    `;
}

// Setup social media link event handlers
function setupSocialLinks() {
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.preventDefault();
});
    });
}

// Get partner by ID - use the actual partnersData from partners.js
function getPartnerById(partnerId) {
    return partnersData.find(partner => partner.id === partnerId);
}

// Use the app.js showSection function
function showSection(sectionId) {
    const sections = {
        'dashboard': document.getElementById('dashboard-section'),
        'login': document.getElementById('login-section'),
        'register': document.getElementById('register-section'),
        'partners': document.getElementById('partners-section'),
        'vouchers': document.getElementById('vouchers-section'),
        'partner-profile': document.getElementById('partner-profile-section'),
        'manualPoints': document.getElementById('manual-points-section')
    };
    
    Object.keys(sections).forEach(key => {
        if (sections[key]) {
            sections[key].classList.remove('active-section');
        }
    });
    
    if (sections[sectionId]) {
        sections[sectionId].classList.add('active-section');
    }
}

// Show modal (this function is not defined in the plan, so it's assumed to be defined elsewhere)
function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    modalMessage.textContent = message;
    modal.style.display = 'block';
}