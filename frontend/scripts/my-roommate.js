document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("user_id");
  
    if (!userId) {
      alert("Accès non autorisé. Veuillez vous reconnecter.");
      window.location.href = "login.html";
      return;
    }
  
    await fetchMyRoommateProperty(userId);
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
  
      // Propriété
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
  
      // Colocataires
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
        docsContainer.innerHTML = "<p>Aucun document disponible.</p>";
      }
  
    } catch (err) {
      console.error("❌ Erreur chargement propriété/colocataires:", err);
      propertyContainer.innerHTML = `<p>Erreur lors du chargement des données.</p>`;
    }
  }
  