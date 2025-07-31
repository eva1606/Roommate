document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  const role = localStorage.getItem("role");

  if (!userId || role !== "roommate") {
    Swal.fire({
      icon: "error",
      title: "Unauthorized Access",
      text: "Please log in again to access this page.",
      confirmButtonText: "OK"
    }).then(() => {
      window.location.href = "index.html";
    });
    return;
  }
  

  const tabApartments = document.getElementById("tab-apartments");
  const tabRoommates = document.getElementById("tab-roommates");
  const apartmentsSection = document.getElementById("apartments-section");
  const roommatesSection = document.getElementById("roommates-section");
  const filterOverlay = document.getElementById("filterOverlay");
  const filterTitle = document.getElementById("filterTitle");

  const sortBtn = document.getElementById("sortBtn");
  const sortMenuApartments = document.getElementById("sortMenuApartments");
  const sortMenuRoommates = document.getElementById("sortMenuRoommates");
  const filterBtn = document.getElementById("filterBtn");

  document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.remove("hidden");
  });
  document.getElementById("closeMenu")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
  });
  const searchInput = document.querySelector(".search-input");
  searchInput?.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll(".property-card, .roommate-card");
    cards.forEach((card) => {
      const text = card.getAttribute("data-search")?.toLowerCase() || "";
      card.classList.toggle("hidden-card", !text.includes(query));
    });
  });

  tabApartments?.addEventListener("click", () => {
    tabApartments.classList.add("active");
    tabRoommates.classList.remove("active");
    apartmentsSection.classList.add("active");
    roommatesSection.classList.remove("active");
    document.getElementById("filters-apartments").classList.remove("hidden");
    document.getElementById("filters-roommates").classList.add("hidden");
    if (filterTitle) filterTitle.textContent = "Filter Apartments";
  });

  tabRoommates?.addEventListener("click", () => {
    tabRoommates.classList.add("active");
    tabApartments.classList.remove("active");
    roommatesSection.classList.add("active");
    apartmentsSection.classList.remove("active");
    document.getElementById("filters-apartments").classList.add("hidden");
    document.getElementById("filters-roommates").classList.remove("hidden");
    fetchRoommates();
    if (filterTitle) filterTitle.textContent = "Filter Roommates";
  });

  filterBtn?.addEventListener("click", () => {
    filterOverlay.classList.toggle("hidden");
    sortMenuApartments?.classList.add("hidden");
    sortMenuRoommates?.classList.add("hidden");
  });

  document.getElementById("closeFilter")?.addEventListener("click", () => {
    filterOverlay.classList.add("hidden");
  });

  sortBtn?.addEventListener("click", () => {
    const isApartmentsTab = tabApartments.classList.contains("active");
  
    if (isApartmentsTab) {
      const isVisible = !sortMenuApartments.classList.contains("hidden");
      sortMenuApartments.classList.toggle("hidden", isVisible);
      sortMenuRoommates.classList.add("hidden");
    } else {
      const isVisible = !sortMenuRoommates.classList.contains("hidden");
      sortMenuRoommates.classList.toggle("hidden", isVisible);
      sortMenuApartments.classList.add("hidden");
    }
  });

  sortMenuApartments?.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      const sortType = item.dataset.sort;
      const cards = Array.from(document.querySelectorAll("#apartment-available .property-card"));

      cards.sort((a, b) => {
        const priceA = parseInt(a.dataset.price || "0");
        const priceB = parseInt(b.dataset.price || "0");
        const dateA = new Date(a.dataset.date || "2000-01-01");
        const dateB = new Date(b.dataset.date || "2000-01-01");

        if (sortType === "price-high") return priceB - priceA;
        if (sortType === "price-low") return priceA - priceB;
        if (sortType === "recent") return dateB - dateA;
        return 0;
      });

      const container = document.getElementById("apartment-available");
      container.innerHTML = "";
      cards.forEach(card => container.appendChild(card));
      sortMenuApartments.classList.add("hidden");
    });
  });

  sortMenuRoommates?.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      const criterion = item.textContent.trim();
      const cards = Array.from(document.querySelectorAll("#roommate-properties .roommate-card"));

      cards.sort((a, b) => {
        if (criterion.includes("Budget")) return a.dataset.budget - b.dataset.budget;
        if (criterion.includes("Location")) return a.dataset.location.localeCompare(b.dataset.location);
        if (criterion.includes("Name")) return a.dataset.name.localeCompare(b.dataset.name);
        return 0;
      });

      const container = document.getElementById("roommate-properties");
      container.innerHTML = "";
      cards.forEach(card => container.appendChild(card));
      sortMenuRoommates.classList.add("hidden");
    });
  });

  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
  
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        Swal.fire({
          icon: "success",
          title: "Logged Out",
          text: "You have been successfully logged out.",
          confirmButtonText: "OK"
        }).then(() => {
          window.location.href = "index.html";
        });
      }
    });
  });

  document.getElementById("applyFilterApt")?.addEventListener("click", () => {
    const loc = document.getElementById("aptLocation").value.toLowerCase();
    const budget = parseInt(document.getElementById("aptBudget").value);
    const rooms = parseInt(document.getElementById("aptRooms").value);

    document.querySelectorAll("#apartment-available .property-card").forEach(card => {
      const cardLoc = card.dataset.location?.toLowerCase() || "";
      const cardBudget = parseInt(card.dataset.budget || "0");
      const cardRooms = parseInt(card.dataset.rooms || "0");

      const show = (loc === "all" || cardLoc.includes(loc)) &&
                   (isNaN(budget) || cardBudget <= budget) &&
                   (isNaN(rooms) || cardRooms >= rooms);

      card.style.display = show ? "flex" : "none";
    });
    filterOverlay.classList.add("hidden");
  });

  document.getElementById("applyFilterRoommates")?.addEventListener("click", () => {
    const loc = document.getElementById("rmLocation").value.toLowerCase();
    const budget = parseInt(document.getElementById("rmBudget").value);
    const name = document.getElementById("rmName").value.toLowerCase();

    document.querySelectorAll("#roommate-properties .roommate-card").forEach(card => {
      const cardLoc = card.dataset.location?.toLowerCase() || "";
      const cardBudget = parseInt(card.dataset.budget || "0");
      const cardName = card.dataset.name?.toLowerCase() || "";

      const show = (loc === "all" || cardLoc.includes(loc)) &&
                   (isNaN(budget) || cardBudget <= budget) &&
                   (!name || cardName.includes(name));

      card.style.display = show ? "flex" : "none";
    });
    filterOverlay.classList.add("hidden");
  });

  document.addEventListener("click", (event) => {
    if (!sortBtn.contains(event.target)) {
      sortMenuApartments?.classList.add("hidden");
      sortMenuRoommates?.classList.add("hidden");
    }
    if (!filterBtn.contains(event.target) && !filterOverlay.contains(event.target)) {
      filterOverlay.classList.add("hidden");
    }
  });

  fetchProperties();
});

