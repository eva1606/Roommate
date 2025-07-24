document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  if (!userId || role !== "roommate") {
    alert("Accès non autorisé. Veuillez vous reconnecter.");
    window.location.href = "login.html";
    return;
  }

  // Menu burger
  document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.remove("hidden");
  });
  document.getElementById("closeMenu")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
  });

  // Search
  const searchInput = document.querySelector(".search-input");
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll(".property-card").forEach((card) => {
      const text = card.getAttribute("data-search") || "";
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // Initialisation
  fetchProperties();

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });
});

// ✅ Affiche les propriétés filtrées pour l'utilisateur connecté
async function fetchProperties() {
  const userId = localStorage.getItem("user_id");
  const container = document.getElementById("apartment-available");
  container.innerHTML = "";

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/filtered/${userId}`);
    const properties = await res.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      container.innerHTML = "<p>Aucun appartement disponible trouvé.</p>";
      return;
    }

    properties.forEach((prop) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.adress} ${prop.rooms} ${prop.price}`.toLowerCase());

      card.innerHTML = `
        <img src="${prop.photo || 'default.jpg'}" class="property-photo" />
        <div class="card-body">
          <div class="card-text">
            <h3>${prop.adress}</h3>
            <p>${prop.price}₪/mois</p>
            <p>${prop.rooms} pièces</p>
          </div>
        </div>
      `;

      // Navigation vers détails
      card.addEventListener("click", () => {
        window.location.href = `proprietyroomate.html?id=${prop.id}`;
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur lors du chargement des propriétés :", err);
    container.innerHTML = "<p>Erreur lors du chargement des appartements.</p>";
  }
}
