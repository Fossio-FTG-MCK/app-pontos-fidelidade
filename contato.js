// Elementos das seções
const sections = {
    contact: document.getElementById('contact-section'),
    help: document.getElementById('help-section')
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

// Função para exibir uma seção específica
function showSection(sectionId) {
    Object.keys(sections).forEach(key => {
        sections[key].classList.remove('active-section');
    });
    sections[sectionId].classList.add('active-section');
}

// Inicializa o app direto na seção de contatos
function initApp() {
    showSection('contact');
}

// Configura eventos de clique
function setupEventListeners() {
    // Botão voltar da tela de contato
    const contactBack = document.getElementById('contact-back');
    if (contactBack) {
        contactBack.addEventListener('click', () => showSection('contact'));
    }

    // Botão voltar da tela de ajuda
    const helpBack = document.getElementById('help-back');
    if (helpBack) {
        helpBack.addEventListener('click', () => showSection('contact'));
    }

    // FAQ toggle
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            faqQuestions.forEach(q => {
                if (q !== question) {
                    q.classList.remove('active');
                    q.parentElement.classList.remove('active');
                }
            });

            question.classList.toggle('active');
            question.parentElement.classList.toggle('active');
        });
    });
}
