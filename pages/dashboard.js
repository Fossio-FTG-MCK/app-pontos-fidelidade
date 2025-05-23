// dashboard.js completo e corrigido

// Helper function to close the iframe modal
function fecharIframeModalCompletamente() {
  const modal = document.getElementById('iframe-modal');
  const modalContainer = document.getElementById('iframe-modal-container');
  const backdrop = document.getElementById('iframe-backdrop');
  const closeBtn = document.querySelector('button[style*="z-index: 10000"]'); 

  // Animação de saída
  if (backdrop && modalContainer) {
    backdrop.style.transition = 'opacity 0.2s ease';
    modalContainer.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    backdrop.style.opacity = '0';
    modalContainer.style.opacity = '0';
    modalContainer.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
      modal?.remove();
      modalContainer?.remove();
      backdrop?.remove();
      closeBtn?.remove();
    }, 200);
  } else {
    // Fallback - remove imediatamente se não houver elementos para animação
    modal?.remove();
    modalContainer?.remove();
    backdrop?.remove();
    closeBtn?.remove();
  }
  
  console.log("Modal iframe fechado via fecharIframeModalCompletamente.");
}

// Função global para ser chamada pelo iframe para solicitar o fechamento
window.solicitarFechamentoDoModalIframe = function() {
  console.log("Solicitação de fechamento recebida do iframe.");
  fecharIframeModalCompletamente();
};

// Função global para ser chamada pelo iframe
window.handleAddPoints = async function(codigo) {
  console.log("window.handleAddPoints chamado em dashboard.js com código:", codigo);
  
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (sessionError || !user) {
    console.error("Erro ao obter sessão ou usuário não logado:", sessionError);
    showModal("Você precisa estar logado para adicionar pontos.");
    fecharIframeModalCompletamente(); // Ensure modal is closed
    return;
  }
  const userId = user.id;

  if (!codigo || typeof codigo !== 'string' || codigo.trim() === '') {
    showModal("Código inválido ou não fornecido.");
    fecharIframeModalCompletamente(); // Ensure modal is closed
    return;
  }

  try {
    console.log(`Tentando usar pontos com o código '${codigo.trim()}' para o usuário ID: ${userId}`);
    const { data: rpcData, error: rpcError } = await supabase.rpc('usar_pontos', { ponto_id: codigo.trim() });

    if (rpcError) {
        console.error("Erro na chamada RPC 'usar_pontos':", rpcError);
        // Try to parse a more user-friendly message if available
        let displayErrorMessage = `Erro ao processar o código "${codigo}": ${rpcError.message}`;
        try {
            const errorDetails = JSON.parse(rpcError.message);
            if (errorDetails.message) {
                displayErrorMessage = errorDetails.message; 
            }
        } catch (e) { /* Ignore parsing error, use original message */ }
        showModal(displayErrorMessage);
    } else {
        // Assuming the RPC returns some data on success, or at least no error means success.
        // The problem description mentioned the function 'usar_pontos' works,
        // but not what it returns. We will assume success if no error.
        console.log("RPC 'usar_pontos' executada com sucesso. Dados retornados:", rpcData);
        
        // It's important that the RPC itself handles point crediting and history logging.
        // Here, we just update the UI based on the assumption that the backend did its job.
        showModal(`Código "${codigo}" processado com sucesso!`);
        await carregarDashboard(); // Recarrega dados do dashboard (incluindo pontos e histórico)
    }

  } catch (error) {
    console.error("Erro inesperado ao chamar RPC 'usar_pontos':", error);
    showModal(`Erro inesperado ao processar o código "${codigo}": ${error.message || 'Erro desconhecido'}`);
  } finally {
    fecharIframeModalCompletamente(); // Fecha o modal iframe em qualquer caso (sucesso ou erro)
  }
};

