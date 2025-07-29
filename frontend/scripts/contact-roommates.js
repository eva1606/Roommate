document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get("property_id");
    const userId = localStorage.getItem("user_id");
  
    const container = document.getElementById("roommatesContainer");
  
    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/properties/roommates/${propertyId}`);
      const roommates = await res.json();
  
      roommates.forEach(r => {
        const div = document.createElement("div");
        div.className = "roommate-card";
  
        div.innerHTML = `
          <div class="roommate-info">
            <img src="icons/Profile.svg" alt="Avatar"/>
            <h3>${r.first_name} ${r.last_name}</h3>
          </div>
          <div class="roommate-actions">
            <button class="message-btn">Message</button>
            <a href="tel:${r.phone}" class="call-link">Call</a>
          </div>
        `;
  
        container.appendChild(div);
      });
    } catch (err) {
      console.error("❌ Failed to load roommates:", err);
    }
  });document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  });

 
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
