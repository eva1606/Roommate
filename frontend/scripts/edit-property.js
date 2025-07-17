document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("editForm");
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    console.log("📦 Editing property ID:", id);
  
    if (!id) return alert("No property ID provided");
  
    try {
      // 🔄 1. Charger les données existantes
      const res = await fetch(`http://127.0.0.1:5050/api/properties/${id}`);
      if (!res.ok) throw new Error("Failed to fetch property");
      const data = await res.json();
  
      // Remplir les champs du formulaire
      form.querySelector('input[name="address"]').value = data.address || "";
      form.querySelector('input[name="rooms"]').value = data.rooms || "";
      form.querySelector('input[name="price"]').value = data.price || "";
      form.querySelector('select[name="status"]').value = data.status || "available";
  
    } catch (err) {
      console.error("❌ Error loading property:", err);
      alert("Failed to load property details.");
    }
  
    // 📝 2. Soumettre les modifications
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const body = {
        address: formData.get("address"),
        rooms: formData.get("rooms"),
        price: formData.get("price"),
        status: formData.get("status")
      };
  
      const res = await fetch(`http://127.0.0.1:5050/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
  
      if (res.ok) {
        alert("Property updated successfully!");
        window.location.href = "owner-dashboard.html";
      } else {
        alert("Error updating property.");
      }
    });
  });
  