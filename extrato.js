if (!window.userData) {
  window.userData = {};
}

userData.history = [
  { type: 'credit', description: 'Reserva confirmada - suíte luxo', date: '01/04/2025', points: 500 },
  { type: 'debit', description: 'Resgate - Upgrade de quarto', date: '02/04/2025', points: 1000 },
  { type: 'credit', description: 'Hospedagem - Fim de semana', date: '05/04/2025', points: 700 },
  { type: 'debit', description: 'Resgate - Jantar especial', date: '07/04/2025', points: 1500 }
];

const timeline = document.getElementById("statement-timeline");

if (timeline && Array.isArray(userData.history)) {
  userData.history.forEach(activity => {
    const item = document.createElement("div");
    item.className = `statement-item ${activity.type}`;

    const sign = activity.type === 'debit' ? '-' : '+';
    const pointsValue = sign + activity.points;

    item.innerHTML = `
      <div class="statement-icon"><i class="fas fa-coins"></i></div>
      <div class="statement-details">
        <h4>${activity.description}</h4>
        <p>${activity.date}</p>
      </div>
      <div class="statement-points">${pointsValue}</div>
    `;
    timeline.appendChild(item);
  });
}