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

  if (!userId) {
    Swal.fire({
      icon: "warning",
      title: "Access Denied",
      text: "You must be logged in to access this page.",
      confirmButtonText: "Go to Login"
    }).then(() => {
      window.location.href = "login.html";
    });
    return;
  }
  
  const taskList = document.querySelector(".task-list");
  const addBtn = document.querySelector(".add-btn");
  let userHasProperty = true;

  async function fetchTasks() {
    try {
      const res = await fetch(`https://roommate-1.onrender.com/api/tasks/property/${userId}`);
      const data = await res.json();
  
      if (data.hasProperty === false || (Array.isArray(data.tasks) && data.tasks.length === 0)) {
        userHasProperty = false;
        taskList.innerHTML = "<p style='text-align: center;'>You don't have any property to display tasks.</p>";
        return;
      }
  
      const tasks = Array.isArray(data.tasks) ? data.tasks : data;
      renderTasks(tasks);
    } catch (err) {
      console.error("❌ Failed to fetch tasks:", err);
      taskList.innerHTML = "<p style='color:red; text-align:center;'>Error while loading tasks.</p>";
    }
  }

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

      if (task.status !== "completed") {
        const btn = div.querySelector(".task-btn");
        btn.addEventListener("click", async () => {
          try {
            await fetch(`https://roommate-1.onrender.com/api/tasks/${task.id}/complete`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId }),
            });
            Swal.fire({
              icon: "success",
              title: "Task Completed",
              text: "This task has been marked as done!",
              confirmButtonText: "OK"
            }).then(() => fetchTasks());
          } catch (err) {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Error marking task as done.",
              confirmButtonText: "OK"
            });
          }
        });
      }

      taskList.appendChild(div);
    });
  }
  addBtn?.addEventListener("click", async () => {
    const { value: formValues } = await Swal.fire({
      title: "Add New Task",
      html:
        `<input id="taskTitle" class="swal2-input" placeholder="Task title">` +
        `<input id="taskDue" type="date" class="swal2-input">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Add Task",
      preConfirm: () => {
        const title = document.getElementById("taskTitle").value;
        const due = document.getElementById("taskDue").value;
        if (!title || !due) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }
        return { title, due };
      }
    });

    if (formValues) {
      try {
        await fetch("https://roommate-1.onrender.com/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formValues.title,
            due_date: formValues.due,
            created_by: userId,
          }),
        });
        Swal.fire({
          icon: "success",
          title: "Task Added",
          text: "Your task has been successfully added.",
          confirmButtonText: "OK"
        }).then(() => fetchTasks());
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error adding task.",
          confirmButtonText: "OK"
        });
      }
    }
  });

  fetchTasks();
});

