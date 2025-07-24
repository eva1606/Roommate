document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('user_id');

  // 🔐 Rediriger si l'utilisateur n'est pas connecté
  if (!userId) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`);

    if (!res.ok) {
      throw new Error('Profil introuvable');
    }

    const user = await res.json();

    // 📸 Afficher la photo de profil
    const photoEl = document.getElementById('profile-photo');
    if (photoEl) {
      photoEl.src = user.photo_url || 'default.jpg';
    }

    // 👤 Nom complet
    const nameEl = document.getElementById('profile-name');
    if (nameEl) {
      nameEl.textContent = `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;
    }

    // 🧬 Sexe + Âge
    const genderAgeEl = document.getElementById('profile-gender-age');
    if (genderAgeEl) {
      genderAgeEl.textContent = `${user.gender}, ${user.age} years`;
    }

    // 💰 Budget
    const budgetEl = document.getElementById('profile-budget');
    if (budgetEl) {
      budgetEl.textContent = user.budget ? `${user.budget} shekels` : 'N/A';
    }

    // 📍 Localisation
    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
      locationEl.textContent = user.location || 'Non spécifiée';
    }

    // 🔘 Actions des boutons (s'ils existent)
    const viewBtn = document.getElementById('view-btn');
    if (viewBtn) viewBtn.onclick = () => window.location.href = 'viewprofile.html';

    const editBtn = document.getElementById('edit-btn');
    if (editBtn) editBtn.onclick = () => window.location.href = 'editprofile.html';

    const roommateBtn = document.getElementById('roommate-btn');
    if (roommateBtn) roommateBtn.onclick = () => window.location.href = 'roommate.html';

  } catch (error) {
    console.error('❌ Erreur de chargement du profil :', error.message);
    const container = document.getElementById('user-profile-container');
    if (container) {
      container.innerHTML = '<p>❌ Impossible de charger votre profil. Veuillez le créer ou réessayer plus tard.</p>';
    }
  }
});
const closeBtn = document.getElementById('closeBtn');
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.location.href = 'roomate-dashboard.html';
  });
}
