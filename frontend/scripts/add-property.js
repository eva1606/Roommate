document.getElementById('propertyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('owner_id', localStorage.getItem('user_id') || 1); 
  
    try {
      console.log("📤 Sending form data:");
     for (let [key, val] of formData.entries()) {
     console.log(`${key}:`, val);
     }
      const res = await fetch('https://roommate-1.onrender.com/api/properties/add', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: data.message || 'There was a problem adding the property.'
        });
        return;
      }      
      
      Swal.fire({
        icon: 'success',
        title: 'Property Added!',
        text: 'Your property has been successfully added.',
        confirmButtonText: 'Go to Dashboard'
      }).then(() => {
        window.location.href = "owner-dashboard.html";
      });
  
     
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'Something went wrong while adding the property.'
      });
    }
  });
  