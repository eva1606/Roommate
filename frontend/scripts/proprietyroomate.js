document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    Swal.fire({
      icon: "error",
      title: "Missing Property ID",
      text: "No property ID provided. Please try again.",
      confirmButtonText: "OK"
    });
    return;
  }

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/properties/${id}`);
    if (!res.ok) throw new Error("Property not found");

    const property = await res.json();

   
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

   
    const gallery = document.getElementById("photo-gallery");
    if (Array.isArray(property.photos) && property.photos.length) {
      property.photos.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        img.classList.add("gallery-photo");
        gallery.appendChild(img);
      });
    }

   
    const coords = await geocodeAddress(property.address);
    const map = L.map("map").setView([coords.lat, coords.lon], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker([coords.lat, coords.lon])
      .addTo(map)
      .bindPopup(property.address)
      .openPopup();

    
    function confirmOpenMaps() {
      Swal.fire({
        title: "Open Google Maps?",
        text: "Do you want to view this location on Google Maps?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, open it",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lon}`, "_blank");
        }
      });
    }

    document.getElementById("mapBtn").addEventListener("click", confirmOpenMaps);
    map.on("click", confirmOpenMaps);

    
    const contactBtn = document.getElementById("contactOwnerBtn");
    const contactDiv = document.getElementById("ownerContactInfo");

    if (contactBtn && contactDiv) {
      contactBtn.addEventListener("click", async () => {
        try {
          const ownerRes = await fetch(`https://roommate-1.onrender.com/api/properties/${property.id}/owner-phone`);
          if (!ownerRes.ok) throw new Error("Owner phone not found");

          const ownerData = await ownerRes.json();

          Swal.fire({
            title: "Do you want to contact this person?",
            text: "Click 'Yes' to view the phone number and start a call.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "No"
          }).then((result) => {
            if (result.isConfirmed) {
              contactDiv.innerHTML = `
                <p><strong>Phone:</strong> <a href="tel:${ownerData.phone}">${ownerData.phone}</a></p>
              `;
              contactDiv.classList.remove("hidden");

              Swal.fire({
                icon: "info",
                title: "Contact Owner",
                html: `You can call the owner at: <br><strong>${ownerData.phone}</strong>`,
                confirmButtonText: "Call Now"
              }).then(() => {
                window.location.href = `tel:${ownerData.phone}`;
              });
            }
          });
        } catch (e) {
          contactDiv.classList.remove("hidden");
          Swal.fire({
            icon: "error",
            title: "Phone Number Unavailable",
            text: "Could not load the owner's phone number. Please try again later.",
            confirmButtonText: "OK"
          });
        }
      });
    }
  } catch (err) {
    console.error("❌ Failed to load property:", err);
    document.getElementById("map").innerHTML = "<p>📍 Location not available</p>";

    Swal.fire({
      icon: "error",
      title: "Property Load Failed",
      text: "We couldn't load this property. Please try again later.",
      confirmButtonText: "OK"
    });
  }
});

async function geocodeAddress(address) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
  const data = await res.json();
  if (!data || !data.length) throw new Error("Address not found");
  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}
