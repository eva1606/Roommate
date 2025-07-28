document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return (window.location.href = "login.html");

  const taskList = document.querySelector(".task-list");
  const addBtn = document.querySelector(".add-btn");

  // Récupérer les tâches de la propriété
  async function fetchTasks() {
    try {
      const res = await fetch(`http://localhost:5050/api/tasks/property/${userId}`);
      const tasks = await res.json();

      renderTasks(tasks);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      taskList.innerHTML = "<p>Error loading tasks.</p>";
    }
  }

  // Affichage des tâches
  function renderTasks(list) {
    taskList.innerHTML = "";
    if (!Array.isArray(list) || list.length === 0) {
      taskList.innerHTML = "<p>No tasks yet.</p>";
      return;
    }

    list.forEach(task => {
      const div = document.createElement("div");
      div.className = "payment-item";
      div.innerHTML = `
        <span class="payment-label">${task.title}</span>
        <span class="payment-date">${new Date(task.due_date).toLocaleDateString()}</span>
        <span class="payment-status">${task.status}</span>
        ${
          task.status !== "completed"
            ? `<button class="pay-btn" data-id="${task.id}">Mark Done</button>`
            : ""
        }
      `;
      taskList.appendChild(div);
    });

    // Boutons "Mark Done"
    document.querySelectorAll(".pay-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await fetch(`http://localhost:5050/api/tasks/${id}/complete`, {
            method: "PATCH",
          });
          fetchTasks();
        } catch (err) {
          alert("Error marking task as done.");
        }
      });
    });
  }

  // Ajouter une tâche
  addBtn?.addEventListener("click", async () => {
    const title = prompt("Enter task title:");
    const due = prompt("Enter due date (YYYY-MM-DD):");

    if (!title || !due) return alert("All fields required.");

    try {
      await fetch("http://localhost:5050/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, due_date: due, created_by: userId }),
      });
      fetchTasks();
    } catch (err) {
      alert("Error adding task.");
    }
  });

  fetchTasks();
});
