document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 Authentification
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  if (!userId || role !== "roommate") {
    alert("Accès non autorisé. Veuillez vous reconnecter.");
    window.location.href = "login.html";
    return;
  }

  // 🍔 Menu burger
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");

  hamburgerBtn?.addEventListener("click", () => menuOverlay.classList.remove("hidden"));
  closeMenu?.addEventListener("click", () => menuOverlay.classList.add("hidden"));

  // 🚪 Déconnexion
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

  const container = document.getElementById("favorite-properties");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites/${userId}`);
    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      container.innerHTML = "<p>Aucun appartement en favori.</p>";
      return;
    }

    container.innerHTML = ""; // reset

    favorites.forEach(prop => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());

      card.innerHTML = `
        <img src="${prop.photo || 'default.jpg'}" class="property-photo" />
        <div class="card-body">
          <h3>${prop.address}</h3>
          <p>${prop.rooms} rooms - ${prop.price}₪</p>
          <div class="property-actions">
            <svg class="icon-fav filled" data-id="${prop.id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.6-1.5 1.6-4 0-5.5z" stroke="#2e86de" fill="#2e86de"/>
            </svg>
          </div>
        </div>
      `;

      // Clic sur la carte → redirection vers la page détail
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".icon-fav")) {
          window.location.href = `proprietyroomate.html?id=${prop.id}`;
        }
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur chargement favoris :", err);
    container.innerHTML = "<p>Erreur lors du chargement des favoris.</p>";
  }
});
