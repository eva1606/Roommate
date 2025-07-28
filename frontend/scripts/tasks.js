document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return (window.location.href = "login.html");

  const taskList = document.querySelector(".task-list");
  const addBtn = document.querySelector(".add-btn");

  // 🔁 Récupérer les tâches de la propriété
  async function fetchTasks() {
    try {
      const res = await fetch(`http://127.0.0.1:5050/api/tasks/property/${userId}`);
      const tasks = await res.json();
      if (!Array.isArray(tasks)) throw new Error("Invalid task data");
      renderTasks(tasks);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      taskList.innerHTML = "<p>Error loading tasks.</p>";
    }
  }

  // 🧾 Afficher les tâches dans le DOM
  function renderTasks(tasks) {
    taskList.innerHTML = "";
    if (tasks.length === 0) {
      taskList.innerHTML = "<p>No tasks yet.</p>";
      return;
    }

    tasks.forEach((task) => {
      const div = document.createElement("div");
      div.className = "task-item";
      div.innerHTML = `
        <h3>${task.title}</h3>
        <p>Status: ${task.status}</p>
        <p>Due: ${new Date(task.due_date).toLocaleDateString()}</p>
        ${
          task.status !== "done"
            ? `<button class="done-btn" data-id="${task.id}">✔ Mark Done</button>`
            : ""
        }
      `;
      taskList.appendChild(div);
    });

    // ✅ Ajouter les eventListeners sur les boutons "Mark Done"
    document.querySelectorAll(".done-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        try {
          await fetch(`http://127.0.0.1:5050/api/tasks/${id}/complete`, {
            method: "PATCH",
          });
          fetchTasks(); // refresh
        } catch (err) {
          alert("Error marking task as done.");
        }
      });
    });
  }

  // ➕ Ajouter une tâche
  addBtn?.addEventListener("click", async () => {
    const title = prompt("Enter task title:");
    const due = prompt("Enter due date (YYYY-MM-DD):");

    if (!title || !due) return alert("All fields required.");

    try {
      await fetch("hhttp://127.0.0.1:5050/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, due_date: due, created_by: userId }),
      });
      fetchTasks();
    } catch (err) {
      alert("Error adding task.");
    }
  });

  // 🚀 Initialisation
  fetchTasks();
});
