document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.remove("hidden");
});
document.getElementById("closeMenu")?.addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.add("hidden");
});

document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();

  Swal.fire({
    title: "Are you sure?",
    text: "You will be logged out of your account.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, log me out",
    cancelButtonText: "Cancel"
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      Swal.fire({
        icon: "success",
        title: "Logged Out",
        text: "You have been successfully logged out.",
        confirmButtonText: "OK"
      }).then(() => {
        window.location.href = "index.html";
      });
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return (window.location.href = "login.html");

  const paymentList = document.querySelector(".payment-list");
  const addBtn = document.querySelector(".add-btn");
  let userHasProperty = true;

  // 🔹 Fonction pour récupérer les dépenses
  async function fetchExpensesForUser() {
    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/expenses/property/${userId}`);
  
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
  
      const data = await res.json();
  
      if (data.hasProperty === false || (Array.isArray(data) && data.length === 0)) {
        userHasProperty = false;
        paymentList.innerHTML = "<p style='text-align: center;'>You don't have any property to display expenses.</p>";
        return;
      }
  
      const expenses = Array.isArray(data) ? data : data.expenses;
  
      if (!Array.isArray(expenses)) {
        throw new Error("Invalid response");
      }
  
      renderPayments(expenses);
    } catch (err) {
      console.error("❌ Failed to fetch expenses:", err);
      paymentList.innerHTML = "<p style='text-align: center; color: red;'>Error while loading expenses.</p>";
    }
  }
  
  // 🔹 Ajout d'une dépense avec SweetAlert2
  addBtn?.addEventListener("click", async () => {
    if (!userHasProperty) {
      return Swal.fire({
        icon: "warning",
        title: "No Property Found",
        text: "You don't have any property. Unable to add an expense.",
        confirmButtonText: "OK"
      });
    }

    // ✅ Formulaire SweetAlert2
    const { value: formValues } = await Swal.fire({
      title: "Add New Expense",
      html: `
        <input id="expenseLabel" class="swal2-input" placeholder="Enter expense label">
        <input id="expenseAmount" type="number" class="swal2-input" placeholder="Enter amount (₪)">
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Expense",
      preConfirm: () => {
        const label = document.getElementById("expenseLabel").value.trim();
        const amount = parseFloat(document.getElementById("expenseAmount").value);
        if (!label || isNaN(amount)) {
          Swal.showValidationMessage("Please enter valid information.");
          return false;
        }
        return { label, amount };
      }
    });

    if (formValues) {
      try {
        const res = await fetch("https://roommate-1.onrender.com/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            label: formValues.label,
            amount: formValues.amount,
          }),
        });

        if (!res.ok) throw new Error("Failed to add expense");

        Swal.fire({
          icon: "success",
          title: "Expense Added",
          text: "The expense has been successfully recorded.",
          confirmButtonText: "OK"
        }).then(() => {
          fetchExpensesForUser(); 
        });

      } catch (err) {
        console.error("❌ Error adding expense:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while adding the expense.",
          confirmButtonText: "OK"
        });
      }
    }
  });

  // 🔹 Fonction d'affichage des paiements
  function renderPayments(list) {
    paymentList.innerHTML = "";

    if (list.length === 0) {
      paymentList.innerHTML = "<p>No payments recorded yet.</p>";
      return;
    }

    list.forEach((item) => {
      const div = document.createElement("div");
      div.className = "payment-item";
      div.innerHTML = `
        <div class="payment-info">
          <span class="payment-label">${item.label}</span>
          <span class="payment-user">${item.first_name} ${item.last_name}</span>
        </div>
        <div class="payment-meta">
          <span class="payment-amount">₪${item.amount}</span>
          <span class="payment-date">${new Date(item.date).toLocaleDateString()}</span>
        </div>
      `;
      paymentList.appendChild(div);
    });
  }

  fetchExpensesForUser();
});
