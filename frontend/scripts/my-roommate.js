document.addEventListener("DOMContentLoaded", async () => {
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

  await fetchMyRoommateProperty(userId);

  
  const uploadForm = document.getElementById("upload-form");
  if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput?.files[0];

      if (!file) {
        Swal.fire({
          icon: "warning",
          title: "No File Selected",
          text: "Please choose a file before uploading.",
          confirmButtonText: "OK"
        });
        return;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_id", userId);

        const res = await fetch("https://roommate-1.onrender.com/api/roommate-property/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          Swal.fire({
            icon: "error",
            title: "Upload Failed",
            text: "The document could not be sent. Please try again later.",
            confirmButtonText: "OK"
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Document Uploaded",
          text: "Your document has been successfully sent!",
          confirmButtonText: "OK"
        }).then(() => {
          fileInput.value = ""; 
          fetchMyRoommateProperty(userId); 
        });

      } catch (err) {
        console.error("❌ Upload error:", err);
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "There was a problem connecting to the server. Please try again.",
          confirmButtonText: "OK"
        });
      }
    });
  }


  async function fetchMyRoommateProperty(userId) {
    const propertyContainer = document.getElementById("property-details");
    const roommatesContainer = document.getElementById("roommates-list");
    const docsContainer = document.getElementById("documents-list");

    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/roommate-property/${userId}`);
      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Error Loading Property",
          text: "Unable to retrieve your property details.",
          confirmButtonText: "OK"
        });
        if (propertyContainer) propertyContainer.innerHTML = `<p>⚠️ Unable to load property information.</p>`;
        return;
      }

      const data = await res.json();
      const property = data.property;
      const roommates = data.roommates;

     
      if (property) {
        propertyContainer.innerHTML = `
          <h2>${property.address}</h2>
          <p><strong>Price:</strong> ${property.price} ₪</p>
          <p><strong>Rooms:</strong> ${property.rooms}</p>
          <img src="${property.photo}" alt="Photo" class="property-photo" />
        `;
      } else {
        propertyContainer.innerHTML = `<p>You don't have a rented property yet.</p>`;
      }

     
      roommatesContainer.innerHTML = "";
      roommates.forEach((coloc) => {
        const div = document.createElement("div");
        div.classList.add("roommate-card");
        div.innerHTML = `
          <img src="${coloc.photo_url}" class="roommate-photo" />
          <h4>${coloc.first_name} ${coloc.last_name}</h4>
          <p>${coloc.email}</p>
        `;
        roommatesContainer.appendChild(div);
      });

     
      docsContainer.innerHTML = "";
      if (data.documents && data.documents.length > 0) {
        data.documents.forEach((doc) => {
          const docLink = document.createElement("a");
          docLink.href = doc.file_url;
          docLink.target = "_blank";
          docLink.textContent = ` ${doc.file_name}`;
          docLink.classList.add("doc-link");
          docsContainer.appendChild(docLink);
        });
      } else {
        docsContainer.innerHTML = "<p>No file for this property.</p>";
      }

    } catch (err) {
      console.error(" Error loading property/roommates:", err);
      Swal.fire({
        icon: "error",
        title: "Data Load Error",
        text: "An unexpected error occurred while loading your data.",
        confirmButtonText: "OK"
      });
      if (propertyContainer) propertyContainer.innerHTML = `<p>⚠️ Error loading data.</p>`;
    }
  }
});
