document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('registerForm');
  const formData = new FormData(form); 

  try {
    const res = await fetch('http://127.0.0.1:5050/api/users/register', {
      method: 'POST',
      body: formData 
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
