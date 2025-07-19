document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editForm");
  const roommatesSection = document.getElementById("roommatesSection"); // 👈 correspond à ton bloc HTML
  const statusSelect = form.querySelector('select[name="status"]');
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  console.log("📦 Editing property ID:", id);

  if (!id) return alert("No property ID provided");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/properties/${id}`);
    if (!res.ok) throw new Error("Failed to fetch property");
    const data = await res.json();

    form.querySelector('input[name="address"]').value = data.address || "";
    form.querySelector('input[name="rooms"]').value = data.rooms || "";
    form.querySelector('input[name="price"]').value = data.price || "";
    statusSelect.value = data.status || "available";

   if (data.status === "rented") {
     roommatesSection.style.display = "block";
   } else {
     roommatesSection.style.display = "none";
   }

    form.querySelector('input[name="floor"]').value = data.floor || "";
    form.querySelector('input[name="has_elevator"]').checked = data.has_elevator || false;
    form.querySelector('input[name="has_balcony"]').checked = data.has_balcony || false;
    form.querySelector('input[name="furnished"]').checked = data.furnished || false;
    form.querySelector('textarea[name="description"]').value = data.description || "";
  } catch (err) {
    console.error("❌ Error loading property:", err);
    alert("Failed to load property details.");
  }

  statusSelect.addEventListener("change", () => {
    if (statusSelect.value === "rented") {
      roommatesSection.style.display = "block";
    } else {
      roommatesSection.style.display = "none";
    }  
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    // ✅ On récupère les téléphones des colocataires si le statut est "rented"
let roommatePhones = [];
if (formData.get("status") === "rented") {
  roommatePhones = Array.from(
    form.querySelectorAll('input[name="roommate_phone[]"]')
  )
    .map(input => input.value.trim())
    .filter(phone => phone !== ""); // on enlève les champs vides
}

// ✅ On construit le body avec les données de la propriété + les colocataires
const body = {
  address: formData.get("address"),
  rooms: Number(formData.get("rooms")),
  price: Number(formData.get("price")),
  status: formData.get("status"),
  floor: formData.get("floor"),
  has_elevator: formData.get("has_elevator") === "on",
  has_balcony: formData.get("has_balcony") === "on",
  furnished: formData.get("furnished") === "on",
  description: formData.get("description"),
  roommates: roommatePhones  // 👈 ajout des téléphones
};

    try {
      const updateRes = await fetch(`http://127.0.0.1:5050/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (updateRes.ok) {
        alert("Property updated successfully!");
        if (formData.get("status") === "rented") {
          window.location.href = "my-properties.html";
        } else {
          window.location.href = "owner-dashboard.html";
        }        
      } else {
        const errorText = await updateRes.text();
        console.error("❌ Server error:", errorText);
        alert("Error updating property.");
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error during update.");
    }
  });
});
document.getElementById("addRoommateBtn").addEventListener("click", () => {
  const list = document.getElementById("roommates-list");
  const div = document.createElement("div");
  div.classList.add("roommate-entry");
  div.innerHTML = `
    <input type="text" name="roommate_name[]" placeholder="Full Name" />
    <input type="tel" name="roommate_phone[]" placeholder="Phone Number" />
  `;
  list.appendChild(div);
});



  