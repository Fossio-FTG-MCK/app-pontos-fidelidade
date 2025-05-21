async function carregarCompras() {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      console.error("Erro na sessão:", sessionError);
      return;
    }

    const userId = sessionData.session.user.id;

    const { data: compras, error } = await supabase
      .from("v_compras_usuario")
      .select("descricao, pontos_gerados, valor, parceiro_nome, data_compra")
      .eq("usuario_id", userId)
      .order("data_compra", { ascending: false });

    if (error) {
      console.error("Erro ao buscar compras:", error);
      return;
    }

    const comprasList = document.getElementById("comprasList");
    const semComprasMensagem = document.getElementById("semComprasMensagem");

    comprasList.innerHTML = "";

    if (!compras || compras.length === 0) {
      semComprasMensagem.style.display = "block";
      return;
    } else {
      semComprasMensagem.style.display = "none";
    }

    compras.forEach(compra => {
      const item = document.createElement("li");
      item.className = "compra-item";

      item.innerHTML = `
        <div class="compra-icon-wrapper">
          <i class="bi bi-bag compra-icon"></i>
        </div>
        <div class="compra-conteudo">
          <div class="compra-descricao">${compra.descricao || "Compra sem descrição"}</div>
          <div class="compra-pontos">+${compra.pontos_gerados || 0} pontos</div>
          <div class="compra-valor">Valor: R$ ${parseFloat(compra.valor).toFixed(2)}</div>
          ${compra.parceiro_nome ? `<div class="compra-parceiro">Parceiro: ${compra.parceiro_nome}</div>` : ""}
        </div>
      `;
      comprasList.appendChild(item);
    });

  } catch (err) {
    console.error("Erro geral:", err);
  }
}

// 👉 Expondo no escopo global
window.carregarCompras = carregarCompras;
