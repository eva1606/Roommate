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

  // Filtrage
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      handleFilter(filter, userId);
    });
  });

  // Affichage par défaut
  handleFilter("all", userId);
});

function handleFilter(filter, userId) {
  const propertyContainer = document.getElementById("property-container");
  const roommateContainer = document.getElementById("roommate-container");

  // Réinitialise les contenus
  propertyContainer.innerHTML = "";
  roommateContainer.innerHTML = "";

  // Affiche/masque les sections
  propertyContainer.style.display = (filter === "all" || filter === "apartment") ? "grid" : "none";
  roommateContainer.style.display = (filter === "all" || filter === "roommate") ? "flex" : "none";

  // Appelle les bons fetch
  if (filter === "all") {
    fetchFavorites(userId);
    fetchFavoriteRoommates(userId);
  } else if (filter === "apartment") {
    fetchFavorites(userId);
  } else if (filter === "roommate") {
    fetchFavoriteRoommates(userId);
  }
}

async function fetchFavorites(userId) {
  const container = document.getElementById("property-container");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites/${userId}`);
    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      container.innerHTML = "<p>Aucun appartement favori trouvé.</p>";
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
    console.error("❌ Erreur chargement propriétés :", err);
    container.innerHTML = "<p>Erreur lors du chargement.</p>";
  }
}

async function fetchFavoriteRoommates(userId) {
  const container = document.getElementById("roommate-container");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/potential-roommates/favorites/${userId}`);
    const roommates = await res.json();

    // Filtrer les doublons par profil_user_id
    const unique = [];
    const seen = new Set();

    roommates.forEach(r => {
      if (!seen.has(r.profil_user_id)) {
        seen.add(r.profil_user_id);
        unique.push(r);
      }
    });

    if (!Array.isArray(unique) || unique.length === 0) {
      container.innerHTML = "<p>Aucun colocataire favori trouvé.</p>";
      return;
    }

    unique.forEach((roommate) => {
      const card = document.createElement("div");
      card.classList.add("roommate-card");
      card.innerHTML = `
        <div class="roommate-left">
          <img src="${roommate.photo_url || 'default-avatar.jpg'}" class="roommate-photo" />
          <div class="roommate-info">
            <h3>${roommate.first_name} ${roommate.last_name}</h3>
            <p>📍 ${roommate.location}</p>
            <p>💰 ${roommate.budget} ₪/mois</p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur chargement colocataires favoris :", err);
    container.innerHTML = "<p>Erreur lors du chargement.</p>";
  }
}

