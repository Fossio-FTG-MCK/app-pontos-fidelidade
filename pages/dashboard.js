// dashboard.js completo e corrigido

// Helper function to close the iframe modal
function fecharIframeModalCompletamente() {
  document.getElementById('iframe-modal')?.remove();
  document.getElementById('iframe-backdrop')?.remove();
  // Remove o botão 'X' externo (ajuste o seletor se necessário)
  // O botão 'X' é criado em abrirModalIframe e não tem ID, então precisamos de um seletor mais robusto ou adicionarmos um ID lá.
  // Por enquanto, vamos tentar um seletor baseado no que foi feito em inserir-escanear-cod.html para fechar:
  const closeBtn = document.querySelector('button[style*="z-index: 10000"]'); 
  if (closeBtn && closeBtn.parentElement === document.body) { // Garante que é o botão certo
      closeBtn.remove();
  }
  console.log("Modal iframe fechado via fecharIframeModalCompletamente.");
}

// Função global para ser chamada pelo iframe
window.handleAddPoints = async function(codigo) {
  console.log("window.handleAddPoints chamado em dashboard.js com código:", codigo);
  
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const user = sessionData?.session?.user;

  if (sessionError || !user) {
    console.error("Erro ao obter sessão ou usuário não logado:", sessionError);
    showModal("Você precisa estar logado para adicionar pontos.");
    fecharIframeModalCompletamente();
    return;
  }
  const userId = user.id;

  try {
    // AQUI VOCÊ DEVE CHAMAR SUA FUNÇÃO SUPABASE PARA VALIDAR O CÓDIGO E ADICIONAR OS PONTOS
    // Exemplo: const { data, error } = await supabase.rpc('validar_e_adicionar_pontos', { codigo_reserva: codigo, usuario_id: userId });
    // if (error) throw error;
    // const pontosAdicionados = data.pontos_adicionados; // Supondo que sua RPC retorne isso

    // Simulação de sucesso para este exemplo:
    console.log(`Simulando validação do código '${codigo}' para o usuário ID: ${userId}`);
    const pontosAdicionados = 100; // Valor de exemplo
    // Fim da simulação

    if (pontosAdicionados > 0) {
      // Atualiza a contagem de pontos na UI
      const pointsEl = document.getElementById("points-count");
      if (pointsEl) {
        const currentPoints = parseInt(pointsEl.textContent) || 0;
        pointsEl.textContent = currentPoints + pontosAdicionados;
      }
      
      await atualizarHistoricoPontos(userId); // Atualiza o histórico de pontos
      showModal(`Código "${codigo}" validado! ${pontosAdicionados} pontos foram adicionados.`);
    } else {
      // Se a RPC retornar 0 pontos ou um status de código inválido/já usado
      showModal(`Código "${codigo}" não é válido ou já foi utilizado.`);
    }

  } catch (error) {
    console.error("Erro ao validar/adicionar pontos:", error);
    showModal(`Erro ao processar o código "${codigo}": ${error.message}`);
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
  backdrop.style.position = 'fixed';
  backdrop.style.top = '0';
  backdrop.style.left = '0';
  backdrop.style.width = '100vw';
  backdrop.style.height = '100vh';
  backdrop.style.backgroundColor = 'rgba(0,0,0,0.5)';
  backdrop.style.zIndex = '9998';

  // Cria o iframe
  const iframe = document.createElement('iframe');
  iframe.id = 'iframe-modal';
  iframe.src = 'inserir-escanear-cod.html';
  iframe.style.position = 'fixed';
  iframe.style.top = '10%';
  iframe.style.left = '10%';
  iframe.style.width = '80vw';
  iframe.style.height = '80vh';
  iframe.style.border = 'none';
  iframe.style.zIndex = '9999';
  iframe.style.borderRadius = '12px';
  iframe.style.backgroundColor = '#fff';
  iframe.style.boxShadow = '0px 0px 20px rgba(0,0,0,0.5)';

  // Cria botão de fechar
  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'X';
  closeBtn.style.position = 'fixed';
  closeBtn.style.top = '8%';
  closeBtn.style.right = '8%';
  closeBtn.style.width = '40px';
  closeBtn.style.height = '40px';
  closeBtn.style.background = '#f00';
  closeBtn.style.color = '#fff';
  closeBtn.style.border = 'none';
  closeBtn.style.borderRadius = '50%';
  closeBtn.style.fontSize = '20px';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.zIndex = '10000';
  closeBtn.onclick = () => {
    pararScannerInternoDoIframe();
    fecharIframeModalCompletamente();
  };

  // Adiciona tudo no body
  document.body.appendChild(backdrop);
  document.body.appendChild(iframe);
  document.body.appendChild(closeBtn);
}

// Função para tentar chamar o pararScanner dentro do iframe
function pararScannerInternoDoIframe() {
    const iframe = document.getElementById('iframe-modal');
    if (iframe && iframe.contentWindow && typeof iframe.contentWindow.pararScannerGlobal === 'function') {
        iframe.contentWindow.pararScannerGlobal();
        console.log("Chamado pararScannerGlobal() dentro do iframe.");
    } else {
        console.warn("Não foi possível chamar pararScannerGlobal() no iframe. Ou o iframe/função não existe.");
    }
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