document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("edit-profile-form");
  const userId = localStorage.getItem("user_id");
  const photoPreview = document.getElementById("photo-preview");
  const photoInput = document.getElementById("photo-input");
  
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Access Denied",
        text: "You must be logged in to access this page.",
        confirmButtonText: "Go to Login"
      }).then(() => {
        window.location.href = "login.html";
      });
      return;
    }
    

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/profil_users/${userId}`);
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
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Unable to load profile.",
      confirmButtonText: "OK"
    });
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

    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save these changes to your profile?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, save it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        const formData = new FormData(form);


    try {
      const updateRes = await fetch(`https://roommate-1.onrender.com/api/profil_users/${userId}`, {
        method: "PUT",
        body: formData
      });

      if (updateRes.ok) {    
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile information has been successfully saved.",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.href = "profil.html";
      });
      } else {
        const errorText = await updateRes.text();
        console.error(" Server error:", errorText);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "An error occurred while updating your profile.",
          confirmButtonText: "Try Again"
        });
      }
    } catch (err) {
      console.error(" Network error:", err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Unable to reach the server. Please check your connection.",
        confirmButtonText: "OK"
      });
    }
  }
  });
});
});
