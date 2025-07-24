document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  if (!userId || role !== "roommate") {
    alert("Accès non autorisé. Veuillez vous reconnecter.");
    window.location.href = "login.html";
    return;
  }

  // 🎛️ Menu
  document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.remove("hidden");
  });

  document.getElementById("closeMenu")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
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
    sortMenuApartments?.classList.add("hidden");
    sortMenuRoommates?.classList.add("hidden");
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
    const isApartmentTab = tabApartments?.classList.contains("active");
    hideAllSortMenus();
    if (isApartmentTab) {
      sortMenuApartments?.classList.toggle("hidden");
    } else {
      sortMenuRoommates?.classList.toggle("hidden");
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

    document.querySelectorAll(".property-card, .roomates-card").forEach((card) => {
      const text = card.getAttribute("data-search") || "";
      card.style.display = text.includes(query) ? "block" : "none";
    });
  });

  // 🔘 Filtres
  document.getElementById("filterBtn")?.addEventListener("click", () => {
    document.getElementById("filterOverlay")?.classList.replace("hidden", "show");
  });

  document.getElementById("closeFilter")?.addEventListener("click", () => {
    document.getElementById("filterOverlay")?.classList.replace("show", "hidden");
  });

  // 🏠 Initialisation
  fetchProperties();
  setInterval(fetchProperties, 100000000000000000);

  // 🚪 Logout
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });
});

// ✅ PROPRIÉTÉS DISPONIBLES
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
      const isFavorited = prop.is_favorited; 
      card.innerHTML = `
        <img src="${prop.photo || "default.jpg"}" class="property-photo" />
        <div class="card-body">
          <div class="card-text">
            <h3>${prop.address}</h3>
            <p>${prop.price}₪/perMonth</p>
            <p>${prop.rooms} Rooms</p>
          </div>
          <div class="card-icons">
          <button class="icon-btn icon-fav" data-id="${prop.id}" title="Add to favorites">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 17V14H15V12H18V9H20V12H23V14H20V17H18ZM11 21L7.825 18.15C6.625 17.0667 5.596 16.1 4.738 15.25C3.87933 14.4 3.171 13.6 2.613 12.85C2.05433 12.1 1.646 11.375 1.388 10.675C1.12933 9.975 1 9.24167 1 8.475C1 6.90833 1.525 5.604 2.575 4.562C3.625 3.52067 4.93333 3 6.5 3C7.36667 3 8.19167 3.179 8.975 3.537C9.75833 3.89567 10.4333 4.40833 11 5.075C11.5667 4.40833 12.2417 3.89567 13.025 3.537C13.8083 3.179 14.6333 3 15.5 3C16.9167 3 18.104 3.429 19.062 4.287C20.0207 5.14567 20.6167 6.15 20.85 7.3C20.55 7.18333 20.25 7.09567 19.95 7.037C19.65 6.979 19.3583 6.95 19.075 6.95C17.3917 6.95 15.9583 7.53733 14.775 8.712C13.5917 9.88733 13 11.3167 13 13C13 13.8667 13.175 14.6873 13.525 15.462C13.875 16.2373 14.3667 16.9 15 17.45C14.6833 17.7333 14.2707 18.096 13.762 18.538C13.254 18.9793 12.8167 19.3667 12.45 19.7L11 21Z"
            fill="${isFavorited ? "#2e86de" : "#B7B7B7"}"/>
        </svg>
        </button>
        <button class="icon-btn icon-delete" data-id="${prop.id}" title="Remove apartment">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7.5 0L6.25 1H0V3H3.75H16.25H20V1H13.75L12.5 0H7.5ZM1.25 5V18C1.25 19.1 2.375 20 3.75 20H16.25C17.625 20 18.75 19.1 18.75 18V5H1.25Z" fill="#0021F5"/>
        </svg>
      </button>
          </div>
        </div>
      `;

      // Navigation vers détail
      card.addEventListener("click", (e) => {
        if (!e.target.closest(".icon-btn")) {
          window.location.href = `proprietyroomate.html?id=${prop.id}`;
        }
      });

      card.querySelector(".icon-fav").addEventListener("click", async (e) => {
        e.stopPropagation();
        const propertyId = e.currentTarget.dataset.id;
      
        try {
          const res = await fetch(`http://127.0.0.1:5050/api/properties-available/favorites`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: propertyId }),
          });
      
          if (res.ok) {
            const path = e.currentTarget.querySelector("svg path");
            if (path) path.setAttribute("fill", "#2e86de");
          }
        } catch (err) {
          console.error("Erreur ajout favoris:", err);
        }
      });
      // 🗑️ Suppression
      card.querySelector(".icon-delete").addEventListener("click", async (e) => {
        e.stopPropagation();
        const propertyId = e.currentTarget.dataset.id;
        try {
          await fetch(`http://127.0.0.1:5050/api/properties-available/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: propertyId }),
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

// ✅ ROOMMATES
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
    container.innerHTML = '';

    if (roommates.length === 0) {
      container.innerHTML = "<p>Aucun colocataire compatible trouvé.</p>";
      return;
    }

    roommates.forEach(user => {
      const card = document.createElement("div");
      card.classList.add("roomates-card");
      card.setAttribute("data-search", `${user.first_name} ${user.last_name} ${user.location} ${user.budget}`.toLowerCase());

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
