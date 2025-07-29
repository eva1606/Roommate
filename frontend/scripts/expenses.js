// Navigation hamburger
document.getElementById("hamburgerBtn")?.addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.remove("hidden");
});
document.getElementById("closeMenu")?.addEventListener("click", () => {
  document.getElementById("menuOverlay").classList.add("hidden");
});

document.getElementById("logoutBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.clear();
  window.location.href = "login.html";
});
document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return (window.location.href = "login.html");

  const paymentList = document.querySelector(".payment-list");
  const addBtn = document.querySelector(".add-btn");
  let userHasProperty = true;
  async function fetchExpensesForUser() {
    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/expenses/property/${userId}`);
  
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
  
      const data = await res.json();
  
      if (data.hasProperty === false || (Array.isArray(data) && data.length === 0)) {
        userHasProperty = false;
        paymentList.innerHTML = "<p style='text-align: center;'>Vous n'avez pas de propriété pour afficher les dépenses.</p>";
        return;
      }
  
      const expenses = Array.isArray(data) ? data : data.expenses;
  
      if (!Array.isArray(expenses)) {
        throw new Error("Invalid response");
      }
  
      renderPayments(expenses);
    } catch (err) {
      console.error("❌ Failed to fetch expenses:", err);
      paymentList.innerHTML = "<p style='text-align: center; color: red;'>Erreur lors du chargement des dépenses.</p>";
    }
  }
  
  // ➕ Ajouter une nouvelle dépense
  addBtn?.addEventListener("click", async () => {
    if (!userHasProperty) {
      return alert("❌ Vous n'avez pas de propriété. Impossible d'ajouter une dépense.");
    }
    const label = prompt("Enter expense label:");
    const amount = prompt("Enter amount (₪):");

    if (!label || !amount || isNaN(parseFloat(amount))) {
      return alert("Please enter valid information.");
    }

    try {
      const res = await fetch("https://roommate-1.onrender.com/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          label,
          amount: parseFloat(amount),
        }),
      });

      if (!res.ok) throw new Error("Failed to add expense");

      await fetchExpensesForUser(); // refresh
    } catch (err) {
      console.error("❌ Error adding expense:", err);
      alert("Error adding expense.");
    }
  });

  // 🧾 Génère la liste des paiements
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

  // 🔁 Initialisation
  fetchExpensesForUser();
});
