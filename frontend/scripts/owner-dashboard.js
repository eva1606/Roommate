document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userName = localStorage.getItem("first_name") || "Owner";
    document.getElementById("welcome").textContent = `Hello, ${userName}`;

    const user_id = localStorage.getItem("user_id");

    if (!user_id || user_id === "null" || user_id === "undefined") {
      alert("❌ Erreur : Identifiant utilisateur manquant. Veuillez vous reconnecter.");
      throw new Error("userId invalide dans localStorage");
    }
        
    const res = await fetch(`http://localhost:5050/api/properties/available/${user_id}`);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error("Server error: " + errorText);
    }

    const properties = await res.json();
    console.log("📦 Loaded properties:", properties);

    const list = document.getElementById("properties-list");

    properties.forEach(prop => {
      console.log("📄 Rendering property:", prop);

      const card = document.createElement("div");
      card.className = "property-card";
      card.setAttribute("data-id", prop.id);
      card.innerHTML = `
        <div class="card-header">
          <img src="${prop.photo}" alt="Property image" class="property-photo">
          <div class="toggle-container">
            <button class="toggle-btn" data-id="${prop.id}">
              <img src="icons/toogle.svg" alt="Menu">
            </button>
            <div class="toggle-menu hidden" id="menu-${prop.id}">
              <button class="edit-option" data-id="${prop.id}">Modify</button>
              <button class="delete-option" data-id="${prop.id}">Delete</button>
            </div>
          </div>
        </div>
        <div class="card-body">
          <h3><img src="icons/home.svg" alt="home icon" class="icon-home"> ${prop.address}</h3>
          <p>${prop.rooms} Rooms</p>
          <p><strong>${prop.price} sh per month</strong></p>
          <p class="status">${prop.status}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        if (prop.id) {
          window.location.href = `property-details.html?id=${prop.id}`;
        } else {
          alert("Missing property ID");
          console.warn("❌ prop.id is undefined:", prop);
        }
      });
      
      

      list.appendChild(card);
    });

    // Toggle menu
document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // ✅ empêche la redirection
    const id = btn.dataset.id;
    const menu = document.getElementById(`menu-${id}`);
    menu.classList.toggle("hidden");
  });
});

// Delete card
document.querySelectorAll(".delete-option").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.stopPropagation(); // ✅ empêche la redirection
    const id = btn.dataset.id;
    const confirmDelete = confirm("Are you sure you want to delete this property?");
    if (confirmDelete) {
      const res = await fetch(`http://localhost:5050/api/properties/${id}`, {
        method: 'DELETE'
});
      if (res.ok) {
        alert("Property deleted.");
        document.querySelector(`.property-card[data-id="${id}"]`)?.remove();
      } else {
        alert("Error deleting property.");
      }
    }
  });
});

// Edit card
document.querySelectorAll(".edit-option").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); // ✅ empêche la redirection
    const id = btn.dataset.id;
    window.location.href = `edit-property.html?id=${id}`;
  });
});


    // Clic hors menu → fermeture
    document.addEventListener("click", () => {
      document.querySelectorAll(".toggle-menu").forEach(menu => {
        menu.classList.add("hidden");
      });
    });

  } catch (error) {
    console.error("❌ Error loading properties:", error);
  }

  const currentPage = window.location.pathname.split("/").pop();
document.querySelectorAll(".footer-link").forEach(link => {
  if (link.getAttribute("href") === currentPage) {
    link.classList.add("active");
  }
});

});
