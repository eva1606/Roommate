document.addEventListener("DOMContentLoaded", () => {
    const propertyId = new URLSearchParams(window.location.search).get("property_id");
    const userId = localStorage.getItem("user_id");
    const userName = localStorage.getItem("first_name");
    if (!propertyId) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Property ID',
        text: 'Please return to the dashboard and try again.'
      });
      return;
    }
      
    const uploadBtn = document.getElementById("uploadBtn");
    const fileInput = document.getElementById("fileInput");
    const documentsList = document.getElementById("documentsList");
  
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });
  
    fileInput.addEventListener("change", async (event) => {
      const file = event.target.files[0];
      console.log("fichier selectionne :", file);
      if (!file || !propertyId || !userId) return;
  
      const formData = new FormData();
      formData.append("file", file);
      formData.append("property_id", propertyId);
      formData.append("sender_id", userId);
  
      try {
        const res = await fetch("https://roommate-1.onrender.com/api/properties/upload", {
          method: "POST",
          body: formData
        });
  
        if (res.ok) {
          const newDoc = await res.json();
          displayDocument(newDoc);
          Swal.fire({
            icon: 'success',
            title: 'Upload Successful',
            text: `${file.name} uploaded successfully.`,
            confirmButtonColor: '#004AAD'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Upload Failed',
            text: 'The server could not process your file. Please try again.'
          });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Network Error',
          text: 'Could not connect to the server.'
        });
      }
    });
    async function fetchDocuments() {
        try {
          const res = await fetch(`https://roommate-1.onrender.com/api/properties/documents/${propertyId}`);
          const docs = await res.json();
      
          if (!Array.isArray(docs)) {
            Swal.fire({
              icon: 'error',
              title: 'Invalid Response',
              text: 'The server returned an unexpected format.'
            });
            return;
          }
      
          documentsList.innerHTML = "";
          docs.forEach(displayDocument);
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Failed to Fetch Documents',
            text: 'Please try again later.'
          });
        }
      }
      
  
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
  
    if (propertyId && userId) {
      fetchDocuments();
    }
  });
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
