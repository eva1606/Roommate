document.addEventListener("DOMContentLoaded", () => {
    const propertyId = new URLSearchParams(window.location.search).get("property_id");
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("first_name");
    if (!propertyId) {
        alert("❌ Missing property_id in URL");
        return;
      }
      
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const documentsList = document.getElementById("documentsList");
  
    // 📤 Lorsqu'on clique sur "Upload File", déclenche le file input
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });
  
    // 📁 Lorsqu'un fichier est sélectionné
    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      console.log("fichier selectionne :", file);
      if (!file || !propertyId || !userId) return;
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("property_id", propertyId);
      formData.append("sender_id", userId);
  
      try {
        const res = await fetch("http://localhost:5050/api/properties/upload", {
          method: "POST",
          body: formData
        });
  
        if (res.ok) {
          const newDoc = await res.json();
          displayDocument(newDoc);
        } else {
          alert("❌ Upload failed");
        }
      } catch (err) {
        console.error("❌ Upload error:", err);
      }
    });
  
    async function fetchDocuments() {
        try {
          const res = await fetch(`http://localhost:5050/api/properties/documents/${propertyId}`);
          const docs = await res.json();
      
          if (!Array.isArray(docs)) {
            console.error("❌ Mauvais format reçu :", docs);
            return;
          }
      
          documentsList.innerHTML = "";
          docs.forEach(displayDocument);
        } catch (err) {
          console.error("❌ Fetch documents error:", err);
        }
      }
      
  
    // 🖼️ Crée l'affichage d'un document
    function displayDocument(doc) {
      const isSender = doc.sender_id == userId;
      const senderName = isSender ? "Sent by you" : `Received by ${doc.sender_name || 'roommate'}`;
  
      const div = document.createElement("div");
      div.className = "document-entry";
  
      div.innerHTML = `
        <div class="document-card">
          <span class="doc-filename"><strong>${doc.file_name}</strong></span>
         <div class="doc-footer">
          <span class="doc-sender">${senderName}</span>
          <span class="doc-date">${new Date(doc.sent_at).toLocaleDateString()}</span>
         </div>
        </div>
      `;
  
      documentsList.prepend(div);
    }
  
    // 🔄 Initialisation
    if (propertyId && userId) {
      fetchDocuments();
    }
  });
  