document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("contact-back");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      loadPage("dashboard");
    });
  }
});
