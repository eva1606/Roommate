const urlParams = new URLSearchParams(window.location.search);
const propertyId = urlParams.get('id');

async function loadPropertyDetails() {
  try {
    const res = await fetch(`http://localhost:5050/api/properties/${propertyId}`);
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

document.addEventListener('DOMContentLoaded', loadPropertyDetails);
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
