const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

async function loadPropertyDetails() {
  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/properties/${propertyId}`);
    const property = await res.json();

    document.querySelector('.property-header').textContent = property.address;

    document.querySelector('.main-photo').src = property.photo;

    document.querySelector('.details').innerHTML = `
      <p><strong>Price:</strong> ${property.price} sh / month</p>
      <p><strong>Rooms:</strong> ${property.rooms}</p>
      <p><strong>Status:</strong> ${property.status}</p>
      <p><strong>Floor:</strong> ${property.floor}</p>
      <p><strong>Elevator:</strong> ${property.has_elevator ? "Yes" : "No"}</p>
      <p><strong>Balcony:</strong> ${property.has_balcony ? "Yes" : "No"}</p>
      <p><strong>Furnished:</strong> ${property.furnished ? "Yes" : "No"}</p>
      <div class="description"><strong>Description:</strong> ${property.description}</div>
    `;

    const gallery = document.querySelector('.gallery');
if (Array.isArray(property.photos)) {
  property.photos.forEach(photoUrl => {
    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = "Property image";
    img.classList.add("gallery-img");
    gallery.appendChild(img);
  });
}

  } catch (err) {
    console.error("❌ Failed to load property details:", err);
  }
}

document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
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
