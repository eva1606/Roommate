document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
  
    try {
      const res = await fetch('http://127.0.0.1:5050/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
  
      if (!res.ok) {
        alert("Login failed. Please check your credentials.");
        return;
      }
  
      const user = await res.json();
  
      localStorage.setItem("first_name", user.first_name);
      localStorage.setItem("user_id", user.id);
      localStorage.setItem("role", user.role);
  
      if (user.role === "owner") {
        window.location.href = "owner-dashboard.html";
      } else {
        window.location.href = "roomate-dashboard.html";
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("A technical error occurred while trying to log in.");
    }
  });
  