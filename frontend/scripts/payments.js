document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const propertyId = params.get('property_id');
    const savedDate = localStorage.getItem("next_payment_date");
if (savedDate) {
  document.getElementById("next-payment-date").textContent = savedDate;
}

  
    const user = JSON.parse(localStorage.getItem('user'));
    const ownerId = localStorage.getItem('user_id');
    if (!ownerId) {
      await Swal.fire({
        icon: 'error',
        title: '❌ Owner ID is missing',
        text: 'Please log in again.',
      });
      window.location.href = "login.html";
      return;
    }
  
    if (!propertyId || propertyId === "null") {
      const res = await fetch(`https://roommate-1.onrender.com/api/properties/rented/${ownerId}`);
  
      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Failed to fetch rented properties:", err);
        alert("Could not load your rented properties.");
        return;
      }
  
      const properties = await res.json();
  
      const selector = document.getElementById("property-selector");
      const list = document.getElementById("property-list");
  
      if (properties.length === 0) {
        list.innerHTML = "<li>No rented properties found.</li>";
      } else {
        properties.forEach(p => {
          const li = document.createElement("li");
          li.innerHTML = `<button onclick="window.location.href='payments.html?property_id=${p.id}'">${p.address}</button>`;
          list.appendChild(li);
        });
      }
  
      selector.classList.remove("hidden");
      return;
    }
  
    document.getElementById("payments-section").classList.remove("hidden");
  
    const propertyRes = await fetch(`https://roommate-1.onrender.com/api/properties/${propertyId}`);
    const property = await propertyRes.json();
  
    document.getElementById('property-address').textContent = property.address;
    document.getElementById('total-rent').textContent = `Total Rent: ${property.price} $`;
  
    const roommatesRes = await fetch(`https://roommate-1.onrender.com/api/properties/roommates/${propertyId}`);
    const roommates = await roommatesRes.json();
  
    const roommateCount = roommates.length || 1;
    document.getElementById('split-rent').textContent = `Split: ${Math.round(property.price / roommateCount)} $ each`;
  
    const selectedMonth = localStorage.getItem("selected_month") || "July";
    const paymentsRes = await fetch(`https://roommate-1.onrender.com/api/properties/${propertyId}/payments?month=${selectedMonth}`);
    const payments = await paymentsRes.json();
  
    document.getElementById("month-title").textContent = `Payments received (${selectedMonth})`;
  
    const tbody = document.getElementById("payments-body");
    tbody.innerHTML = "";
    payments.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.roommate_name}</td>
        <td>${p.status === 'paid' ? 'Paid' : 'Unpaid'}</td>
        <td>${p.date_paid || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  });
  
  document.getElementById("manual-payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const phone = e.target.phone.value;
    const month = e.target.month.value;
    const date_paid = e.target.date_paid.value;
    const params = new URLSearchParams(window.location.search);
    const property_id = params.get("property_id");
  
    try {
      const res = await fetch("https://roommate-1.onrender.com/api/properties/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, month, property_id, date_paid })
      });
  
      if (!res.ok) throw new Error("Manual payment failed");
  
      localStorage.setItem("selected_month", month);
  
      const payment = await res.json();
      const tbody = document.getElementById("payments-body");
  
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${payment.roommate_name}</td>
        <td>${payment.status === 'paid' ? 'Paid' : 'Unpaid'}</td>
        <td>${payment.date_paid || '-'}</td>
      `;
      tbody.appendChild(tr);
  
      closeModal();
    } catch (err) {
      console.error("payments.js:122 Error:", err);
      alert("Failed to add manual payment.");
    }

  });
  
  function openModal() {
    document.getElementById("paymentModal").classList.remove("hidden");
  }
  
  function closeModal() {
    document.getElementById("paymentModal").classList.add("hidden");
  }
  
  function remindAll() {
    alert("Reminder sent to all roommates!");
  }
  function setNextPaymentDate() {
    const input = document.getElementById("next-payment-input");
    const span = document.getElementById("next-payment-date");
  
    if (!input.value) {
      alert("Please select a date.");
      return;
    }
  
    const date = new Date(input.value);
    const formatted = date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    localStorage.setItem("next_payment_date", formatted);

    span.textContent = formatted;
  }
  function updateNextPayment() {
    const input = document.getElementById("next-payment-input");
    const span = document.getElementById("next-payment-date");
  
    if (input.value) {
      const selectedDate = new Date(input.value);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      span.textContent = selectedDate.toLocaleDateString('en-US', options);
    }
  }
  document.getElementById("logoutBtn")?.addEventListener("click", async (e) => {
    e.preventDefault();
    await Swal.fire({
      title: 'Are you sure you want to logout?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  });


  
