document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      window.location.href = 'login.html';
      return;
    }
  
    const form = document.getElementById('editProfileForm');
  
    try {
      // 🔁 Récupération des infos actuelles
      const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`);
      if (!res.ok) throw new Error("Profil introuvable");
      const user = await res.json();
  
      // 📥 Pré-remplir les champs
      form.elements['first_name'].value = user.first_name || '';
      form.elements['last_name'].value = user.last_name || '';
      form.elements['email'].value = user.email || '';
      form.elements['gender'].value = user.gender || '';
      form.elements['age'].value = user.age || '';
      form.elements['profession'].value = user.profession || '';
      form.elements['budget'].value = user.budget || '';
      form.elements['location'].value = user.location || '';
      form.elements['smoke'].checked = user.smoke || false;
      form.elements['pets'].checked = user.pets || false;
      form.elements['looking_for'].value = user.looking_for || '';
  
    } catch (err) {
      console.error("❌ Erreur chargement profil :", err);
      alert("Erreur de chargement du profil.");
    }
  
    // 📝 Soumission du formulaire
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      formData.append('user_id', userId);
  
      try {
        const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`, {
          method: 'PUT',
          body: formData
        });
  
        if (!res.ok) {
          const err = await res.text();
          console.error("Erreur serveur:", err);
          alert("❌ Échec de la mise à jour du profil.");
          return;
        }
  
        alert("✅ Profil mis à jour !");
        window.location.href = "profil.html";
  
      } catch (err) {
        console.error("Erreur mise à jour profil:", err);
        alert("Une erreur est survenue.");
      }
    });
  });
  