async function carregarDashboard() {
  function showDebug(msg) {
    const el = document.getElementById("debug-log");
    if (el) {
      el.innerHTML = msg;
      el.style.display = "block";
    }
  }

  if (typeof supabase === 'undefined') {
    console.error("❌ Supabase não está carregado!");
    showDebug("Erro: Supabase não está disponível.");
    return;
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;
  if (!user) {
    console.error("❌ Sessão não encontrada:", sessionError);
    showDebug("Sessão inválida.");
    return;
  }

  const userId = user.id;
  let pontosUsuario = 0;

  const { data: dashboardRows, error: dashboardError } = await supabase
    .from("v_dashboard_usuario")
    .select("*")
    .eq("usuario_id", userId)
    .order("data_ponto", { ascending: false })
    .order("resgatado_em", { ascending: false });

  if (dashboardError || !dashboardRows || dashboardRows.length === 0) {
    console.error("❌ Erro no dashboard:", dashboardError);
    showDebug("Erro ao carregar dashboard.");
    return;
  }

  const usuario = {
    nome_usuario: dashboardRows[0]?.nome_usuario,
    nivel: dashboardRows[0]?.nivel,
    pontos: dashboardRows[0]?.pontos,
  };

  pontosUsuario = usuario.pontos || 0;

  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = usuario.nome_usuario || "Usuário";

  const levelEl = document.getElementById("user-level");
  if (levelEl) levelEl.textContent = `Nível: ${usuario.nivel || "Membro"}`;

  const pointsEl = document.getElementById("points-count");
  if (pointsEl) pointsEl.textContent = pontosUsuario;

  await atualizarHistoricoPontos(userId);
  await carregarReservas(userId);

  // Ativa a aba destaque como padrão
  document.getElementById("tab-features")?.classList.add("active");
  document.getElementById("content-features")?.classList.add("active");
  document.getElementById("tab-benefits")?.classList.remove("active");
  document.getElementById("content-benefits")?.classList.remove("active");

  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      const contentId = tab.id.replace("tab", "content");
      const contentEl = document.getElementById(contentId);
      if (contentEl) contentEl.classList.add("active");
      else console.warn(`⚠️ Aba '${contentId}' não encontrada.`);
    });
  });

  await carregarBeneficios(pontosUsuario);

  // Configura os event listeners para os botões do modal AQUI, no final de carregarDashboard
  const scanCodeBtn = document.getElementById("scan-code-btn");
  const manualPointsBtn = document.getElementById("manual-points-btn");

  if (scanCodeBtn) {
    scanCodeBtn.addEventListener("click", abrirModalIframe);
  } else {
    console.warn("Botão 'scan-code-btn' não encontrado em carregarDashboard.");
  }

  if (manualPointsBtn) {
    manualPointsBtn.addEventListener("click", abrirModalIframe);
  } else {
    console.warn("Botão 'manual-points-btn' não encontrado em carregarDashboard.");
  }
}

async function atualizarHistoricoPontos(userId) {
  if (!userId) {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    if (!user) return;
    userId = user.id;
  }

  const { data: dashboardRows, error } = await supabase
    .from("v_dashboard_usuario")
    .select("*")
    .eq("usuario_id", userId)
    .order("data_ponto", { ascending: false })
    .order("resgatado_em", { ascending: false });

  if (error) {
    console.error("Erro ao buscar histórico:", error);
    return;
  }

  const historicoUnico = new Map();
  dashboardRows.forEach((row) => {
    if (row.historico_ponto_id && !historicoUnico.has(row.historico_ponto_id)) {
      historicoUnico.set(row.historico_ponto_id, {
        data: row.data_ponto || row.resgatado_em,
        descricao: row.descricao_ponto,
        pontos: row.pontos_movimentados,
        tipo: row.tipo_movimentacao,
      });
    }
  });

  const historyContainer = document.getElementById("points-history");
  if (historyContainer) {
    historyContainer.innerHTML = "";
    const historicoArray = [...historicoUnico.values()]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 3);

    historicoArray.forEach((item) => {
      const tipo = item.tipo?.toLowerCase();
      const isCredito = tipo === "entrada" || tipo === "credito";
      const tipoClasse = isCredito ? "points-positive" : "points-negative";
      const pontosFormatado = isCredito ? `+${item.pontos}` : `-${item.pontos}`;

      const div = document.createElement("div");
      div.className = "history-item";
      div.innerHTML = `
        <div>
          <div>${item.descricao || "Sem descrição"}</div>
          <div class="date">${item.data}</div>
        </div>
        <div class="points ${tipoClasse}">${pontosFormatado}</div>
      `;
      historyContainer.appendChild(div);
    });
  }
}

