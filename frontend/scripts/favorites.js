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

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

  // Boutons de filtre
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      if (filter === "apartment") fetchFavorites(userId);
      else if (filter === "roommate") fetchFavoriteRoommates(userId);
      else {
        // Tous → on combine les deux
        fetchFavorites(userId);
        fetchFavoriteRoommates(userId);
      }
    });
  });

  // Charger par défaut les deux types
  fetchFavorites(userId);
  fetchFavoriteRoommates(userId);
});

async function fetchFavorites(userId) {
  const container = document.getElementById("favorite-container");
  container.innerHTML = "";

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites/${userId}`);
    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      container.innerHTML = "<p>Aucun favori trouvé.</p>";
      return;
    }

    favorites.forEach((prop) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.innerHTML = `
        <img src="${prop.photo || 'default.jpg'}" class="property-photo" />
        <div class="card-body">
          <h3>${prop.address}</h3>
          <p>${prop.price}₪/Month</p>
          <p>${prop.rooms} Rooms</p>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur lors du chargement des favoris :", err);
    container.innerHTML = "<p>Erreur lors du chargement.</p>";
  }
}
async function fetchFavoriteRoommates(userId) {
  const container = document.getElementById("favorite-container");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/potential-roommates/favorites/${userId}`);
    const roommates = await res.json();

    if (!Array.isArray(roommates) || roommates.length === 0) {
      if (container.innerHTML === "") {
        container.innerHTML = "<p>Aucun favori trouvé.</p>";
      }
      return;
    }

    roommates.forEach((roommate) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.innerHTML = `
        <img src="${roommate.photo_url || 'default-avatar.jpg'}" class="property-photo" />
        <div class="card-body">
          <h3>${roommate.first_name} ${roommate.last_name}</h3>
          <p>📍 ${roommate.location}</p>
          <p>💰 ${roommate.budget} ₪/mois</p>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur lors du chargement des favoris colocataires :", err);
    if (container.innerHTML === "") {
      container.innerHTML = "<p>Erreur lors du chargement.</p>";
    }
  }
}
