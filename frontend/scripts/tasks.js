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

  const taskList = document.querySelector(".task-list");
  const addBtn = document.querySelector(".add-btn");

  // 🔁 Charger les tâches
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

  // 🧾 Affichage des tâches
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
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <span>Status: ${task.status}</span>
          <span>Due: ${new Date(task.due_date).toLocaleDateString()}</span>
        </div>
        <div class="task-meta">
        <span>Added by: ${task.created_by?.first_name || ""} ${task.created_by?.last_name || ""}</span>
      </div>
      
      ${
        task.status === "completed" && task.completed_by
          ? `<div class="task-meta">
               <span>Completed by: ${task.completed_by.first_name} ${task.completed_by.last_name}</span>
             </div>`
          : ""
      }
      
        </div>
        ${
          task.status !== "completed"
            ? `<button class="task-btn" data-id="${task.id}">Mark as Done</button>`
            : ""
        }
      `;

      // Marquer comme fait
      if (task.status !== "completed") {
        const btn = div.querySelector(".task-btn");
        btn.addEventListener("click", async () => {
          try {
            await fetch(`http://127.0.0.1:5050/api/tasks/${task.id}/complete`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });
            fetchTasks(); // Recharger
          } catch (err) {
            alert("Error marking task as done.");
          }
        });
      }

      taskList.appendChild(div);
    });
  }

  // ➕ Ajouter une tâche
  addBtn?.addEventListener("click", async () => {
    const title = prompt("Enter task title:");
    const due = prompt("Enter due date (YYYY-MM-DD):");

    if (!title || !due) return alert("All fields required.");

    try {
      await fetch("http://127.0.0.1:5050/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          due_date: due,
          created_by: userId,
        }),
      });
      fetchTasks();
    } catch (err) {
      alert("Error adding task.");
    }
  });

  fetchTasks();
});

