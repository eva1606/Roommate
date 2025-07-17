document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editForm");
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
    form.querySelector('select[name="status"]').value = data.status || "available";
    form.querySelector('input[name="floor"]').value = data.floor || "";
    form.querySelector('input[name="has_elevator"]').checked = data.has_elevator || false;
    form.querySelector('input[name="has_balcony"]').checked = data.has_balcony || false;
    form.querySelector('input[name="furnished"]').checked = data.furnished || false;
    form.querySelector('textarea[name="description"]').value = data.description || "";
  } catch (err) {
    console.error("❌ Error loading property:", err);
    alert("Failed to load property details.");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const body = {
      address: formData.get("address"),
      rooms: Number(formData.get("rooms")),
      price: Number(formData.get("price")),
      status: formData.get("status"),
      floor: formData.get("floor"),
      has_elevator: formData.get("has_elevator") === "on",
      has_balcony: formData.get("has_balcony") === "on",
      furnished: formData.get("furnished") === "on",
      description: formData.get("description")
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
        window.location.href = "owner-dashboard.html";
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
