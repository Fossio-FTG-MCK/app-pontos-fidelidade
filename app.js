// Para impedir que esses erros "de fora" sujem o console
window.addEventListener('unhandledrejection', function(event) {
  // Ignora certos erros de extensões
  if (event.reason && event.reason.message && event.reason.message.includes('message channel closed')) {
    event.preventDefault(); // Impede de aparecer no console
  }
});

import { createClient } from "@supabase/supabase-js";

// Descrição: Configuração do Supabase
const SUPABASE_URL = "https://kpjwznuthdnodfqgnidk.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtwand6bnV0aGRub2RmcWduaWRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDcxMjcsImV4cCI6MjA1OTM4MzEyN30.8rtnknzowlYM393S_awylDyKHBG9P3cI2VrKgQwxqNU";
// Cria client e expõe globalmente
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabase = supabase;
export { supabase };

let session = null;
// Disponibiliza funções globais
window.loadPage = loadPage;
window.logoutUser = async () => { await supabase.auth.signOut(); location.reload(); };
window.showModal = showModal;
window.hideModal = hideModal;

// Exibe modal genérico
function showModal(message) {
  const modal = document.getElementById("modal");
  const msgEl = document.getElementById("modal-message");
  msgEl.innerHTML = message;
  modal.classList.add("active");
  modal.style.display = 'block';
  const okBtn = document.getElementById("modal-ok");
  if (okBtn) okBtn.focus();
}

// Fecha o modal
function hideModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("active");
  modal.style.display = "none";
  const menuOverlay = document.getElementById("menu-overlay");
  if (menuOverlay) menuOverlay.style.display = "none";
}

// Aguarda layout carregado
async function waitForLayoutReady() {
  let tries = 0;
  while (
    !document.getElementById("menu-icon") ||
    !document.getElementById("close-menu") ||
    !document.getElementById("menu-overlay")
  ) {
    if (++tries > 80) throw new Error("Layout não inicializou!");
    await new Promise(res => setTimeout(res, 50));
  }
}

// Configura menu lateral
function setupMenuEvents() {
  const menu = document.getElementById("side-menu");
  const overlay = document.getElementById("menu-overlay");
  const menuIcon = document.getElementById("menu-icon");
  const closeBtn = document.getElementById("close-menu");

  menuIcon.onclick = () => {
    menu.classList.add("active");
    overlay.classList.add("active");
  };
  closeBtn.onclick = () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
  };
  overlay.onclick = () => {
    menu.classList.remove("active");
    overlay.classList.remove("active");
  };

document.querySelectorAll("#side-menu .menu-item").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    menu.classList.remove("active");
    overlay.classList.remove("active");

    const id = el.id;
    if (id === "menu-logout") {
      logoutUser();
    } else if (id && id.startsWith("menu-")) {
      const page = id.replace("menu-", "");
      loadPage(page);
    }
  });
});

}

// Remove assets de páginas anteriores
function cleanPageAssets() {
  document.querySelectorAll('link[data-page-css]').forEach(el => el.remove());
  document.querySelectorAll('script[data-page-js]').forEach(el => el.remove());
}

// Carrega página dinâmica


// Função principal
async function main() {
  try {
    // Injeta layout
    const layoutResp = await fetch("layout.html");
    if (!layoutResp.ok) throw new Error("Falha ao carregar layout.");
    document.getElementById("layout-container").innerHTML = await layoutResp.text();

    await waitForLayoutReady();
    setupMenuEvents();

    // Sessão
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    session = data.session;
    if (!session || !session.user) {
      location.href = "login-signup-reset.html";
      return;
    }

    // Preenche menu com dados reais
    try {
      const { data: row } = await supabase
        .from("usuarios")
        .select("nome_usuario,nivel")
        .eq("id", session.user.id)
        .single();
      document.getElementById("menu-user-name").textContent = row.nome_usuario || session.user.email;
      document.getElementById("menu-user-level").textContent = row.nivel || "Membro";
    } catch {
      document.getElementById("menu-user-name").textContent = session.user.email;
    }

    loadPage("dashboard");
  } catch (e) {
    // Verifica se o erro é devido à falta de conexão
    if (navigator.onLine) {
      document.getElementById("layout-container").innerHTML = `<div style="padding:60px 32px;text-align:center"><h2 style="color:var(--primary)">Erro crítico</h2><p>${e.message}</p><button onclick="location.reload()" style="padding:10px 20px;background:var(--primary);color:#fff;border:none;border-radius:8px">Recarregar página</button></div>`;
    } else {
      console.warn("Sem conexão com a internet. O modal não será exibido.");
    }
  }
}
main();

