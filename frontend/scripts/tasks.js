document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return (window.location.href = "login.html");
  
    const taskList = document.querySelector(".task-list");
    const addBtn = document.querySelector(".add-task-btn");
  
    // Fetch tasks for current user (or property)
    async function fetchTasks() {
      try {
        const res = await fetch(`http://localhost:5050/api/tasks/${userId}`);
        const tasks = await res.json();
  
        taskList.innerHTML = "";
  
        if (tasks.length === 0) {
          taskList.innerHTML = "<p>No tasks yet.</p>";
          return;
        }
  
        tasks.forEach(task => {
          const div = document.createElement("div");
          div.className = "task-item";
          div.innerHTML = `
            <span class="task-label">${task.label}</span>
            <button class="do-btn" data-id="${task.id}">I do it</button>
          `;
          taskList.appendChild(div);
        });
      } catch (err) {
        console.error("❌ Error loading tasks:", err);
        taskList.innerHTML = "<p>Error loading tasks.</p>";
      }
    }
  
    // Add new task
    addBtn.addEventListener("click", async () => {
      const label = prompt("Enter task name:");
      if (!label) return;
  
      try {
        await fetch("http://localhost:5050/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, label }),
        });
        fetchTasks();
      } catch (err) {
        console.error("❌ Error adding task:", err);
      }
    });
  
    // Init
    fetchTasks();
  });
  