// 🔐 Authentification et vérification de rôle
const userId = localStorage.getItem('user_id');
const firstName = localStorage.getItem('first_name');
const role = localStorage.getItem('role');

if (!userId || role !== 'roommate') {
  alert("Accès non autorisé. Veuillez vous reconnecter.");
  window.location.href = 'login.html';
}


// 🧭 Initialisation du menu, des tabs et des événements globaux
document.addEventListener("DOMContentLoaded", () => {
  // 🎛️ MENU BURGER
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const menuOverlay = document.getElementById('menuOverlay');
  const closeMenu = document.getElementById('closeMenu');

  hamburgerBtn?.addEventListener('click', () => {
    menuOverlay.classList.remove('hidden');
  });

  closeMenu?.addEventListener('click', () => {
    menuOverlay.classList.add('hidden');
  });

  // 🧩 Onglets
  const tabApartments = document.getElementById("tab-apartments");
  const tabRoommates = document.getElementById("tab-roommates");
  const apartmentsSection = document.getElementById("apartments-section");
  const roommatesSection = document.getElementById("roommates-section");

  const sortBtn = document.getElementById('sortBtn');
  const sortMenuApartments = document.getElementById('sortMenuApartments');
  const sortMenuRoommates = document.getElementById('sortMenuRoommates');

  function hideAllSortMenus() {
    sortMenuApartments.classList.add('hidden');
    sortMenuRoommates.classList.add('hidden');
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

  sortBtn?.addEventListener('click', () => {
    const isApartmentTab = tabApartments.classList.contains('active');
    hideAllSortMenus();
    if (isApartmentTab) {
      sortMenuApartments.classList.toggle('hidden');
    } else {
      sortMenuRoommates.classList.toggle('hidden');
    }
  });

  document.addEventListener('click', (e) => {
    const isSortButton = sortBtn?.contains(e.target);
    const isSortMenu = sortMenuApartments?.contains(e.target) || sortMenuRoommates?.contains(e.target);
    if (!isSortButton && !isSortMenu) hideAllSortMenus();
  });
});

// 🧪 Filtres
const filterBtn = document.getElementById('filterBtn');
const filterOverlay = document.getElementById('filterOverlay');
const closeFilter = document.getElementById('closeFilter');

filterBtn?.addEventListener('click', () => {
  filterOverlay?.classList.remove('hidden');
  filterOverlay?.classList.add('show');
});

closeFilter?.addEventListener('click', () => {
  filterOverlay?.classList.remove('show');
  filterOverlay?.classList.add('hidden');
});
async function fetchProperties() {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    alert("Vous devez être connecté");
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties-available/filtered/${userId}`);
    const properties = await res.json();
    const container = document.getElementById("apartment-available");
    container.innerHTML = '';

    if (!Array.isArray(properties) || properties.length === 0) {
      container.innerHTML = "<p>No matching apartments found.</p>";
      return;
    }

    // 👇 Enregistre en BDD les propriétés affichées
    const propertyIds = properties.map(p => p.id);
    await fetch(`http://127.0.0.1:5050/api/properties-available/save/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ properties: propertyIds })
    });

    // 👇 Affichage des cartes
    properties.forEach(prop => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute('data-search', `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());
      card.innerHTML = `
        <img src="${prop.photo}" class="property-photo" />
        <div class="card-body">
          <h3>${prop.address}</h3>
          <p>${prop.rooms} rooms - ${prop.price} sh</p>
          <p>Status: ${prop.status}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        window.location.href = `proprietyroomate.html?id=${prop.id}`;
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Failed to fetch properties:", err);
  }
}
// 🔁 Mise à jour régulière
document.addEventListener("DOMContentLoaded", () => {
  fetchProperties();
  setInterval(fetchProperties, 10000);
});

// 🔍 Barre de recherche dynamique (appartements + roommates)
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.querySelector('.search-input');

  searchInput?.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();

    const apartmentCards = document.querySelectorAll('#apartment-available .property-card');
    apartmentCards.forEach(card => {
      const text = card.getAttribute('data-search') || '';
      card.style.display = text.includes(query) ? 'block' : 'none';
    });

    const roommateCards = document.querySelectorAll('#roommate-properties .property-card');
    roommateCards.forEach(card => {
      const text = card.getAttribute('data-search') || '';
      card.style.display = text.includes(query) ? 'block' : 'none';
    });
  });
});
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
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();

    // Supprime les données de session/localStorage
    localStorage.removeItem("user_id"); // ou localStorage.clear() si tu veux tout vider

    // Redirige vers la page de login
    window.location.href = "login.html";
  });
});
