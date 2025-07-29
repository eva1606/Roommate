document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userName = localStorage.getItem("first_name") || "Owner";
    document.getElementById("welcome").textContent = `Hello, ${userName}`;

    const user_id = localStorage.getItem("user_id");

    if (!user_id || user_id === "null" || user_id === "undefined") {
      alert("❌ Error: Missing user ID. Please log in again.");
      throw new Error("userId invalide in localStorage");
    }
        
    const res = await fetch(`https://roommate-1.onrender.com/api/properties/available/${user_id}`);

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
    e.stopPropagation(); 
    const id = btn.dataset.id;
    const menu = document.getElementById(`menu-${id}`);
    menu.classList.toggle("hidden");
  });
});

// Delete card
document.querySelectorAll(".delete-option").forEach(btn => {
  btn.addEventListener("click", async (e) => {
    e.stopPropagation(); 
    const id = btn.dataset.id;
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This property will be deleted permanently.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004AAD',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`https://roommate-1.onrender.com/api/properties/${id}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          Swal.fire(
            'Deleted!',
            'Your property has been removed.',
            'success'
          );
          document.querySelector(`.property-card[data-id="${id}"]`)?.remove();
        } else {
          Swal.fire(
            'Error!',
            'Failed to delete the property.',
            'error'
          );
        }
      } catch (err) {
        console.error("❌ Delete error:", err);
        Swal.fire(
          'Error!',
          'There was a problem connecting to the server.',
          'error'
        );
      }
    }
  });
});


// Edit card
document.querySelectorAll(".edit-option").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    const id = btn.dataset.id;
    window.location.href = `edit-property.html?id=${id}`;
  });
});


    document.addEventListener("click", () => {
      document.querySelectorAll(".toggle-menu").forEach(menu => {
        menu.classList.add("hidden");
      });
    });

  } catch (error) {
    console.error("❌ Error loading properties:", error);
  }

  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "login.html";
});

});
