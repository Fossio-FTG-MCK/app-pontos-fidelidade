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