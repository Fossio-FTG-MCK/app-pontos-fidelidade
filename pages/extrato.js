// pages/extrato.js

window.carregarExtrato = carregarExtrato;

async function carregarExtrato() {
  if (window.mostrarSecao) window.mostrarSecao('statement-section');
  console.log("extrato.js carregado");

  const container = document.getElementById("statement-timeline");

  if (!container) {
    console.warn("Elemento #statement-timeline não encontrado.");
    return;
  }

  container.innerHTML = "<p>Carregando...</p>";

  try {
    // Busca a sessão no momento da execução
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError || !authData.session) {
      console.error("Erro ao obter sessão do usuário:", authError);
      container.innerHTML = "<p>Erro ao carregar extrato.</p>";
      return;
    }

    const userId = authData.session.user.id;

    const { data, error } = await supabase
      .from("extratos")
      .select("*")
      .eq("usuario_id", userId)
      .order("data", { ascending: false });

    if (error) {
      console.error("Erro ao buscar extrato:", error);
      container.innerHTML = "<p>Erro ao carregar extrato.</p>";
      return;
    }

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Nenhum movimento encontrado.</p>";
      return;
    }

    container.innerHTML = "";

    data.forEach(extrato => {
      const item = document.createElement("div");
      item.className = "statement-item";

      const tipo = (extrato.tipo || '').toLowerCase();
      const isCredito = tipo === 'credito';
      const pontosFormatado = isCredito ? `+${extrato.pontos}` : `-${Math.abs(extrato.pontos)}`;

      item.innerHTML = `
        <div class="statement-item-info">
          <div class="statement-item-description">${extrato.descricao || "-"}</div>
          <div class="statement-item-date">${formatarData(extrato.data)}</div>
        </div>
        <div class="statement-item-points ${isCredito ? "credito" : "debito"}">
          ${pontosFormatado}
        </div>
      `;

      container.appendChild(item);
    });

  } catch (e) {
    console.error("Erro inesperado:", e);
    container.innerHTML = "<p>Erro ao carregar extrato.</p>";
  }
}

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}
