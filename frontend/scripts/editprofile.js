document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("edit-profile-form");
  const userId = localStorage.getItem("user_id");
  const photoPreview = document.getElementById("photo-preview");
  const photoInput = document.getElementById("photo-input");

  if (!userId) {
    alert("You must be logged in.");
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`);
    if (!res.ok) throw new Error("Error loading profile");

    const data = await res.json();

    form.querySelector('input[name="first_name"]').value = data.first_name || "";
    form.querySelector('input[name="last_name"]').value = data.last_name || "";
    form.querySelector('input[name="email"]').value = data.email || "";
    form.querySelector('input[name="profession"]').value = data.profession || "";
    form.querySelector('input[name="location"]').value = data.location || ""; 
    form.querySelector('input[name="age"]').value = data.age || "";
    form.querySelector('input[name="budget"]').value = data.budget || "";
    form.querySelector('select[name="gender"]').value = data.gender || "";
    form.querySelector('select[name="looking_for"]').value = data.looking_for || "";
    form.querySelector('select[name="smoke"]').value = String(data.smoke);
    form.querySelector('select[name="pets"]').value = String(data.pets);

    if (data.photo_url) {
      photoPreview.src = data.photo_url;
      photoPreview.style.display = "block";
    }

  } catch (err) {
    console.error(" Error loading profile:", err);
    alert("Unable to load profile.");
  }

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      photoPreview.src = URL.createObjectURL(file);
      photoPreview.style.display = "block";
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);


    try {
      const updateRes = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`, {
        method: "PUT",
        body: formData
      });

      if (updateRes.ok) {
        alert("✅ Profile updated!");
        window.location.href = "profil.html";
      } else {
        const errorText = await updateRes.text();
        console.error(" Server error:", errorText);
        alert("Error updating profile.");
      }
    } catch (err) {
      console.error(" Network error:", err);
      alert("Network error during update.");
    }
  });
});
