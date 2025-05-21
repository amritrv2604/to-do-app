// DOM Elements
const taskInput = document.getElementById("taskInput");
const prioritySelect = document.getElementById("prioritySelect");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const filterBtns = document.querySelectorAll(".filter-btn");
const modal = document.getElementById("actionModal");
const modalEditBtn = document.getElementById("modalEditBtn");
const modalDeleteBtn = document.getElementById("modalDeleteBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const closeModal = document.querySelector(".close");
const editSection = document.getElementById("editSection");
const editTaskInput = document.getElementById("editTaskInput");
const editPrioritySelect = document.getElementById("editPrioritySelect");
const saveEditBtn = document.getElementById("saveEditBtn");
const deleteConfirmSection = document.getElementById("deleteConfirmSection");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentTaskIndex = null;

// Render Tasks
function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((task) => task.priority === filter);

  filteredTasks.forEach((task, index) => {
    const taskItem = document.createElement("li");
    taskItem.className = `task-item ${task.priority} ${
      task.completed ? "completed" : ""
    }`;

    taskItem.innerHTML = `
            <span>${task.text}</span>
            <div class="task-actions">
                <button class="complete-btn touch-optimized" title="${
                  task.completed ? "Mark incomplete" : "Mark complete"
                }">
                    ${
                      task.completed
                        ? '<i class="fas fa-undo"></i>'
                        : '<i class="fas fa-check"></i>'
                    }
                </button>
                <button class="more-actions-btn touch-optimized" title="More actions">
                    <i class="fas fa-ellipsis-h"></i>
                </button>
            </div>
            <div class="delete-swipe">
                <i class="fas fa-trash-alt"></i> Delete
            </div>
        `;

    // Event listeners
    taskItem
      .querySelector(".complete-btn")
      .addEventListener("click", () => toggleComplete(index));
    taskItem
      .querySelector(".more-actions-btn")
      .addEventListener("click", () => openActionModal(index));

    taskList.appendChild(taskItem);
  });

  // Initialize swipe functionality
  initSwipeDelete();
}

// Initialize swipe to delete
function initSwipeDelete() {
  let touchStartX = 0;
  let touchEndX = 0;

  document.querySelectorAll(".task-item").forEach((item) => {
    // Touch events for swipe to delete
    item.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.changedTouches[0].screenX;
      },
      { passive: true }
    );

    item.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe(item);
      },
      { passive: true }
    );

    // Click/tap on delete swipe
    item.querySelector(".delete-swipe").addEventListener("click", () => {
      const index = Array.from(item.parentNode.children).indexOf(item);
      deleteTask(index);
    });
  });

  function handleSwipe(item) {
    const difference = touchStartX - touchEndX;
    if (difference > 50) {
      // Swipe left
      item.classList.add("swiped");
    } else if (difference < -50) {
      // Swipe right
      item.classList.remove("swiped");
    }
  }
}

// Add Task
addBtn.addEventListener("click", () => {
  const text = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (text) {
    tasks.push({ text, priority, completed: false });
    saveTasks();
    taskInput.value = "";
    renderTasks();
  }
});

taskInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addBtn.click();
  }
});

// Toggle Complete
function toggleComplete(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  renderTasks();
}

// Modal Functions
function openActionModal(index) {
  currentTaskIndex = index;
  modal.style.display = "block";
  editSection.style.display = "none";
  deleteConfirmSection.style.display = "none";
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.width = "100%";
  initPrioritySelectStyle();
}

function closeModalFunc() {
  modal.style.display = "none";
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.width = "";
}

// Modal Event Listeners
closeModal.addEventListener("click", closeModalFunc);
modalCancelBtn.addEventListener("click", closeModalFunc);

modalEditBtn.addEventListener("click", function () {
  editSection.style.display = "block";
  deleteConfirmSection.style.display = "none";
  editTaskInput.value = tasks[currentTaskIndex].text;
  editPrioritySelect.value = tasks[currentTaskIndex].priority;
});

