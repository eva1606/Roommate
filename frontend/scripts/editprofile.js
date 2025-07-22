document.addEventListener('DOMContentLoaded', async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
      window.location.href = 'login.html';
      return;
    }
  
    const form = document.getElementById('edit-profile-form');
    if (!form) {
      console.error("❌ Formulaire introuvable !");
      return;
    }
  
    try {
      // 📥 Récupération des infos actuelles
      const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`);
      if (!res.ok) throw new Error("Profil introuvable");
      const user = await res.json();
  
      // 🔁 Pré-remplissage du formulaire
      form.first_name.value = user.first_name || '';
      form.last_name.value = user.last_name || '';
      form.email.value = user.email || '';
      form.gender.value = user.gender || '';
      form.looking_for.value = user.looking_for || '';
      form.profession.value = user.profession || '';
      form.age.value = user.age || '';
      form.smoke.value = String(user.smoke);
      form.pets.value = String(user.pets);
      form.budget.value = user.budget || '';
  
    } catch (err) {
      console.error("❌ Erreur chargement profil :", err);
      alert("Erreur lors du chargement du profil.");
      return;
    }
  
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
      
        const updatedProfile = {
          first_name: form.first_name.value,
          last_name: form.last_name.value,
          email: form.email.value,
          gender: form.gender.value,
          looking_for: form.looking_for.value,
          profession: form.profession.value,
          age: form.age.value,
          smoke: form.smoke.value === 'true',
          pets: form.pets.value === 'true',
          budget: form.budget.value,
        };
      
        try {
          const res = await fetch(`http://127.0.0.1:5050/api/profil_users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedProfile)
          });
      
          if (!res.ok) {
            const text = await res.text();
            console.error("❌ Erreur mise à jour:", text);
            alert("Échec de la mise à jour du profil.");
            return;
          }
      
          alert("✅ Profil mis à jour !");
          window.location.href = "profil.html";
      
        } catch (err) {
          console.error("❌ Erreur réseau:", err);
          alert("Une erreur est survenue.");
        }
      });      
  });
  