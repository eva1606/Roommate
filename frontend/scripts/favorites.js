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
  container.innerHTML = "<p>Chargement...</p>";

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites/${userId}`);
    const properties = await res.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      container.innerHTML = "<p>Aucun favori trouvé.</p>";
      return;
    }

    container.innerHTML = "";

    properties.forEach((prop) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.innerHTML = `
        <img src="${prop.photo || "default.jpg"}" class="property-photo" />
        <div class="card-body">
          <h3>${prop.address}</h3>
          <p>${prop.rooms} rooms - ${prop.price}₪</p>
        </div>
      `;
      container.appendChild(card);
    });

  } catch (err) {
    console.error("Erreur chargement favoris :", err);
    container.innerHTML = "<p>Erreur serveur</p>";
  }
});