// Eventos do modal
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", e => {
    if (e.target.id === "modal-ok" || e.target.id === "modal") hideModal();
  });
  document.body.addEventListener("keydown", e => {
    if (e.key === "Escape") hideModal();
  });

  // Event delegation para o botão manual-points-btn
  document.body.addEventListener("click", e => {
    if (e.target && e.target.id === "manual-points-btn") {
      const codigoInput = document.getElementById("codigo-input");
      if (codigoInput) {
        const codigo = codigoInput.value.trim().toUpperCase();
        if (codigo) {
          window.handleAddPoints(codigo);
        }
      }
    }
  });
});

export async function loadPage(page) {
  try {
    const content = await fetch(`pages/${page}.html`).then(res => res.text());
    document.getElementById("main-content").innerHTML = content;

    // Carregar CSS
    const cssPath = `pages/${page}.css`;
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = cssPath;
    document.head.appendChild(cssLink);

    // Carregar JS como módulo
    const jsPath = `pages/${page}.js`;
    const script = document.createElement("script");
    script.src = jsPath;
    script.type = "module";
    script.onload = () => console.log(`${page}.js carregado`);
    script.onerror = () => console.warn(`Erro ao carregar ${page}.js`);
    document.body.appendChild(script);

    // Garante que a section correta fique ativa
    setTimeout(() => {
      // Mapeamento de página para section id
      const pageToSection = {
        'dashboard': 'dashboard-section',
        'parceiros': 'partners-section',
        'partner-profile': 'partner-profile-section',
        'vouchers': 'vouchers-section',
        'extrato': 'statement-section',
        'compras': 'compras-section',
        'meus-dados': 'profile-section',
        'help': 'help-section',
        'contato': 'contact-section',
      };
      const sectionId = pageToSection[page];
      if (sectionId && window.mostrarSecao) {
        window.mostrarSecao(sectionId);
      }
    }, 100);

    // Força execução de função específica da página se disponível
    setTimeout(() => {
      if (page === "meus-dados" && typeof preencherPerfil === "function") {
        preencherPerfil();
      } else if (page === "compras" && typeof carregarCompras === "function") {
        carregarCompras();
      } else if (page === "dashboard" && typeof carregarDashboard === "function") {
        carregarDashboard();
      } else if (page === "parceiros" && typeof carregarParceiros === "function") {
        carregarParceiros();
      } else if (page === "extrato" && typeof carregarExtrato === "function") {
        carregarExtrato();
      } else if (page === "vouchers" && typeof carregarVouchers === "function") {
        carregarVouchers();
      }
    }, 200);
  } catch (error) {
    console.error("Erro ao carregar página:", error);
    // showModal("Erro ao carregar a página.");
  }
}

// Função utilitária para navegação entre seções
window.mostrarSecao = function(idSecao) {
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active-section'));
  const secao = document.getElementById(idSecao);
  if (secao) secao.classList.add('active-section');
};

export function getLoggedUserId() {
  return session && session.user ? session.user.id : null;
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration);
      })
      .catch(error => {
        console.error('Falha ao registrar o Service Worker:', error);
      });
  });
}

// Dentro de handleAddPoints ou função de sucesso em dashboard.js
function fecharIframeModalCompletamente() {
    document.getElementById('iframe-modal')?.remove();
    document.getElementById('iframe-backdrop')?.remove();
    // Se o botão de fechar externo tiver um ID ou classe específica, remova-o também.
    // Exemplo, se o botão 'X' tiver um ID 'external-iframe-close-btn':
    // document.getElementById('external-iframe-close-btn')?.remove(); 
    // Ou, usando o seletor que usei antes para o botão X em inserir-escanear-cod.html
     const closeBtn = document.querySelector('button[style*=\"background: #f00\"][style*=\"z-index: 10000\"]');
     closeBtn?.remove();
}

// Após o sucesso da adição de pontos:
// showModal("Pontos adicionados com sucesso!"); // ou similar
// fecharIframeModalCompletamente();
// await atualizarHistoricoPontos(userId); // etc.