async function carregarReservas(userId) {
  const { data: reservasRows, error: reservasError } = await supabase
    .from("v_reservas_usuario")
    .select("*")
    .eq("usuario_id", userId);

  if (reservasError) {
    console.error("❌ Erro ao carregar reservas:", reservasError);
    return;
  }

  const reservasContainer = document.getElementById("reservations-list");
  if (reservasContainer) {
    reservasContainer.innerHTML = "";
    reservasRows.forEach((r) => {
      const el = document.createElement("div");
      el.className = "reservation-item";

      const statusClass =
        r.status === "cancelada"
          ? "status-cancelled"
          : r.status === "concluida"
          ? "status-completed"
          : "status-upcoming";

      const whatsappLink = document.createElement("a");
      whatsappLink.href = "https://wa.me/5511999999";
      whatsappLink.target = "_blank";
      whatsappLink.className = "whatsapp-button";
      whatsappLink.title = "Falar com o hotel";
      whatsappLink.innerHTML = `<i class="fab fa-whatsapp"></i>`;

      el.innerHTML = `
        <div class="reservation-dates">
          <span>${r.checkin}</span>
          <span>${r.checkout}</span>
        </div>
        <div class="reservation-room">${r.suite_nome || "Suíte"}</div>
        <div class="reservation-footer">
          <span class="reservation-status ${statusClass}">${r.status || "agendada"}</span>
        </div>
      `;

      const footer = el.querySelector(".reservation-footer");
      footer.appendChild(whatsappLink);

      reservasContainer.appendChild(el);
    });
  }
}

async function carregarBeneficios(pontosUsuario) {
  try {
    const { data: beneficios, error } = await supabase
      .from("v_beneficios_com_categorias")
      .select("*");

    if (error) {
      console.error("Erro ao buscar benefícios:", error);
      return;
    }

    if (!beneficios || beneficios.length === 0) {
      console.warn("Nenhum benefício encontrado.");
      return;
    }

    const destaques = beneficios.filter(b => b.destaque === true);
    const normais = beneficios;

    const listaDestaques = document.getElementById("content-features");
    if (listaDestaques) {
      listaDestaques.innerHTML = "";
      destaques.forEach(item => {
        listaDestaques.appendChild(renderBeneficio(item, pontosUsuario));
      });
    }

    const listaBeneficios = document.getElementById("benefits-list");
    if (listaBeneficios) {
      listaBeneficios.innerHTML = "";
      normais.forEach(item => {
        listaBeneficios.appendChild(renderBeneficio(item, pontosUsuario));
      });
    }

  } catch (e) {
    console.error("Erro inesperado ao carregar benefícios:", e);
  }
}

function renderBeneficio(item, pontosUsuario) {
  const div = document.createElement("div");
  div.className = "benefit-item";

  const podeResgatar = pontosUsuario >= item.pontos_necessarios;

  div.innerHTML = `
    <div class="benefit-icon">
      <i class="${item.icone || "fas fa-gift"}"></i>
    </div>
    <div class="benefit-info">
      <strong>${item.titulo || "Benefício"}</strong>
      <p>${item.descricao || ""}</p>
    </div>
    <button class="btn-redeem" ${podeResgatar ? "" : "disabled"}>
      Resgatar (${item.pontos_necessarios} pts)
    </button>
  `;

  const button = div.querySelector(".btn-redeem");
  if (podeResgatar) {
    button.addEventListener("click", async () => {
      // Alerta customizado de confirmação
      showModal(`<b>Deseja realmente resgatar este benefício?</b><br><br><strong>${item.titulo}</strong><br>${item.pontos_necessarios} pontos serão descontados.<br><br><button id='confirm-resgate' style='margin:10px 0 0 0;padding:8px 18px;background:var(--primary);color:var(--secondary);border:none;border-radius:6px;font-weight:600;cursor:pointer;'>Confirmar</button>`);
      setTimeout(() => {
        const confirmBtn = document.getElementById('confirm-resgate');
        if (confirmBtn) {
          confirmBtn.onclick = async () => {
            hideModal();
            try {
              const { data: sessionData } = await supabase.auth.getSession();
              const user = sessionData?.session?.user;
              if (!user) {
                showModal("Usuário não autenticado.");
                return;
              }
              const { error } = await supabase
                .from("beneficios_resgatados")
                .insert([{ usuario_id: user.id, beneficio_id: item.beneficio_id, resgatado_em: new Date().toISOString(), pontos_gastos: item.pontos_necessarios }]);
              if (error) {
                console.error("Erro ao resgatar:", error);
                showModal("Erro ao resgatar benefício.");
                return;
              }
              pontosUsuario -= item.pontos_necessarios;
              document.getElementById("points-count").textContent = pontosUsuario;
              button.disabled = true;
              showModal("Benefício resgatado com sucesso!");
              await atualizarHistoricoPontos(user.id);
            } catch (e) {
              console.error("Erro inesperado:", e);
              showModal("Erro inesperado ao resgatar.");
            }
          };
        }
      }, 100);
    });
  }
  return div;
}

