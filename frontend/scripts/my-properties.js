document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id') || 4; // valeur par défaut pour test
    console.log("👤 userId:", userId); // Pour vérif
  
    try {
        const res = await fetch(`http://localhost:5050/api/properties/rented/${userId}`);
        const properties = await res.json();
      console.log("📦 Properties from API:", properties);
  
      const container = document.getElementById('propertiesContainer');
      container.innerHTML = "";
  
      properties.forEach(prop => {
        const paymentText = prop.payment_status === 'paid'
          ? '✅ Paid in full (June)'
          : '❌ Unpaid';
  
        const card = document.createElement('div');
        card.classList.add('roommate-property-card');
  
        card.innerHTML = `
          <h3>${prop.address}</h3>
          <p>🧍‍♂️ Occupied (${prop.roommate_count} roommates)</p>
          <p>${paymentText}</p>
          <p>⚠️ Issues reported</p>
          <button onclick="window.location.href='shared-documents.html?property_id=${prop.property_id}'">View shared documents</button>
          <button onclick="window.location.href='contact-roommates.html?property_id=${prop.property_id}'">Contact roommates</button>
        `;
  
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Failed to load properties:", err);
    }
  });
  