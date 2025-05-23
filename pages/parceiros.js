// pages/parceiros.js

// Torna a função acessível globalmente
window.carregarParceiros = carregarParceiros;

async function carregarParceiros() {
  document.body.style.background = '#ffffff';
  const container = document.getElementById("partners-list");

  if (!container) {
    console.warn("Elemento #partners-list não encontrado.");
    return;
  }

  container.innerHTML = "<p>Carregando parceiros...</p>";

  const { data, error } = await supabase
    .from("parceiros_publicos")
    .select("*");

  if (error) {
    console.error("Erro ao buscar parceiros:", error);
    container.innerHTML = "<p>Erro ao carregar os parceiros.</p>";
    return;
  }

  console.log("Dados recebidos da view parceiros_publicos:", data);

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nenhum parceiro encontrado.</p>";
    return;
  }

  container.innerHTML = "";

  data.forEach(parceiro => {
    const logoUrl = parceiro.logo || 'midias/logo-parceiros-empty.png';
    const card = document.createElement("div");
    card.className = "partner-card";
    card.dataset.id = parceiro.id;

    card.innerHTML = `
      <div class="partner-logo">
        <img src="${logoUrl}" 
             alt="${parceiro.nome}" 
             onerror="this.onerror=null; this.src='midias/logo-parceiros-empty.png'">
      </div>
      <div class="partner-info">
        <div class="partner-name">${parceiro.nome}</div>
        ${parceiro.novo ? '<span class="new-tag">Novo parceiro</span>' : ''}
      </div>
    `;

    card.addEventListener("click", () => mostrarDetalhesParceiro(parceiro));
    container.appendChild(card);
  });

  // Ativa a visualização da seção de parceiros
  document.getElementById("partners-section").classList.add("active-section");

  // Configura o botão de voltar da tela de detalhes
  const backBtn = document.getElementById("partner-profile-back");
  if (backBtn) {
    backBtn.onclick = () => {
      document.getElementById("partner-profile-section").classList.remove("active-section");
      document.getElementById("partners-section").classList.add("active-section");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
  }
}

function mostrarDetalhesParceiro(parceiro) {
  const bannerUrl = parceiro.banner || 'midias/banner-parceiros-empty.png';
  document.getElementById("partner-profile-name").textContent = parceiro.nome;
  document.getElementById("partner-status").textContent = parceiro.email || "Contato disponível";
  document.getElementById("partner-featured-image").src = bannerUrl;
  document.getElementById("partner-description").textContent = parceiro.descricao || "-";
  document.getElementById("partner-address").textContent = parceiro.endereco || "-";
  document.getElementById("partner-phone").textContent = parceiro.telefone || "-";
  document.getElementById("partner-hours").textContent = parceiro.site || "Site não informado";

  document.getElementById("partners-section").classList.remove("active-section");
  document.getElementById("partner-profile-section").classList.add("active-section");

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
