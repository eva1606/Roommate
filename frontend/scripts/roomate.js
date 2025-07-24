document.addEventListener("DOMContentLoaded", () => {
  // 🔐 Authentification
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  if (!userId || role !== "roommate") {
    alert("Accès non autorisé. Veuillez vous reconnecter.");
    window.location.href = "login.html";
    return;
  }

  // 🎛️ MENU BURGER
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const menuOverlay = document.getElementById("menuOverlay");
  const closeMenu = document.getElementById("closeMenu");

  hamburgerBtn?.addEventListener("click", () => {
    menuOverlay.classList.remove("hidden");
  });

  closeMenu?.addEventListener("click", () => {
    menuOverlay.classList.add("hidden");
  });

  // 🧩 Onglets
  const tabApartments = document.getElementById("tab-apartments");
  const tabRoommates = document.getElementById("tab-roommates");
  const apartmentsSection = document.getElementById("apartments-section");
  const roommatesSection = document.getElementById("roommates-section");

  const sortBtn = document.getElementById("sortBtn");
  const sortMenuApartments = document.getElementById("sortMenuApartments");
  const sortMenuRoommates = document.getElementById("sortMenuRoommates");

  function hideAllSortMenus() {
    sortMenuApartments.classList.add("hidden");
    sortMenuRoommates.classList.add("hidden");
  }

  tabApartments?.addEventListener("click", () => {
    tabApartments.classList.add("active");
    tabRoommates.classList.remove("active");
    apartmentsSection?.classList.add("active");
    roommatesSection?.classList.remove("active");
    hideAllSortMenus();
    fetchProperties();
  });

  tabRoommates?.addEventListener("click", () => {
    tabRoommates.classList.add("active");
    tabApartments.classList.remove("active");
    roommatesSection?.classList.add("active");
    apartmentsSection?.classList.remove("active");
    hideAllSortMenus();
    fetchRoommates();
  });

  sortBtn?.addEventListener("click", () => {
    const isApartmentTab = tabApartments.classList.contains("active");
    hideAllSortMenus();
    if (isApartmentTab) {
      sortMenuApartments.classList.toggle("hidden");
    } else {
      sortMenuRoommates.classList.toggle("hidden");
    }
  });

  document.addEventListener("click", (e) => {
    if (
      !sortBtn?.contains(e.target) &&
      !sortMenuApartments?.contains(e.target) &&
      !sortMenuRoommates?.contains(e.target)
    ) {
      hideAllSortMenus();
    }
  });

  // 🔍 Search bar
  const searchInput = document.querySelector(".search-input");
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll(".property-card").forEach((card) => {
      const text = card.getAttribute("data-search") || "";
      card.style.display = text.includes(query) ? "block" : "none";
    });

    document.querySelectorAll(".roomates-card").forEach((card) => {
      const text = card.getAttribute("data-search") || "";
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // 🔘 FILTER toggle
  const filterBtn = document.getElementById("filterBtn");
  const filterOverlay = document.getElementById("filterOverlay");
  const closeFilter = document.getElementById("closeFilter");

  filterBtn?.addEventListener("click", () => {
    filterOverlay?.classList.remove("hidden");
    filterOverlay?.classList.add("show");
  });

  closeFilter?.addEventListener("click", () => {
    filterOverlay?.classList.remove("show");
    filterOverlay?.classList.add("hidden");
  });

  // 🔁 Charger initialement
  fetchProperties();
  setInterval(fetchProperties, 10000);

  // 🚪 Déconnexion
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });
});

async function fetchProperties() {
  const userId = localStorage.getItem("user_id");
  const container = document.getElementById("apartment-available");
  container.innerHTML = "";

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/filtered/${userId}`);
    const properties = await res.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      container.innerHTML = "<p>No matching apartments found.</p>";
      return;
    }

    const propertyIds = properties.map((p) => p.id);
    await fetch(`http://127.0.0.1:5050/api/properties-available/save/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ properties: propertyIds }),
    });

    properties.forEach((prop) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());

      card.innerHTML = `
        <img src="${prop.photo || "default.jpg"}" class="property-photo" />
        <div class="card-body">
          <h3>${prop.address}</h3>
          <p>${prop.rooms} rooms - ${prop.price}₪</p>
          <p>Status: ${prop.status}</p>
          <div class="property-actions">
            <svg class="icon-fav" data-id="${prop.id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <path d="M20.8 4.6c-1.5-1.5-4-1.5-5.5 0l-.8.8-.8-.8c-1.5-1.5-4-1.5-5.5 0-1.5 1.5-1.5 4 0 5.5l6.3 6.3 6.3-6.3c1.6-1.5 1.6-4 0-5.5z" stroke="black" fill="none"/>
            </svg>
            <svg class="icon-delete" data-id="${prop.id}" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
              <polyline points="3 6 5 6 21 6" stroke="#d11a2a"/>
              <path d="M19 6l-1 14H6L5 6" stroke="#d11a2a"/>
              <path d="M10 11v6" stroke="#d11a2a"/>
              <path d="M14 11v6" stroke="#d11a2a"/>
            </svg>
          </div>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (!e.target.closest(".icon-fav") && !e.target.closest(".icon-delete")) {
          window.location.href = `proprietyroomate.html?id=${prop.id}`;
        }
      });

      card.querySelector(".icon-fav")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        try {
          const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: id }),
          });
          if (res.ok) {
            e.currentTarget.querySelector("path").setAttribute("fill", "#2e86de");
          }
        } catch (err) {
          console.error("Erreur favoris:", err);
        }
      });

      card.querySelector(".icon-delete")?.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = e.currentTarget.dataset.id;
        try {
          await fetch(`http://127.0.0.1:5050/api/properties-available/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: id }),
          });
          card.remove();
        } catch (err) {
          console.error("Erreur suppression:", err);
        }
      });

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Failed to fetch properties:", err);
  }
}
async function fetchRoommates() {
  const container = document.getElementById("roommate-properties");
  if (!container) return;

  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("Utilisateur non connecté.");
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/potential-roommates/${userId}`);
    if (!res.ok) throw new Error("Erreur lors du chargement des colocataires compatibles");

    const roommates = await res.json();
    container.innerHTML = ''; // Nettoyer l'affichage

    if (roommates.length === 0) {
      container.innerHTML = "<p>Aucun colocataire compatible trouvé.</p>";
      return;
    }

    roommates.forEach(user => {
      const card = document.createElement("div");
      card.classList.add("roomates-card");
      card.setAttribute(
        'data-search',
        `${user.first_name} ${user.last_name} ${user.location} ${user.budget}`.toLowerCase()
      );

      card.innerHTML = `
        <img src="${user.photo_url || 'default.png'}" alt="${user.first_name}" class="property-photo" />
        <div class="card-body">
          <h3>${user.first_name} ${user.last_name}</h3>
          <p><strong>Location:</strong> ${user.location}</p>
          <p><strong>Budget:</strong> ${user.budget}₪</p>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Erreur chargement roommates:", err);
    container.innerHTML = "<p>Erreur lors du chargement des colocataires.</p>";
  }
}

