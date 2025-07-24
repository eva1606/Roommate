document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("favorite-properties");
    const userId = localStorage.getItem("user_id");
  
    if (!userId) {
      container.innerHTML = "<p>Vous devez être connecté.</p>";
      return;
    }
  
    try {
      const res = await fetch(`http://127.0.0.1:5050/api/properties/favorites/${userId}`);
      const favorites = await res.json();
  
      if (!Array.isArray(favorites) || favorites.length === 0) {
        container.innerHTML = "<p>Aucun favori trouvé.</p>";
        return;
      }
  
      container.innerHTML = ""; // Clear message
      favorites.forEach(prop => {
        const card = document.createElement("div");
        card.classList.add("property-card");
  
        card.innerHTML = `
          <img src="${prop.photo}" class="property-photo" />
          <div class="card-body">
            <h3>${prop.address}</h3>
            <p>${prop.rooms} rooms - ${prop.price}₪</p>
          </div>
        `;
  
        card.addEventListener("click", () => {
          window.location.href = `proprietyroomate.html?id=${prop.id}`;
        });
  
        container.appendChild(card);
      });
    } catch (err) {
      console.error("❌ Failed to fetch favorites:", err);
      container.innerHTML = "<p>Erreur lors du chargement des favoris.</p>";
    }
  });
  