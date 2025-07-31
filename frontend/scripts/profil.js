document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem("user_id");

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

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Profile Not Found",
        text: "We couldn't load your profile. Please try again or contact support.",
        confirmButtonText: "OK"
      });
      return;
    }
    

    const user = await res.json();

   
    const photoEl = document.getElementById('profile-photo');
    if (photoEl) {
      photoEl.src = user.photo_url || 'default.jpg';
    }

   
    const nameEl = document.getElementById('profile-name');
    if (nameEl) {
      nameEl.textContent = `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;
    }

   
    const genderAgeEl = document.getElementById('profile-gender-age');
    if (genderAgeEl) {
      genderAgeEl.textContent = `${user.gender}, ${user.age} years`;
    }

    
    const budgetEl = document.getElementById('profile-budget');
    if (budgetEl) {
      budgetEl.textContent = user.budget ? `${user.budget} shekels` : 'N/A';
    }

    
    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
      locationEl.textContent = user.location || 'Not demanding';
    }

    const viewBtn = document.getElementById('view-btn');
    if (viewBtn) viewBtn.onclick = () => window.location.href = 'viewprofile.html';

    const editBtn = document.getElementById('edit-btn');
    if (editBtn) editBtn.onclick = () => window.location.href = 'editprofile.html';

    const roommateBtn = document.getElementById('roommate-btn');
    if (roommateBtn) roommateBtn.onclick = () => window.location.href = 'roommate.html';

  } catch (error) {
    console.error(' Profile loading error :', error.message);
    const container = document.getElementById('user-profile-container');
    if (container) {
      container.innerHTML = '<p>Unable to load your profile. Please create it or try again later.</p>';
    }
  }
});
const closeBtn = document.getElementById('closeBtn');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.location.href = 'roomate-dashboard.html';
  });
}
