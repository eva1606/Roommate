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
        <span class="payment-label">${item.label}</span>
        <span class="payment-amount">₪${item.amount}</span>
        <span class="payment-date">${new Date(item.date).toLocaleDateString()}</span>
      `;
      paymentList.appendChild(div);
    });
  }

  // 🔁 Initialisation
  fetchExpensesForUser();
});
