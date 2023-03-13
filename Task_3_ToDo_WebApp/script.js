// Initialize the task list arrays
let pendingTasks = [];
let completedTasks = [];

// Function to add a new task to the list
function addTask(e) {
  e.preventDefault();

  let taskInput = document.getElementById("taskInput");

  let task = taskInput.value.trim();

  if (task) {
    let now = new Date();
let dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
let timeOptions = { hour: 'numeric', minute: 'numeric', second: 'numeric' };
let taskWithTime = {
  task: task,
  added: now.toLocaleDateString('en-US', dateOptions) + ' ' + now.toLocaleTimeString('en-US', timeOptions),
  completed: null,
  pending: null,
};

    pendingTasks.push(taskWithTime);
    taskInput.value = "";
    refreshTaskList();
    updateTaskCount();
  }
}

// Function to refresh the task list
function refreshTaskList() {
  // Clear the task lists
  document.getElementById("pendingTasks").innerHTML = "";
  document.getElementById("completedTasks").innerHTML = "";

  // Loop through the pending tasks array and display each task
  for (let i = 0; i < pendingTasks.length; i++) {
    let task = pendingTasks[i];
    let li = document.createElement("li");
    let taskDiv = document.createElement("div");
    taskDiv.textContent = task.task;
    taskDiv.classList.add("task");
    let timeDiv = document.createElement("div");
    let date = new Date(task.added);
    timeDiv.innerHTML = `<span class="date">${date.toDateString()}</span><br><span class="time">${date.toLocaleTimeString()}</span>`;
    timeDiv.classList.add("time");
    li.appendChild(taskDiv);
    li.appendChild(timeDiv);

    // Add a button to mark the task as complete
    let completeButton = document.createElement("button");
    completeButton.textContent = "Complete";
    completeButton.onclick = function () {
      completeTask(i);
    };
    li.appendChild(completeButton);

    // Add a button to delete the task
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      deleteTask(i);
    };
    li.appendChild(deleteButton);

    document.getElementById("pendingTasks").appendChild(li);
  }

  // Loop through the completed tasks array and display each task
  for (let i = 0; i < completedTasks.length; i++) {
    let task = completedTasks[i];
    let li = document.createElement("li");
    let taskDiv = document.createElement("div");
    taskDiv.textContent = task.task;
    taskDiv.classList.add("task");
    let timeDiv = document.createElement("div");
    let date = new Date(task.completed);
    timeDiv.innerHTML = `<span class="date">${date.toDateString()}</span><br><span class="time">${date.toLocaleTimeString()}</span>`;
    timeDiv.classList.add("time");
    li.appendChild(taskDiv);
    li.appendChild(timeDiv);

    // Add a button to mark the task as pending
    let pendingButton = document.createElement("button");
    pendingButton.textContent = "Mark as Pending";
    pendingButton.onclick = function () {
      pendingTask(i);
    };
    li.appendChild(pendingButton);

    // Add a button to delete the task
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.onclick = function () {
      deleteTask(i, true);
    };
    li.appendChild(deleteButton);

    document.getElementById("completedTasks").appendChild(li);
  }
}

// Function to mark a task as complete
function completeTask(index) {
  let task = pendingTasks[index];
  task.completed = new Date().toLocaleString();
  pendingTasks.splice(index, 1);
  completedTasks.push(task);
  refreshTaskList();
  updateTaskCount();
}

function pendingTask(index) {
  let task = completedTasks[index];
  task.pending = new Date().toLocaleString();
  completedTasks.splice(index, 1);
 

  pendingTasks.push(task);
  refreshTaskList();
  updateTaskCount();
}

// Function to delete a task
function deleteTask(index, isCompleted = false) {
  if (isCompleted) {
    completedTasks.splice(index, 1);
  } else {
    pendingTasks.splice(index, 1);
  }
  refreshTaskList();
  updateTaskCount();
}

function updateTaskCount() {
  document.getElementById("pendingCount").textContent = pendingTasks.length;
  document.getElementById("completedCount").textContent = completedTasks.length;
}

// Call the refreshTaskList function on page
window.onload = function() {
  refreshTaskList();
  updateTaskCount();
};