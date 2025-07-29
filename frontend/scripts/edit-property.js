document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("editForm");
  const roommatesSection = document.getElementById("roommatesSection"); 
  const statusSelect = form.querySelector('select[name="status"]');
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  console.log("📦 Editing property ID:", id);

  if (!id) {
    Swal.fire({
      icon: 'error',
      title: 'Missing property ID',
      text: 'Please try again from the dashboard.',
    });
    return;
  }
  
  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/properties/${id}`);
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
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Failed to load property details.',
    });    
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
let roommatePhones = [];
if (formData.get("status") === "rented") {
  roommatePhones = Array.from(
    form.querySelectorAll('input[name="roommate_phone[]"]')
  )
    .map(input => input.value.trim())
    .filter(phone => phone !== ""); 
}

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
  roommates: roommatePhones  
};

    try {
      const updateRes = await fetch(`https://roommate-1.onrender.com/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      if (updateRes.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Property updated successfully.',
          confirmButtonColor: '#004AAD'
        }).then(() => {
          if (formData.get("status") === "rented") {
            window.location.href = "my-properties.html";
          } else {
            window.location.href = "owner-dashboard.html";
          }
        });
               
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: 'Server returned an error. Please check console.',
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Network error',
        text: 'Please check your connection or try again later.',
      });      
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



  