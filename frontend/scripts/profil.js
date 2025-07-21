document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      window.location.href = 'login.html';
      return;
    }
  
    try {
      const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`);
      if (!res.ok) throw new Error('Profil introuvable');
      const user = await res.json();
  
      // Injecte dynamiquement les infos
      document.getElementById('title').textContent = 'My Profile';
      document.getElementById('profile-photo').src = user.photo_url || 'default.jpg';
      document.getElementById('profile-name').textContent = `${user.first_name.toUpperCase()} ${user.last_name.toUpperCase()}`;
      document.getElementById('profile-gender-age').textContent = `${user.gender}, ${calculateAge(user.birthday)} ans`;
      document.getElementById('profile-location').textContent = user.location || 'Non spécifiée';
      document.getElementById('profile-account-type').textContent = 'Nearby'; // statique ou calculé ?
      
      // Boutons (optionnel)
      document.getElementById('view-btn').onclick = () => window.location.href = 'viewprofile.html';
      document.getElementById('edit-btn').onclick = () => window.location.href = 'editprofile.html';
      document.getElementById('roommate-btn').onclick = () => window.location.href = 'roommate.html';
  
    } catch (err) {
      console.error(err);
      document.getElementById('user-profile-container').innerHTML = '<p>Erreur de chargement du profil.</p>';
    }
  });
  
  function calculateAge(birthdayStr) {
    const birthDate = new Date(birthdayStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  }
  