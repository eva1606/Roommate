document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const roommateId = params.get('id');

  
  if (!roommateId) {
    Swal.fire({
      icon: "warning",
      title: "No Roommate Found",
      text: "No roommate ID was provided. Returning to dashboard.",
      confirmButtonText: "OK"
    }).then(() => {
      window.location.href = "roomate-dashboard.html";
    });
    return;
  }

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/potential-roommates/profil/${roommateId}`);
    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Profile Not Found",
        text: "The selected roommate profile could not be loaded.",
        confirmButtonText: "Go Back"
      }).then(() => {
        window.location.href = "roomate-dashboard.html";
      });
      return;
    }

    const user = await res.json();

    
    document.getElementById('roommate-photo').src = user.photo_url || 'default-avatar.jpg';
    document.getElementById('roommate-name').textContent = `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;
    document.getElementById('roommate-age').textContent = ` ${user.age} Years`;
    document.getElementById('roommate-location').textContent = ` ${user.location}`;
    document.getElementById('roommate-job').textContent = ` ${user.profession || 'Job inconnu'}`;
    document.getElementById('roommate-budget').textContent = ` ${user.budget}₪/Mo`;
    document.getElementById('roommate-rooms').textContent = ` ${user.rooms || '?'} Rooms`;
    document.getElementById('roommate-smoke').textContent = user.smoke ? ' Smoker' : ' Non Smoker';
    document.getElementById('roommate-pets').textContent = user.pets ? ' Pets Allowed' : ' No Pets';
    document.getElementById('roommate-food').textContent = user.diet || ' Not specified.';
    document.getElementById('roommate-description').textContent = user.bio || "No description provided.";

    
    const callBtn = document.getElementById("call-btn");

    if (callBtn && user.phone) {
      callBtn.href = `tel:${user.phone}`;
      callBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Swal.fire({
          icon: "question",
          title: "Contact Roommate?",
          html: `Do you want to call this roommate?<br><strong>${user.phone}</strong>`,
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, call now",
          cancelButtonText: "No, cancel"
        }).then((result) => {
          if (result.isConfirmed) {
            window.location.href = `tel:${user.phone}`;
          }
        });
      });
    
    } else if (callBtn) {
      callBtn.href = "#";
      callBtn.addEventListener("click", (e) => {
        e.preventDefault();
        Swal.fire({
          icon: "warning",
          title: "Number Unavailable",
          text: "This user has not shared their phone number.",
          confirmButtonText: "OK"
        });
      });
    
      callBtn.classList.add("disabled");
      callBtn.style.backgroundColor = "#ccc";
      callBtn.style.cursor = "not-allowed";
    }
    

  } catch (err) {
    console.error("❌ Error loading roommate:", err);
    Swal.fire({
      icon: "error",
      title: "Loading Error",
      text: "An unexpected error occurred while loading this profile. Returning to dashboard.",
      confirmButtonText: "OK"
    }).then(() => {
      window.location.href = "roomate-dashboard.html";
    });
  }
});


document.getElementById('closeBtn').addEventListener('click', () => {
  window.location.href = 'roomate-dashboard.html'; 
});