async function fetchProperties() {
  const userId = localStorage.getItem("user_id");
  const container = document.getElementById("apartment-available");
  container.innerHTML = "";

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/properties-available/filtered/${userId}`);
    const properties = await res.json();

    if (!Array.isArray(properties) || properties.length === 0) {
      container.innerHTML = "<p>No available apartments found.</p>";
      return;
    }

    properties.forEach((prop, index) => {
      const card = document.createElement("div");
      card.classList.add("property-card");
      card.setAttribute("data-search", `${prop.address} ${prop.rooms} ${prop.price}`.toLowerCase());
      card.setAttribute("data-price", prop.price);
      card.setAttribute("data-date", prop.created_at || "2025-01-01");
      card.setAttribute("data-location", prop.address || "");
      card.setAttribute("data-rooms", prop.rooms || "");
      card.setAttribute("data-budget", prop.price);

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
          <button class="svg-action-btn favorite-btn" data-id="${prop.id}" title="Add To favorites">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 17V14H15V12H18V9H20V12H23V14H20V17H18ZM11 21L7.825 18.15C6.625 17.0667 5.596 16.1 4.738 15.25C3.87933 14.4 3.171 13.6 2.613 12.85C2.05433 12.1 1.646 11.375 1.388 10.675C1.12933 9.975 1 9.24167 1 8.475C1 6.90833 1.525 5.604 2.575 4.562C3.625 3.52067 4.93333 3 6.5 3C7.36667 3 8.19167 3.179 8.975 3.537C9.75833 3.89567 10.4333 4.40833 11 5.075C11.5667 4.40833 12.2417 3.89567 13.025 3.537C13.8083 3.179 14.6333 3 15.5 3C16.9167 3 18.104 3.429 19.062 4.287C20.0207 5.14567 20.6167 6.15 20.85 7.3C20.55 7.18333 20.25 7.09567 19.95 7.037C19.65 6.979 19.3583 6.95 19.075 6.95C17.3917 6.95 15.9583 7.53733 14.775 8.712C13.5917 9.88733 13 11.3167 13 13C13 13.8667 13.175 14.6873 13.525 15.462C13.875 16.2373 14.3667 16.9 15 17.45C14.6833 17.7333 14.2707 18.096 13.762 18.538C13.254 18.9793 12.8167 19.3667 12.45 19.7L11 21Z"
                fill="${isFavorited ? "#2e86de" : "#B7B7B7"}"/>
            </svg>
          </button>
          <button class="svg-action-btn trash-btn" data-id="${prop.id}" title="Delete">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_2063_4)">
                <path d="M12 38C12 40.2 13.8 42 16 42H32C34.2 42 36 40.2 36 38V14H12V38ZM38 8H31L29 6H19L17 8H10V12H38V8Z" fill="#004AAD"/>
              </g>
              <defs>
                <clipPath id="clip0_2063_4">
                  <rect width="48" height="48" fill="white"/>
                </clipPath>
              </defs>
            </svg>          
          </button>
        </div>
      `;

      // ▶️ Ouvrir la fiche
      card.addEventListener("click", () => {
        window.location.href = `proprietyroomate.html?id=${prop.id}`;
      });

      container.appendChild(card);

    
      card.querySelector(".favorite-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        const svgPath = e.currentTarget.querySelector("path");
        const isFavorited = svgPath.getAttribute("fill") === "#2e86de";
        const propertyId = prop.id;

        try {
          if (isFavorited) {
            await fetch(`https://roommate-1.onrender.com/api/properties-available/favorites/remove`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, property_id: propertyId }),
            });
            svgPath.setAttribute("fill", "#B7B7B7");
          } else {
            await fetch(`https://roommate-1.onrender.com/api/properties-available/favorites`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ user_id: userId, property_id: propertyId }),
            });
            svgPath.setAttribute("fill", "#2e86de");
          }
        } catch (err) {
          console.error("Error changing favorites:", err);
        }
      });

     
      card.querySelector(".trash-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        const propertyId = prop.id;

        Swal.fire({
          title: "Are you sure?",
          text: "This apartment will be removed from the list.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it",
          cancelButtonText: "Cancel"
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              const response = await fetch(`https://roommate-1.onrender.com/api/properties-available/hidden`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: userId, property_id: propertyId }),
              });

              if (response.ok) {
                card.remove();
                Swal.fire({
                  icon: "success",
                  title: "Deleted!",
                  text: "The property has been successfully removed.",
                  confirmButtonText: "OK"
                });
              } else {
                const errorMsg = await response.text();
                console.error("Server error:", errorMsg);
                Swal.fire({
                  icon: "error",
                  title: "Error",
                  text: "Unable to delete the property.",
                  confirmButtonText: "OK"
                });
              }
            } catch (err) {
              console.error("Error deleting property:", err);
              Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Could not connect to the server. Please try again later.",
                confirmButtonText: "OK"
              });
            }
          }
        });
      });
    });

  } catch (err) {
    console.error("Error loading properties:", err);
    container.innerHTML = "<p>Error loading apartments.</p>";
  }
}
  async function fetchRoommates() {
    const userId = localStorage.getItem("user_id");
    const container = document.getElementById("roommate-properties");
    container.innerHTML = "";
  
    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/potential-roommates/${userId}`);
      const roommates = await res.json();
  
      if (!Array.isArray(roommates) || roommates.length === 0) {
        container.innerHTML = "<p>No potential roommates found.</p>";
        return;
      }
  
      const uniqueMap = new Map();
      roommates.forEach((rm) => uniqueMap.set(rm.id, rm));
  
      uniqueMap.forEach((roommate) => {
        const heartColor = roommate.is_favorited ? "#0021F5" : "#F5F5F5";
  
        const card = document.createElement("div");
        card.classList.add("roommate-card");
  

        card.setAttribute(
          "data-search",
          `${roommate.first_name} ${roommate.last_name} ${roommate.location} ${roommate.budget}`.toLowerCase()
        );
        card.setAttribute("data-budget", roommate.budget || "0");
        card.setAttribute("data-name", `${roommate.first_name} ${roommate.last_name}`);
        card.setAttribute("data-location", roommate.location || "");
  
        card.innerHTML = `
          <div class="roommate-left">
            <img src="${roommate.photo_url || 'default-avatar.jpg'}" class="roommate-photo" />
            <div class="roommate-info">
              <h3>${roommate.first_name} ${roommate.last_name}</h3>
              <p>   
              <img src="icons/Location.svg" alt="Location" width="16" height="16" style="vertical-align: middle; margin-right: 6px;" />
              ${roommate.location}
              </p>
              <p> <img src="icons/money.svg" alt="Budget"width="16" height="16" style="vertical-align: middle; margin-right: 6px;"  />
              ${roommate.budget} ₪/Months</p>
            </div>
          </div>
          <div class="roommate-actions">
            <button class="heart-btn" data-id="${roommate.id}" title="Add to favorites">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="${heartColor}" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                         2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                         C13.09 3.81 14.76 3 16.5 3
                         19.58 3 22 5.42 22 8.5
                         c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
        `;
  
        const heartBtn = card.querySelector(".heart-btn");
        const svg = heartBtn.querySelector("svg");
        
        heartBtn.addEventListener("click", async (e) => {
          e.stopPropagation(); // ✅ maintenant défini
        
          const profilUserId = roommate.id;
          const is_favorited = svg.getAttribute("fill") === "#EB3223";
        
          try {
            if (is_favorited) {
              const res = await fetch("https://roommate-1.onrender.com/api/potential-roommates/remove-favorite", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, profilUserId }),
              });
              if (res.ok) svg.setAttribute("fill", "#F5F5F5");
            } else {
              const res = await fetch("https://roommate-1.onrender.com/api/potential-roommates/add-favorite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, profilUserId }),
              });
              if (res.ok) svg.setAttribute("fill", "#EB3223");
            }
          } catch (err) {
            console.error("Favorite error:", err);
          }
        });
        card.addEventListener("click", () => {
          window.location.href = `detailsroomate.html?id=${roommate.id}`;
        });
  
        container.appendChild(card);
      });
    } catch (err) {
      console.error(" Roommates recovery error:", err);
      container.innerHTML = "<p>error loading roommates.</p>";
    }
  }  


