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
  // Fonction pour charger et afficher dynamiquement les propriétés disponibles
async function loadAvailableApartments() {
    try {
      const res = await fetch('http://127.0.0.1:5500/api/available-properties');
      const properties = await res.json();
  
      const container = document.getElementById('apartment-list-container');
      container.innerHTML = ''; // Nettoyer avant de recharger
  
      properties.forEach(property => {
        const image = property.main_photo || 'images/default.jpg';
  
        const card = document.createElement('div');
        card.className = 'apartment-card';
        card.innerHTML = `
          <div class="card-image">
            <img src="${image}" alt="Apartment image">
            <span class="tag-new">NEW</span>
          </div>
          <div class="card-content">
            <a href="#" class="card-address">${property.address}</a>
            <p class="card-price">${property.price}₪/perMonth</p>
            <p class="card-rooms">${property.rooms} Rooms</p>
            <div class="card-icons">
              <img src="icons/delete.svg" alt="Delete icon" class="icon" />
              <img src="icons/heart-add.svg" alt="Favorite icon" class="icon" />
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (err) {
      console.error('Erreur lors du chargement des appartements :', err);
    }
  }
  
  