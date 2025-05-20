
document.addEventListener("DOMContentLoaded", function () {
  const perguntas = document.querySelectorAll(".faq-question");

  perguntas.forEach(pergunta => {
    pergunta.addEventListener("click", () => {
      const item = pergunta.closest(".faq-item");

      // Alternar classe active no faq-item
      item.classList.toggle("active");
    });
  });
});


document.getElementById("help-back")?.addEventListener("click", function () {
  // Oculta ajuda e mostra dashboard
  document.getElementById("help-section").classList.remove("active-section");
  document.getElementById("dashboard-section").style.display = "block";
  document.getElementById("dashboard-section").classList.add("active-section");
});

