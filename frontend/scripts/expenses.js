document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return (window.location.href = "login.html");

  const paymentList = document.querySelector(".payment-list");
  const addBtn = document.querySelector(".add-btn");

  // 🎯 Récupère et affiche les dépenses
  async function fetchExpensesForUser() {
    try {
      const res = await fetch(`http://localhost:5050/api/expenses/property/${userId}`);
      const expenses = await res.json();
      const data = await res.json();

     
      if (data.hasProperty === false) {
        paymentList.innerHTML = "<p style='text-align: center;'>Vous n'avez pas de propriété pour afficher les dépenses.</p>";
        return;
      }

      if (!Array.isArray(expenses)) throw new Error("Invalid response");

      renderPayments(expenses);
    } catch (err) {
      console.error("❌ Failed to fetch expenses:", err);
      paymentList.innerHTML = "<p>Error loading expenses.</p>";
    }
  }

  // ➕ Ajouter une nouvelle dépense
  addBtn?.addEventListener("click", async () => {
    const label = prompt("Enter expense label:");
    const amount = prompt("Enter amount (₪):");

    if (!label || !amount || isNaN(parseFloat(amount))) {
      return alert("Please enter valid information.");
    }

    try {
      const res = await fetch("http://localhost:5050/api/expenses", {
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
