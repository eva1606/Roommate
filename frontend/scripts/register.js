document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const first_name = document.querySelector('input[name="first_name"]').value;
    const last_name = document.querySelector('input[name="last_name"]').value;
    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;
    const phone = document.querySelector('input[name="phone"]').value;
    const role = document.querySelector('select[name="role"]').value;
  
    try {
      const res = await fetch('http://127.0.0.1:5050/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, password, phone, role })
      });
  
      if (!res.ok) {
        const err = await res.json();
        alert("Registration failed: " + (err.error || "Please try again"));
        return;
      }
  
      alert("Account created! You can now log in.");
      window.location.href = "login.html";
    } catch (err) {
      console.error("Registration error:", err);
      alert("A technical error occurred during registration.");
    }
  });
  