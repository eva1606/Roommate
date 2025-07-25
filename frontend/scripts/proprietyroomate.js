document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("No property ID provided.");
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties/${id}`);
    if (!res.ok) throw new Error("Property not found");

    const property = await res.json();

    // 🏠 Affichage des informations principales
    document.getElementById("property-address").textContent = property.address;
    document.getElementById("main-photo").src = property.photo;

    document.getElementById("property-description").innerHTML = `
      <p><strong>Price:</strong> ${property.price} shekels</p>
      <p><strong>Rooms:</strong> ${property.rooms}</p>
      <p><strong>Floor:</strong> ${property.floor ?? "N/A"}</p>
      <p><strong>Description:</strong> ${property.description || "No description available"}</p>
    `;

    document.getElementById("property-features").innerHTML = `
      <p>Elevator: ${property.has_elevator ? '✅' : '❌'}</p>
      <p>Balcony: ${property.has_balcony ? '✅' : '❌'}</p>
      <p>Furnished: ${property.furnished ? '✅' : '❌'}</p>
    `;

    // 🖼️ Galerie
    const gallery = document.getElementById("photo-gallery");
    if (Array.isArray(property.photos) && property.photos.length) {
      property.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.classList.add("gallery-photo");
        gallery.appendChild(img);
      });
    }

    // 📍 Géolocalisation et affichage carte
    const coords = await geocodeAddress(property.address);
    const map = L.map("map").setView([coords.lat, coords.lon], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(property.address)
      .openPopup();

    document.getElementById("mapBtn").addEventListener("click", () => {
      window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, "_blank");
    });

    // 📞 Contact owner logic
    const contactBtn = document.getElementById("contactOwnerBtn");
    const contactDiv = document.getElementById("ownerContactInfo");

    if (contactBtn && contactDiv) {
      contactBtn.addEventListener("click", async () => {
        try {
          const ownerRes = await fetch(`http://127.0.0.1:5050/api/properties/${property.id}/owner-phone`);
          if (!ownerRes.ok) throw new Error("Owner phone not found");

          const ownerData = await ownerRes.json();

          contactDiv.innerHTML = `
            <p><strong>Phone:</strong> <a href="tel:${ownerData.phone}">${ownerData.phone}</a></p>
          `;
          contactDiv.classList.remove("hidden");

          // 📞 Appelle directement le propriétaire
          window.location.href = `tel:${ownerData.phone}`;
        } catch (e) {
          contactDiv.innerHTML = "<p>❌ Could not load owner phone number.</p>";
          contactDiv.classList.remove("hidden");
        }
      });
    }

  } catch (err) {
    console.error("❌ Failed to load property:", err);
    document.getElementById("map").innerHTML = "<p>📍 Localisation non disponible</p>";
    alert("Failed to load property.");
  }
}); // 👈 fermeture manquante ajoutée ici

// 🔍 Fonction de géocodage sans API key (OpenStreetMap via Nominatim)
async function geocodeAddress(address) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const data = await res.json();
  if (!data || !data.length) throw new Error("Adresse non localisée");
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}