modalDeleteBtn.addEventListener("click", function () {
  editSection.style.display = "none";
  deleteConfirmSection.style.display = "block";
});

// Save Edit
saveEditBtn.addEventListener("click", function () {
  const newText = editTaskInput.value.trim();
  if (newText) {
    // Show loading state
    this.classList.add("loading");
    this.innerHTML = '<i class="fas fa-spinner"></i> Saving...';

    // Simulate save delay (remove in production)
    setTimeout(() => {
      tasks[currentTaskIndex].text = newText;
      tasks[currentTaskIndex].priority = editPrioritySelect.value;
      saveTasks();
      renderTasks();

      // Reset button state
      this.classList.remove("loading");
      this.innerHTML = '<i class="fas fa-save"></i> Save Changes';

      // Show success feedback
      showSaveSuccess();
      closeModalFunc();
    }, 800);
  }
});

// Success notification
function showSaveSuccess() {
  const successMsg = document.createElement("div");
  successMsg.className = "save-success";
  successMsg.innerHTML =
    '<i class="fas fa-check-circle"></i> Task updated successfully!';
  document.body.appendChild(successMsg);

  setTimeout(() => {
    successMsg.classList.add("show");
  }, 50);

  setTimeout(() => {
    successMsg.classList.remove("show");
    setTimeout(() => {
      successMsg.remove();
    }, 400);
  }, 3000);
}

// Better priority selection visualization
editPrioritySelect.addEventListener("change", function () {
  const selectedOption = this.options[this.selectedIndex];
  this.className = `priority-select priority-${selectedOption.value}`;
});

// Initialize priority select style
function initPrioritySelectStyle() {
  const select = editPrioritySelect;
  const selectedOption = select.options[select.selectedIndex];
  select.className = `priority-select priority-${selectedOption.value}`;
}

// Delete Confirmations
confirmDeleteBtn.addEventListener("click", function () {
  deleteTask(currentTaskIndex);
  closeModalFunc();
});

cancelDeleteBtn.addEventListener("click", function () {
  deleteConfirmSection.style.display = "none";
});

// Delete Task
function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

// Filter Tasks
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.getAttribute("data-filter");
    renderTasks(filter);
  });
});

// Save to LocalStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Close modal when clicking outside
window.addEventListener("click", function (event) {
  if (event.target == modal) {
    closeModalFunc();
  }
});

// Close modal when tapping outside (for mobile)
modal.addEventListener(
  "touchend",
  function (e) {
    if (e.target === modal) {
      closeModalFunc();
    }
  },
  { passive: true }
);

// Better touch handling for filters
filterBtns.forEach((btn) => {
  btn.addEventListener(
    "touchend",
    function (e) {
      e.preventDefault();
      this.click();
    },
    { passive: true }
  );
});

// Adjust priority select text for mobile
function optimizePrioritySelect() {
  const prioritySelect = document.getElementById("prioritySelect");
  if (window.innerWidth <= 480) {
    Array.from(prioritySelect.options).forEach((option) => {
      option.text = option.dataset.short;
    });
  } else {
    Array.from(prioritySelect.options).forEach((option) => {
      option.text = option.textContent.includes("Priority")
        ? option.textContent
        : option.dataset.long || option.textContent;
    });
  }
}

// Handle orientation changes
window.addEventListener("orientationchange", function () {
  if (window.innerWidth <= 768) {
    const modal = document.getElementById("actionModal");
    if (modal.style.display === "block") {
      modal.style.display = "none";
      setTimeout(() => {
        modal.style.display = "block";
      }, 300);
    }
  }
  optimizePrioritySelect();
});

// Run on load and resize
window.addEventListener("load", function () {
  renderTasks();
  optimizePrioritySelect();
});
window.addEventListener("resize", optimizePrioritySelect);
