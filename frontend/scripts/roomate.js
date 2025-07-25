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
    const propertyIds = properties.map(p => p.id);
    await fetch(`http://127.0.0.1:5050/api/properties-available/save/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ properties: propertyIds }),
    });

    properties.forEach((prop, index) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());
      
      
      const isNew = index === 0; // première = la plus récente
      const isFavorited = prop.is_favorited;

      card.innerHTML = `
        <div class="image-wrapper">
          ${index === 0 ? '<span class="new-badge">NEW</span>' : ""}
          <img src="${prop.photo || 'default.jpg'}" class="property-photo" />
        </div>
        <div class="card-body">
          <div class="card-text">
            <h3>${prop.address}</h3>
            <p>${prop.price}₪/Months</p>
            <p>${prop.rooms} Rooms</p>
          </div>
          <button class="svg-action-btn favorite-btn" data-id="${prop.id}" title="Ajouter aux favoris">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 17V14H15V12H18V9H20V12H23V14H20V17H18ZM11 21L7.825 18.15C6.625 17.0667 5.596 16.1 4.738 15.25C3.87933 14.4 3.171 13.6 2.613 12.85C2.05433 12.1 1.646 11.375 1.388 10.675C1.12933 9.975 1 9.24167 1 8.475C1 6.90833 1.525 5.604 2.575 4.562C3.625 3.52067 4.93333 3 6.5 3C7.36667 3 8.19167 3.179 8.975 3.537C9.75833 3.89567 10.4333 4.40833 11 5.075C11.5667 4.40833 12.2417 3.89567 13.025 3.537C13.8083 3.179 14.6333 3 15.5 3C16.9167 3 18.104 3.429 19.062 4.287C20.0207 5.14567 20.6167 6.15 20.85 7.3C20.55 7.18333 20.25 7.09567 19.95 7.037C19.65 6.979 19.3583 6.95 19.075 6.95C17.3917 6.95 15.9583 7.53733 14.775 8.712C13.5917 9.88733 13 11.3167 13 13C13 13.8667 13.175 14.6873 13.525 15.462C13.875 16.2373 14.3667 16.9 15 17.45C14.6833 17.7333 14.2707 18.096 13.762 18.538C13.254 18.9793 12.8167 19.3667 12.45 19.7L11 21Z" 
            fill="${isFavorited ? "#2e86de" : "#B7B7B7"}"/>
          </svg>
          </button>
          <button class="svg-action-btn trash-btn" data-id="${prop.id}" title="Supprimer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
            <path d="M9 0L7.5 1.2H0V3.6H4.5H19.5H24V1.2H16.5L15 0H9ZM1.5 6V21.6C1.5 22.92 2.85 24 4.5 24H19.5C21.15 24 22.5 22.92 22.5 21.6V6H1.5Z"
              fill="#0021F5"/>
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
        e.stopPropagation(); // Empêche d’ouvrir la page de détails
        const svgPath = e.currentTarget.querySelector("path");
        const isFavorited = svgPath.getAttribute("fill") === "#2e86de"; // bleu
        const propertyId = prop.id;
      
        try {
          if (isFavorited) {
            // ❌ Retirer des favoris
            await fetch(`http://127.0.0.1:5050/api/properties-available/favorites/remove`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, property_id: propertyId }),
            });
            svgPath.setAttribute("fill", "#B7B7B7"); // gris
          } else {
            // ✅ Ajouter aux favoris
            await fetch(`http://127.0.0.1:5050/api/properties-available/favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, property_id: propertyId }),
            });
            svgPath.setAttribute("fill", "#2e86de"); // bleu
          }
        } catch (err) {
          console.error("❌ Erreur lors du changement de favoris :", err);
        }
      }); 
      card.querySelector(".trash-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        const propertyId = prop.id;

        try {
          await fetch(`http://127.0.0.1:5050/api/properties-available/available/remove`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, property_id: propertyId }),
          });

          card.remove(); // supprime du DOM
        } catch (err) {
          console.error("❌ Erreur suppression propriété :", err);
        }
      });
    });

  }    
     catch (err) {
    console.error("❌ Erreur lors du chargement des propriétés :", err);
    container.innerHTML = "<p>Erreur lors du chargement des appartements.</p>";
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.classList.add("visible");
    }, 100);
  
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 500);
    }, 2500);
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
