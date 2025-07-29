document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const roommateId = params.get('id');

  if (!roommateId) {
    document.body.innerHTML = "<p>❌ Aucun colocataire trouvé.</p>";
    return;
  }

  try {
    const res = await fetch(`https://roommate-1.onrender.com/api/potential-roommates/profil/${roommateId}`);
    if (!res.ok) throw new Error("Profil introuvable");

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
    document.getElementById('roommate-food').textContent = user.diet|| ' Non précisé';
    document.getElementById('roommate-description').textContent = user.bio || "Aucune description fournie.";
    const callBtn = document.getElementById("call-btn");

if (callBtn && user.phone) {
  callBtn.href = `tel:${user.phone}`;
} else if (callBtn) {
  callBtn.href = "#";
  callBtn.textContent = "Numéro non disponible";
  callBtn.classList.add("disabled"); // optionnel, pour le style
  callBtn.style.backgroundColor = "#ccc";
  callBtn.style.cursor = "not-allowed";
}

  } catch (err) {
    console.error("❌ Erreur chargement colocataire :", err);
    document.body.innerHTML = "<p>❌ Erreur lors du chargement du profil.</p>";
  }
});

// 🔙 Retour au dashboard
document.getElementById('closeBtn').addEventListener('click', () => {
  window.location.href = 'roomate-dashboard.html'; // ou history.back();
});
