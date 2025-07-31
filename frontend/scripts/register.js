document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = document.getElementById('registerForm');
  const formData = new FormData(form); 

  try {
    const res = await fetch('https://roommate-1.onrender.com/api/users/register', {
      method: 'POST',
      body: formData 
    });

    if (!res.ok) {
      const err = await res.json();
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.error || "Please try again.",
        confirmButtonText: "OK"
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Account Created",
      text: "Your account has been successfully created! You can now log in.",
      confirmButtonText: "Go to Login"
    }).then(() => {
      window.location.href = "login.html";
    });

  } catch (err) {
    console.error("Registration error:", err);
    Swal.fire({
      icon: "error",
      title: "Technical Error",
      text: "A problem occurred during registration. Please try again later.",
      confirmButtonText: "OK"
    });
  }
});