// NOVA FUNÇÃO para abrir o modal externo SEM recarregar a dashboard
async function abrirModalIframe() {
  if (document.getElementById('iframe-modal')) return;

  // Cria o fundo escuro (backdrop)
  const backdrop = document.createElement('div');
  backdrop.id = 'iframe-backdrop';
  backdrop.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(16, 36, 69, 0.8);
    z-index: 9998;
    backdrop-filter: blur(4px);
  `;

  // Cria o container do modal
  const modalContainer = document.createElement('div');
  modalContainer.id = 'iframe-modal-container';
  modalContainer.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
    box-sizing: border-box;
  `;

  // Cria o iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'iframe-modal';
  iframe.src = 'pages/inserir-escanear-cod.html';
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    max-width: 500px;
    max-height: 600px;
    border: none;
    border-radius: 12px;
    background-color: #fff;
    box-shadow: 0 8px 32px rgba(16, 36, 69, 0.2);
    overflow: hidden;
  `;

  // Cria botão de fechar
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 15px;
    right: 15px;
    width: 36px;
    height: 36px;
    background: var(--primary, #102445);
    color: var(--secondary, #fff);
    border: none;
    border-radius: 50%;
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(16, 36, 69, 0.3);
    transition: all 0.2s ease;
  `;

  closeBtn.onmouseover = () => {
    closeBtn.style.background = 'var(--primary-light, #223b6f)';
    closeBtn.style.transform = 'scale(1.1)';
  };
  
  closeBtn.onmouseout = () => {
    closeBtn.style.background = 'var(--primary, #102445)';
    closeBtn.style.transform = 'scale(1)';
  };

  closeBtn.onclick = () => { 
    fecharIframeModalCompletamente(); 
  };

  // Fecha modal ao clicar no backdrop
  backdrop.onclick = (e) => {
    if (e.target === backdrop) {
      fecharIframeModalCompletamente();
    }
  };

  // Adiciona elementos na ordem correta
  modalContainer.appendChild(iframe);
  modalContainer.appendChild(closeBtn);
  document.body.appendChild(backdrop);
  document.body.appendChild(modalContainer);

  // Animação de entrada
  requestAnimationFrame(() => {
    backdrop.style.opacity = '0';
    modalContainer.style.opacity = '0';
    modalContainer.style.transform = 'scale(0.9)';
    
    requestAnimationFrame(() => {
      backdrop.style.transition = 'opacity 0.3s ease';
      modalContainer.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      backdrop.style.opacity = '1';
      modalContainer.style.opacity = '1';
      modalContainer.style.transform = 'scale(1)';
    });
  });

  // Responsividade para mobile
  const mediaQuery = window.matchMedia('(max-width: 600px)');
  
  const handleMobileLayout = (e) => {
    if (e.matches) {
      // Mobile
      modalContainer.style.cssText += `
        padding: 10px;
      `;
      iframe.style.cssText += `
        max-width: 100%;
        max-height: 100%;
        height: 90vh;
      `;
      closeBtn.style.cssText += `
        top: 5px;
        right: 5px;
        width: 32px;
        height: 32px;
        font-size: 18px;
      `;
    } else {
      // Desktop
      modalContainer.style.cssText += `
        padding: 20px;
      `;
      iframe.style.cssText += `
        max-width: 500px;
        max-height: 600px;
        height: 100%;
      `;
      closeBtn.style.cssText += `
        top: 15px;
        right: 15px;
        width: 36px;
        height: 36px;
        font-size: 20px;
      `;
    }
  };

  handleMobileLayout(mediaQuery);
  mediaQuery.addListener(handleMobileLayout);
}

window.carregarDashboard = carregarDashboard;
window.abrirModalIframe = abrirModalIframe;

function showModal(message) {
  const modal = document.getElementById("modal");
  const msgEl = document.getElementById("modal-message");
  msgEl.innerHTML = message;
  modal.classList.add("active");
  modal.style.display = 'block';
  const okBtn = document.getElementById("modal-ok");
  if (okBtn) {
    okBtn.focus();
    okBtn.onclick = hideModal;
  }
}

function hideModal() {
  document.getElementById("modal").classList.remove("active");
  document.getElementById("modal").style.display = 'none';
}