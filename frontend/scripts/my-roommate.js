document.addEventListener("DOMContentLoaded", async () => {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("Accès non autorisé. Veuillez vous reconnecter.");
    window.location.href = "login.html";
    return;
  }

  await fetchMyRoommateProperty(userId);

  // Gestion du formulaire d'upload
  const uploadForm = document.getElementById("upload-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput?.files[0];
      const status = document.getElementById("upload-status");

      if (!file) {
        if (status) status.textContent = "❌ Veuillez sélectionner un fichier.";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);

        const res = await fetch("http://127.0.0.1:5050/api/roommate-property/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Échec de l'envoi");

        if (status) status.textContent = "✅ Document envoyé avec succès !";
        fileInput.value = "";

        // Recharge les documents après envoi
        await fetchMyRoommateProperty(userId);
      } catch (err) {
        console.error("❌ Upload error:", err);
        if (status) status.textContent = "❌ Erreur lors de l'envoi du document.";
      }
    });
  }
});

async function fetchMyRoommateProperty(userId) {
  const propertyContainer = document.getElementById("property-details");
  const roommatesContainer = document.getElementById("roommates-list");
  const docsContainer = document.getElementById("documents-list");

  try {
    const res = await fetch(`http://127.0.0.1:5050/api/roommate-property/${userId}`);
    if (!res.ok) throw new Error("Erreur lors de la récupération de la propriété");

    const data = await res.json();
    const property = data.property;
    const roommates = data.roommates;

    // 🏠 Propriété
    if (property) {
      propertyContainer.innerHTML = `
        <h2>${property.address}</h2>
        <p><strong>Prix:</strong> ${property.price} ₪</p>
        <p><strong>Pièces:</strong> ${property.rooms}</p>
        <img src="${property.photo}" alt="Photo" class="property-photo" />
      `;
    } else {
      propertyContainer.innerHTML = `<p>Vous n'avez pas encore de propriété louée.</p>`;
    }

    // 👥 Colocataires
    roommatesContainer.innerHTML = "";
    roommates.forEach((coloc) => {
      const div = document.createElement("div");
      div.classList.add("roommate-card");
      div.innerHTML = `
        <img src="${coloc.photo_url || 'default-avatar.jpg'}" class="roommate-photo" />
        <h4>${coloc.first_name} ${coloc.last_name}</h4>
        <p>${coloc.email}</p>
      `;
      roommatesContainer.appendChild(div);
    });

    // 📄 Documents
    docsContainer.innerHTML = "";
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc) => {
        const docLink = document.createElement("a");
        docLink.href = doc.file_url;
        docLink.target = "_blank";
        docLink.textContent = `📄 ${doc.file_name}`;
        docLink.classList.add("doc-link");
        docsContainer.appendChild(docLink);
      });
    } else {
      docsContainer.innerHTML = "<p>Aucun fichier partagé.</p>";
    }

  } catch (err) {
    console.error("❌ Erreur chargement propriété/colocataires:", err);
    if (propertyContainer) propertyContainer.innerHTML = `<p>Erreur lors du chargement des données.</p>`;
  }
}
