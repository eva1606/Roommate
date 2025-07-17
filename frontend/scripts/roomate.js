document.addEventListener("DOMContentLoaded", () => {
    // MENU BURGER
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenu = document.getElementById('closeMenu');
  
    hamburgerBtn.addEventListener('click', () => {
      menuOverlay.classList.remove('hidden');
    });
  
    closeMenu.addEventListener('click', () => {
      menuOverlay.classList.add('hidden');
    });
  
    // TABS LOGIQUE
    const tabApartments = document.getElementById("tab-apartments");
    const tabRoommates = document.getElementById("tab-roommates");
    const apartmentsSection = document.getElementById("apartments-section");
    const roommatesSection = document.getElementById("roommates-section");
  
    const sortMenuApartments = document.getElementById('sortMenuApartments');
    const sortMenuRoommates = document.getElementById('sortMenuRoommates');
    const sortBtn = document.getElementById('sortBtn');
  
    function hideAllSortMenus() {
      sortMenuApartments.classList.add('hidden');
      sortMenuRoommates.classList.add('hidden');
    }
  
    tabApartments.addEventListener("click", () => {
        tabApartments.classList.add("active");
        tabRoommates.classList.remove("active");
        apartmentsSection?.classList.add("active");
        roommatesSection?.classList.remove("active");
        hideAllSortMenus();
      
        // CHARGER les appartements
        loadAvailableApartments();
      });
  
    tabRoommates.addEventListener("click", () => {
      tabRoommates.classList.add("active");
      tabApartments.classList.remove("active");
      roommatesSection?.classList.add("active");
      apartmentsSection?.classList.remove("active");
      hideAllSortMenus(); // Fermer les menus sort
    });
  
    // Toggle Sort Menu
    sortBtn.addEventListener('click', () => {
      const isApartmentTab = tabApartments.classList.contains('active');
  
      if (isApartmentTab) {
        const isVisible = !sortMenuApartments.classList.contains('hidden');
        hideAllSortMenus();
        if (!isVisible) sortMenuApartments.classList.remove('hidden');
      } else {
        const isVisible = !sortMenuRoommates.classList.contains('hidden');
        hideAllSortMenus();
        if (!isVisible) sortMenuRoommates.classList.remove('hidden');
      }
    });
  
    // Optionnel : clique dehors ferme les menus
    document.addEventListener('click', (e) => {
      const isSortButton = sortBtn.contains(e.target);
      const isSortMenu = sortMenuApartments.contains(e.target) || sortMenuRoommates.contains(e.target);
      if (!isSortButton && !isSortMenu) {
        hideAllSortMenus();
      }
    });
  });
  const filterBtn = document.getElementById('filterBtn');
  const filterOverlay = document.getElementById('filterOverlay');
  const closeFilter = document.getElementById('closeFilter');
  
  filterBtn.addEventListener('click', () => {
    filterOverlay.classList.remove('hidden');
    filterOverlay.classList.add('show');
  });
  
  closeFilter.addEventListener('click', () => {
    filterOverlay.classList.remove('show');
    filterOverlay.classList.add('hidden');
  });
  async function fetchProperties() {
    try {
      const res = await fetch('http://127.0.0.1:5050/api/properties');
      const properties = await res.json();
      const container = document.getElementById("roommate-properties");
      container.innerHTML = ''; // vide les anciennes cards
  
      properties.forEach(prop => {
        const card = document.createElement("div");
        card.classList.add("property-card");
        card.innerHTML = `
          <img src="${prop.photo}" class="property-photo" />
          <div class="card-body">
            <h3>${prop.address}</h3>
            <p>${prop.rooms} rooms - ${prop.price} sh</p>
            <p>Status: ${prop.status}</p>
          </div>
        `;
        card.addEventListener("click", () => {
          window.location.href = `property-details.html?id=${prop.id}`;
        });
        container.appendChild(card);
      });
  
    } catch (err) {
      console.error("❌ Failed to fetch properties:", err);
    }
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    fetchProperties();
    setInterval(fetchProperties, 10000); // toutes les 10 sec
  });
  