document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
  });
  
  async function loadProperties() {
    const userId = localStorage.getItem('user_id');
    const container = document.getElementById('propertiesContainer');
  
    if (!userId) {
      console.error("❌ No user_id in localStorage");
      container.innerHTML = "No user ID found.";
      return;
    }
  
    console.log("📦 Owner user_id:", userId);
    container.innerHTML = "Loading...";
  
    try {
      const res = await fetch(`http://localhost:5050/api/properties/rented/${userId}`);
      const properties = await res.json();
  
      container.innerHTML = "";
  
      if (!properties.length) {
        container.innerHTML = "No rented properties found.";
        return;
      }
  
      properties.forEach(prop => {
        const allPaid = Number(prop.paid_count) >= Number(prop.roommate_count);
        const paymentText = allPaid ? `✅ Paid in full` : '❌ Unpaid';
  
        const card = document.createElement('div');
        card.classList.add('roommate-property-card');
  
        card.innerHTML = `
          <h3>${prop.address}</h3>
          <p>🧍‍♂️ Occupied (${prop.roommate_count} roommates)</p>
          <p>${paymentText}</p>
          <button onclick="window.location.href='shared-documents.html?property_id=${prop.id}'">View shared documents</button>
          <button onclick="window.location.href='contact-roommates.html?property_id=${prop.id}'">Contact roommates</button>
          <button class="delete-btn">Delete</button>
        `;
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          const confirmDelete = confirm("Are you sure you want to delete this property?");
          if (confirmDelete) {
            const res = await fetch(`http://localhost:5050/api/properties/${prop.id}`, {
                method: 'DELETE'
              });
            if (res.ok) {
              alert("Property deleted.");
              card.remove();
            } else {
              alert("Error deleting property.");
            }
          }
        });
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Failed to load properties:", err);
      container.innerHTML = "Error loading properties.";
    }
  }
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });