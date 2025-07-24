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
    properties.forEach((prop, index) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());
    
      const isNew = index === 0; // première = la plus récente
    
      card.innerHTML = `
  <div class="image-wrapper">
    ${index === 0 ? '<span class="new-badge">NEW</span>' : ""}
    <img src="${prop.photo || 'default.jpg'}" class="property-photo" />
  </div>
  <div class="card-body">
  <div class="card-content">
    <div class="card-text">
      <h3>${prop.address}</h3>
      <p>${prop.price}₪/Months</p>
      <p>${prop.rooms} Rooms</p>
    </div>
    <button class="svg-action-btn" title="Action">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 17V14H15V12H18V9H20V12H23V14H20V17H18ZM11 21L7.825 18.15C6.625 17.0667 5.596 16.1 4.738 15.25C3.87933 14.4 3.171 13.6 2.613 12.85C2.05433 12.1 1.646 11.375 1.388 10.675C1.12933 9.975 1 9.24167 1 8.475C1 6.90833 1.525 5.604 2.575 4.562C3.625 3.52067 4.93333 3 6.5 3C7.36667 3 8.19167 3.179 8.975 3.537C9.75833 3.89567 10.4333 4.40833 11 5.075C11.5667 4.40833 12.2417 3.89567 13.025 3.537C13.8083 3.179 14.6333 3 15.5 3C16.9167 3 18.104 3.429 19.062 4.287C20.0207 5.14567 20.6167 6.15 20.85 7.3C20.55 7.18333 20.25 7.09567 19.95 7.037C19.65 6.979 19.3583 6.95 19.075 6.95C17.3917 6.95 15.9583 7.53733 14.775 8.712C13.5917 9.88733 13 11.3167 13 13C13 13.8667 13.175 14.6873 13.525 15.462C13.875 16.2373 14.3667 16.9 15 17.45C14.6833 17.7333 14.2707 18.096 13.762 18.538C13.254 18.9793 12.8167 19.3667 12.45 19.7L11 21Z" fill="#B7B7B7"/>
  </svg>
    </button>
  </div>
</div>
    `;
      card.addEventListener("click", () => {
        window.location.href = `proprietyroomate.html?id=${prop.id}`;
      });
    
      container.appendChild(card);
      card.querySelector(".svg-action-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
      
        try {
          const res = await fetch("http://127.0.0.1:5050/api/properties-available/favorites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: prop.id }),
          });
      
          if (res.ok) {
            // Change la couleur du cœur
            const path = card.querySelector(".svg-icon path");
            if (path) path.setAttribute("fill", "#2e86de");
          }
        } catch (err) {
          console.error("❌ Erreur ajout favoris :", err);
        }
      });
      
    });

  } catch (err) {
    console.error("❌ Erreur lors du chargement des propriétés :", err);
    container.innerHTML = "<p>Erreur lors du chargement des appartements.</p>";
  }

  // Gestion des onglets (apartments / roommates)
const tabApartments = document.getElementById("tab-apartments");
const tabRoommates = document.getElementById("tab-roommates");
const apartmentsSection = document.getElementById("apartments-section");
const roommatesSection = document.getElementById("roommates-section");

tabApartments?.addEventListener("click", () => {
  tabApartments.classList.add("active");
  tabRoommates.classList.remove("active");
  apartmentsSection.classList.add("active");
  roommatesSection.classList.remove("active");
  fetchProperties();
});

tabRoommates?.addEventListener("click", () => {
  tabRoommates.classList.add("active");
  tabApartments.classList.remove("active");
  roommatesSection.classList.add("active");
  apartmentsSection.classList.remove("active");
  fetchRoommates(); // à créer si ce n’est pas encore fait
});

}
