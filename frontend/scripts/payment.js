document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return (window.location.href = "login.html");
  
    const paymentList = document.querySelector(".payment-list");
    const addBtn = document.querySelector(".add-btn");
  
    let currentPropertyId = null;
  
    // 🔁 Get property ID where user is tenant
    async function fetchUserProperty() {
      try {
        const res = await fetch(`https://roommate-1.onrender.com/api/roommate-property/${userId}`);
        const data = await res.json();
        currentPropertyId = data?.property_id;
        if (!currentPropertyId) throw new Error("No property found.");
        fetchPayments();
      } catch (err) {
        console.error("❌ Error fetching user property:", err);
        paymentList.innerHTML = "<p>No active property found.</p>";
      }
    }
  
    // 📥 Fetch payments for the property
    async function fetchPayments() {
      try {
        const res = await fetch(`https://roommate-1.onrender.com/api/expenses/property/${currentPropertyId}`);
        const payments = await res.json();
        renderPayments(payments);
      } catch (err) {
        console.error("❌ Failed to load payments:", err);
        paymentList.innerHTML = "<p>Error loading payments.</p>";
      }
    }
  
    // 🧾 Display payments in the DOM
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
          <span class="payment-user">${item.first_name} ${item.last_name}</span>
        `;
        paymentList.appendChild(div);
      });
    }
  
    // ➕ Add new payment
    addBtn?.addEventListener("click", async () => {
      const label = prompt("Enter payment label:");
      const amount = prompt("Enter amount (₪):");
  
      if (!label || !amount || isNaN(parseFloat(amount))) {
        return alert("Please enter valid information.");
      }
  
      try {
        await fetch("https://roommate-1.onrender.com/api/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            property_id: currentPropertyId,
            label,
            amount: parseFloat(amount),
          }),
        });
  
        fetchPayments(); // refresh list
      } catch (err) {
        console.error("❌ Error adding payment:", err);
        alert("Failed to add payment.");
      }
    });
  
    fetchUserProperty();
  });
  