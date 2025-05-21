import { supabase } from "../app.js";

async function preencherPerfil() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return showModal("Usuário não autenticado.");

    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) return showModal("Erro ao carregar dados do usuário.");

    document.getElementById("profile-name-value").textContent = data.nome_usuario || "—";
    document.getElementById("profile-cpf-value").textContent = data.cpf || "—";
    document.getElementById("profile-birth-value").textContent = data.nascimento || "—";
    document.getElementById("profile-phone-value").textContent = data.telefone || "—";
    document.getElementById("profile-email-value").textContent = data.email || user.email || "—";
    document.getElementById("profile-greeting").textContent = `Olá, ${data.nome_usuario || "cliente"}!`;
    document.getElementById("profile-points").textContent = `Saldo: ${formatarNumero(data.pontos || 0)} pontos`;

    const qrContainer = document.getElementById("profile-qr-code");
    qrContainer.innerHTML = "";
    const qrImg = document.createElement("img");
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=" + encodeURIComponent(data.email);
    qrImg.alt = "QR Code do Cliente";
    qrImg.style.width = "120px";
    qrImg.style.height = "120px";
    qrContainer.appendChild(qrImg);

    await renderizarCartoesDoUsuario(data.id);

    const editarBtn = document.getElementById("editar-dados-btn");
    editarBtn.onclick = () => habilitarEdicao(data);

  } catch (e) {
    showModal("Erro inesperado ao carregar o perfil.");
    console.error(e);
  }
}

async function renderizarCartoesDoUsuario(userId) {
  const { data: vouchers, error } = await supabase
    .from("v_vouchers_usuario")
    .select("*")
    .eq("usuario_id", userId);

  if (error) {
    console.error("Erro ao carregar vouchers:", error);
    return;
  }

  const cardSection = document.querySelector(".cards-section");
  cardSection.querySelectorAll(".abastecimento-card").forEach(el => el.remove());

  vouchers.forEach(voucher => {
    const card = document.createElement("div");
    card.className = "card abastecimento-card";
    card.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="background: var(--primary); padding: 10px; border-radius: 50%;">
          <i class="fas fa-gift" style="color: white;"></i>
        </div>
        <div>
          <div><strong>${voucher.titulo}</strong></div>
          <div style="color: #777;">Resgatado em ${new Date(voucher.resgatado_em).toLocaleDateString("pt-BR")}</div>
        </div>
      </div>`;
    cardSection.insertBefore(card, document.getElementById("add-card-btn"));
  });
}

function habilitarEdicao(dados) {
  const campos = [
    { id: "profile-name-value", key: "nome_usuario" },
    { id: "profile-cpf-value", key: "cpf" },
    { id: "profile-birth-value", key: "nascimento" },
    { id: "profile-phone-value", key: "telefone" },
    { id: "profile-email-value", key: "email" }
  ];

  campos.forEach(({ id, key }) => {
    const span = document.getElementById(id);
    const valorAtual = span.textContent.trim();
    const input = document.createElement("input");
    input.type = "text";
    input.value = valorAtual;
    input.dataset.fieldKey = key;
    input.classList.add("input-edicao");
    span.replaceWith(input);
    input.id = id;
  });

  const btn = document.getElementById("editar-dados-btn");
  btn.textContent = "Salvar Dados";
  btn.onclick = () => salvarDadosUsuario(dados.id);
}

async function salvarDadosUsuario(userId) {
  const inputs = document.querySelectorAll(".input-edicao");
  const updates = {};

  inputs.forEach(input => {
    const campo = input.dataset.fieldKey;
    updates[campo] = input.value.trim();
  });

  try {
    const { data, error } = await supabase
      .from("usuarios")
      .update(updates)
      .eq("id", userId);

    console.log("Resposta do update:", { data, error });

    if (error) {
      showModal("Erro ao salvar os dados.");
      console.error(error);
      return;
    }

    showModal("Dados atualizados com sucesso!");
    // location.reload(); // manter comentado
  } catch (e) {
    showModal("Erro inesperado ao salvar os dados.");
    console.error(e);
  }
}

function formatarNumero(valor) {
  return valor.toLocaleString("pt-BR");
}

document.addEventListener("DOMContentLoaded", () => {
  preencherPerfil();

  const modal = document.getElementById("add-card-modal");
  const openBtn = document.getElementById("add-card-btn");
  const closeBtn = document.getElementById("close-add-card-modal");
  const form = document.getElementById("add-card-form");
  const input = document.getElementById("card-code");

  openBtn.addEventListener("click", () => modal.style.display = "flex");
  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    input.value = "";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    showModal("Função de adicionar vouchers está desativada para este módulo.");
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      input.value = "";
    }
  });
});

window.preencherPerfil = preencherPerfil;
window.salvarDadosUsuario = salvarDadosUsuario;
