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
  
  document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.remove("hidden");
  });
  document.getElementById("closeMenu")?.addEventListener("click", () => {
    document.getElementById("menuOverlay").classList.add("hidden");
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


  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      handleFilter(filter, userId);
    });
  });

  
  handleFilter("all", userId);
});

function handleFilter(filter, userId) {
  const propertyContainer = document.getElementById("property-container");
  const roommateContainer = document.getElementById("roommate-container");


  propertyContainer.innerHTML = "";
  roommateContainer.innerHTML = "";


  propertyContainer.style.display = (filter === "all" || filter === "apartment") ? "grid" : "none";
  roommateContainer.style.display = (filter === "all" || filter === "roommate") ? "flex" : "none";

  
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
    const res = await fetch(`https://roommate-1.onrender.com/api/properties-available/favorites/${userId}`);
    const favorites = await res.json();

    if (!Array.isArray(favorites) || favorites.length === 0) {
      container.innerHTML = "<p>No favorite apartments found.</p>";
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
    console.error("❌ Error loading properties:", err);
    container.innerHTML = "<p>Error while loading.</p>";
  }
}

async function fetchFavoriteRoommates(userId) {
  const container = document.getElementById("roommate-container");
  container.innerHTML = "";

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/potential-roommates/favorites/${userId}`);
    const roommates = await res.json();

    
    const unique = [];
    const seen = new Set();

    roommates.forEach(r => {
      if (!seen.has(r.id)) {
        seen.add(r.id);
        unique.push(r);
      }
    });

    if (unique.length === 0) {
      container.innerHTML = "<p>No favorite roommates found.</p>";
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
            <p>
              <img src="icons/location.svg" alt="Location icon" class="icon" />
              ${roommate.location}
            </p>
            <p>
              <img src="icons/money.svg" alt="Budget icon" class="icon" />
              ${roommate.budget} ₪/Month
            </p>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("❌ Error loading favorite roommates:", err);
    container.innerHTML = "<p>Error loading favorites.</p>";
  }
}

