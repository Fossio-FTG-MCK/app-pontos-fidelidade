// vouchers.js
import { supabase } from "../app.js";

// Função principal para carregar vouchers
export async function carregarVouchers() {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return showModal("Usuário não autenticado.");

    const { data: vouchers, error } = await supabase
      .from("vouchers")
      .select("*")
      .eq("usuario_id", user.id);

    if (error) {
      console.error("Erro ao buscar vouchers:", error);
      return showModal("Erro ao carregar vouchers.");
    }

    await atualizarPontosUsuario(); // <-- Correção feita aqui
    listarVouchersAtivos(vouchers);
    configurarBotaoFinalizados(vouchers);

  } catch (e) {
    console.error("Erro inesperado:", e);
    showModal("Erro ao carregar vouchers.");
  }
}

// Atualiza a exibição de pontos do usuário a partir da tabela 'usuarios'
async function atualizarPontosUsuario() {
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("usuarios")
    .select("pontos")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar pontos do usuário:", error);
    return;
  }

  const pontosEl = document.getElementById("vouchers-points-value");
  if (pontosEl) {
    pontosEl.textContent = (data.pontos || 0).toLocaleString("pt-BR");
  }
}

// Renderiza lista de vouchers ativos
function listarVouchersAtivos(vouchers) {
  const lista = document.getElementById("active-voucher-list");
  const emptyMessage = document.getElementById("no-active-vouchers");

  lista.innerHTML = "";

  // Ativos: status diferente de 'usado' e usado_em vazio/nulo
  const ativos = vouchers.filter(v => (v.status !== "usado" || !v.usado_em));

  if (!ativos.length) {
    emptyMessage.style.display = "block";
    return;
  }

  emptyMessage.style.display = "none";

  ativos.forEach(voucher => {
    const item = document.createElement("div");
    item.className = "voucher-item";

    item.innerHTML = `
      <div class="voucher-title">${voucher.titulo}</div>
      <div class="voucher-footer">
        <span class="voucher-status status-active">Ativo</span>
        <div class="voucher-points">${voucher.pontos || 0} pontos</div>
      </div>
    `;

    lista.appendChild(item);
  });
}

// Configura botão e menu de vouchers finalizados
function configurarBotaoFinalizados(vouchers) {
  const btn = document.querySelector(".btn-finished-vouchers");
  const sidemenu = document.getElementById("finished-vouchers-sidemenu");
  const overlay = document.getElementById("finished-vouchers-overlay");
  const closeBtn = document.getElementById("close-finished-vouchers");
  const listaFinalizados = document.getElementById("finished-vouchers-list");

  if (!btn || !sidemenu || !overlay || !closeBtn || !listaFinalizados) return;

  btn.addEventListener("click", () => {
    preencherVouchersFinalizados(vouchers);
    sidemenu.classList.add("active");
    overlay.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
    sidemenu.classList.remove("active");
    overlay.classList.remove("active");
  });

  overlay.addEventListener("click", () => {
    sidemenu.classList.remove("active");
    overlay.classList.remove("active");
  });
}

// Preenche vouchers finalizados dentro do sidemenu
function preencherVouchersFinalizados(vouchers) {
  const container = document.getElementById("finished-vouchers-list");
  container.innerHTML = "";

  // Finalizados: status 'usado' e usado_em preenchido
  const finalizados = vouchers.filter(v => v.status === "usado" && v.usado_em);

  if (!finalizados.length) {
    container.innerHTML = "<p style='text-align:center;'>Nenhum voucher finalizado.</p>";
    return;
  }

  finalizados.forEach(voucher => {
    const item = document.createElement("div");
    item.className = "finished-voucher-item";

    const statusClass = "status-used";

    item.innerHTML = `
      <div class="voucher-header">
        <h4>${voucher.titulo}</h4>
        <div class="voucher-date">${new Date(voucher.usado_em).toLocaleDateString("pt-BR")}</div>
      </div>
      <div class="voucher-details">
        <p>${voucher.descricao || "Sem descrição disponível."}</p>
        <span class="voucher-status ${statusClass}">Utilizado</span>
        <div class="voucher-points">${voucher.pontos || 0} pontos</div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Quando a página carregar, ativa o carregamento automático
document.addEventListener("DOMContentLoaded", () => {
  carregarVouchers();
});

window.carregarVouchers = carregarVouchers;
