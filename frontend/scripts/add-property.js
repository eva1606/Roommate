document.getElementById('propertyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append('owner_id', localStorage.getItem('user_id') || 1); // temporaire
  
    try {
      console.log("📤 Sending form data:");
     for (let [key, val] of formData.entries()) {
     console.log(`${key}:`, val);
     }
      const res = await fetch('http://127.0.0.1:5050/api/properties/add', {
        method: 'POST',
        body: formData
      });
  
      const data = await res.json();
      if (!res.ok) {
        const text = await res.text(); // <= récupère l'erreur brute
        console.error("❌ Server raw response:", text);
        alert("There was a problem adding the property.");
        return;
      }      
      if (!res.ok) {
        alert("There was a problem adding the property.");
        console.error("Server response:", data);
        return;
      }
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Server responded with:", errorText);
        alert("There was a problem adding the property.");
        return;
      }
      
  
      alert("Property added successfully!");
      window.location.href = "owner-dashboard.html";
  
    } catch (error) {
      console.error("Error:", error);
      alert("There was a problem adding the property.");
    }
  });
  