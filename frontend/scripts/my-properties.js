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
        const allPaid = prop.roommate_count > 0 && Number(prop.paid_count) >= Number(prop.roommate_count);
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
          const result = await Swal.fire({
            title: 'Are you sure?',
            text: "This will permanently delete the property.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#004AAD',
            cancelButtonColor: '#aaa',
            confirmButtonText: 'Yes, delete it!'
          });
  
          if (result.isConfirmed) {
            const res = await fetch(`http://localhost:5050/api/properties/${prop.id}`, {
                method: 'DELETE'
              });
              if (res.ok) {
                card.remove();
                Swal.fire({
                  icon: 'success',
                  title: 'Deleted!',
                  text: 'The property has been deleted.',
                  confirmButtonColor: '#004AAD'
                });
              } else {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to delete the property.',
                });
              }
            }
          });
        container.appendChild(card);
      });
    } catch (err) {
      console.error("Failed to load properties:", err);
      container.innerHTML = "Error loading properties.";
      Swal.fire({
        icon: 'error',
        title: 'Error loading',
        text: 'Something went wrong while loading your properties.',
      });
    }
  }
  document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
