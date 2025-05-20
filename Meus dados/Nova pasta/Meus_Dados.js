
// ===========================================
// DADOS FICTÍCIOS PARA TESTES - REMOVER DEPOIS
// ===========================================
const userProfile = {
  nome: "Carlos Silva",
  cpf: "123.456.789-00",
  nascimento: "10/02/1985",
  ocupacao: "Engenheiro",
  telefone: "(22) 99999-8888",
  email: "carlos.silva@email.com",
  endereco: "Rua das Flores, 123 - Cabo Frio - RJ",
  pontos: 1500,
  cartoes: [
    "DSAD12345678",
    "FGHI98765432"
  ]
};
// ===========================================
// FIM DOS DADOS DE TESTE
// ===========================================

function preencherPerfil() {
  // Dados do usuário
  document.getElementById("profile-name-value").textContent = userProfile.nome;
  document.getElementById("profile-cpf-value").textContent = userProfile.cpf;
  document.getElementById("profile-birth-value").textContent = userProfile.nascimento;
  document.getElementById("profile-occupation-value").textContent = userProfile.ocupacao;
  document.getElementById("profile-phone-value").textContent = userProfile.telefone;
  document.getElementById("profile-email-value").textContent = userProfile.email;
  document.getElementById("profile-address-value").textContent = userProfile.endereco;

  document.getElementById("profile-greeting").textContent = `Olá, ${userProfile.nome}!`;
  document.getElementById("profile-points").textContent = `Saldo: ${userProfile.pontos} pontos`;

  // QR Code fictício
  const qrContainer = document.getElementById("profile-qr-code");
  const qrImg = document.createElement("img");
  qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(userProfile.email);
  qrImg.alt = "QR Code do Cliente";
  qrImg.style.width = "120px";
  qrImg.style.height = "120px";
  qrContainer.appendChild(qrImg);

  // Renderizar cartões existentes
  renderizarCartoes();
}

function renderizarCartoes() {
  const cardSection = document.querySelector(".cards-section");

  // Remover cartões anteriores (exceto o botão)
  cardSection.querySelectorAll(".abastecimento-card").forEach(el => el.remove());

  userProfile.cartoes.forEach(codigo => {
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "card abastecimento-card";
    cardWrapper.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="background: #1A2634; padding: 10px; border-radius: 50%;">
          <i class="fas fa-credit-card" style="color: white;"></i>
        </div>
        <div>
          <div><strong>Cartão Abastecimento</strong></div>
          <div style="color: #777;">••••${codigo.slice(-4)}</div>
        </div>
      </div>
    `;
    cardSection.insertBefore(cardWrapper, document.getElementById("add-card-btn"));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();

  // Adicionar cartão ao clicar no botão
  document.getElementById("add-card-btn").addEventListener("click", () => {
    const novoCodigo = prompt("Digite o código do novo cartão:");
    if (novoCodigo && novoCodigo.length >= 4) {
      userProfile.cartoes.push(novoCodigo);
      renderizarCartoes();
    }
  });
});
