document.addEventListener("DOMContentLoaded", () => {
  const compras = [
    {
      descricao: "Compra no Supermercado X",
      pontos: 120
    },
    {
      descricao: "Passagem Aérea",
      pontos: 300
    },
    {
      descricao: "Hospedagem Hotel Real",
      pontos: 500
    }
  ];

  const comprasList = document.getElementById("comprasList");

  compras.forEach(compra => {
    const item = document.createElement("li");
    item.className = "compra-item";

    item.innerHTML = `
      <div class="compra-icon-wrapper">
        <i class="bi bi-bag compra-icon"></i>
      </div>
      <div class="compra-conteudo">
        <div class="compra-descricao">${compra.descricao}</div>
        <div class="compra-pontos">+${compra.pontos} pontos</div>
      </div>
    `;

    comprasList.appendChild(item);
  });
});
