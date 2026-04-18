// ==================== STATE ====================
let pendingTasks = [];
let completedTasks = [];
let currentFilter = 'all';
let searchQuery = '';
let selectedPriority = 'none';

// ==================== DOM ====================
const taskInput = document.getElementById('taskInput');
const dueDateInput = document.getElementById('dueDateInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const pendingCountEl = document.getElementById('pendingCount');
const completedCountEl = document.getElementById('completedCount');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const toastContainer = document.getElementById('toastContainer');
const confettiCanvas = document.getElementById('confettiCanvas');
const ctx = confettiCanvas.getContext('2d');

// ==================== PRIORITY PICKER ====================
document.getElementById('priorityPicker').addEventListener('click', (e) => {
  const btn = e.target.closest('.priority-btn');
  if (!btn) return;
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedPriority = btn.dataset.priority;
});

// ==================== FILTER TABS ====================
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    refreshTaskList();
  });
});

// ==================== SEARCH ====================
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  searchClear.style.display = searchQuery ? 'flex' : 'none';
  refreshTaskList();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClear.style.display = 'none';
  refreshTaskList();
});

// ==================== CLEAR DONE ====================
document.getElementById('clearDoneBtn').addEventListener('click', () => {
  if (completedTasks.length === 0) {
    showToast('No completed tasks to clear', 'info');
    return;
  }
  const count = completedTasks.length;
  completedTasks = [];
  saveTasks();
  refreshTaskList();
  updateTaskCount();
  showToast(`Cleared ${count} completed task${count > 1 ? 's' : ''}`, 'success');
});

// ==================== ADD TASK ====================
function addTask(e) {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  pendingTasks.push({
    id: Date.now(),
    task: text,
    added: new Date().toISOString(),
    completed: null,
    priority: selectedPriority,
    dueDate: dueDateInput.value || null
  });

  taskInput.value = '';
  dueDateInput.value = '';
  selectedPriority = 'none';
  document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.priority-btn[data-priority="none"]').classList.add('active');

  saveTasks();
  refreshTaskList();
  updateTaskCount();
  showToast('Task added', 'success');
  taskInput.focus();
}

// ==================== REFRESH TASK LIST ====================
function refreshTaskList() {
  taskList.querySelectorAll('.task-item').forEach(el => el.remove());

  let tasksToShow = [];

  if (currentFilter === 'all' || currentFilter === 'pending') {
    pendingTasks.forEach((task, i) => {
      tasksToShow.push({ ...task, index: i, isCompleted: false });
    });
  }

  if (currentFilter === 'all' || currentFilter === 'completed') {
    completedTasks.forEach((task, i) => {
      tasksToShow.push({ ...task, index: i, isCompleted: true });
    });
  }

  // Search filter
  if (searchQuery) {
    tasksToShow = tasksToShow.filter(t => t.task.toLowerCase().includes(searchQuery));
  }

  // Sort: high priority first, then medium, then low, then none
  const priorityOrder = { high: 0, medium: 1, low: 2, none: 3 };
  tasksToShow.sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1;
    return (priorityOrder[a.priority] || 3) - (priorityOrder[b.priority] || 3);
  });

  emptyState.style.display = tasksToShow.length === 0 ? 'flex' : 'none';

  tasksToShow.forEach((task, i) => {
    const el = createTaskElement(task, i);
    taskList.appendChild(el);
  });
}

// ==================== CREATE TASK ELEMENT ====================
function createTaskElement(task, animIndex) {
  const div = document.createElement('div');
  let classes = 'task-item';
  if (task.isCompleted) classes += ' completed';
  if (task.priority && task.priority !== 'none') classes += ` priority-${task.priority}`;
  div.className = classes;
  div.style.animationDelay = `${animIndex * 0.04}s`;
  div.dataset.id = task.id;
  div.dataset.index = task.index;
  div.dataset.completed = task.isCompleted;

  // Drag & drop
  div.draggable = !task.isCompleted;
  div.addEventListener('dragstart', handleDragStart);
  div.addEventListener('dragover', handleDragOver);
  div.addEventListener('dragleave', handleDragLeave);
  div.addEventListener('drop', handleDrop);
  div.addEventListener('dragend', handleDragEnd);

  const date = new Date(task.isCompleted ? task.completed : task.added);
  const timeStr = formatTime(date);

  // Build meta badges
  let metaHtml = `<span class="task-time">${task.isCompleted ? 'Done' : 'Added'} ${timeStr}</span>`;

  if (task.priority && task.priority !== 'none') {
    metaHtml += `<span class="priority-badge ${task.priority}">${task.priority}</span>`;
  }

  if (task.dueDate && !task.isCompleted) {
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = due < today;
    const dueStr = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    metaHtml += `<span class="due-badge ${isOverdue ? 'overdue' : ''}">
      <span class="material-symbols-rounded">schedule</span>
      ${isOverdue ? 'Overdue' : 'Due'} ${dueStr}
    </span>`;
  }

  div.innerHTML = `
    <div class="task-checkbox" onclick="${task.isCompleted
      ? `markPending(${task.index})`
      : `completeTask(${task.index})`}">
      <span class="material-symbols-rounded">check</span>
    </div>
    <div class="task-content">
      <div class="task-text">${escapeHtml(task.task)}</div>
      <div class="task-meta">${metaHtml}</div>
    </div>
    <div class="task-actions">
      ${!task.isCompleted ? `
        <button class="action-btn edit" onclick="editTask(${task.index})">
          <span class="material-symbols-rounded">edit</span> Edit
        </button>
      ` : ''}
      ${task.isCompleted ? `
        <button class="action-btn undo" onclick="markPending(${task.index})">
          <span class="material-symbols-rounded">undo</span> Undo
        </button>
      ` : ''}
      <button class="action-btn delete" onclick="deleteTask(${task.index}, ${task.isCompleted})">
        <span class="material-symbols-rounded">delete</span> Delete
      </button>
    </div>
  `;

  return div;
}

// ==================== INLINE EDIT ====================
function editTask(index) {
  const task = pendingTasks[index];
  const items = taskList.querySelectorAll('.task-item:not(.completed)');
  let targetEl = null;
  let count = 0;
  for (const item of items) {
    if (parseInt(item.dataset.index) === index && item.dataset.completed === 'false') {
      targetEl = item;
      break;
    }
  }
  if (!targetEl) return;

  const contentEl = targetEl.querySelector('.task-content');
  const oldText = task.task;
  contentEl.innerHTML = `<input class="task-edit-input" type="text" value="${escapeHtml(oldText)}">`;

  const input = contentEl.querySelector('.task-edit-input');
  input.focus();
  input.select();

  function save() {
    const newText = input.value.trim();
    if (newText && newText !== oldText) {
      pendingTasks[index].task = newText;
      saveTasks();
      showToast('Task updated', 'info');
    }
    refreshTaskList();
  }

  input.addEventListener('blur', save);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
    if (e.key === 'Escape') { input.value = oldText; input.blur(); }
  });
}

// ==================== COMPLETE / PENDING / DELETE ====================
function completeTask(index) {
  const item = getTaskItemByIndex(index, false);
  if (item) {
    item.classList.add('completing');
    setTimeout(() => doComplete(index), 400);
  } else {
    doComplete(index);
  }
}

function doComplete(index) {
  const task = pendingTasks[index];
  task.completed = new Date().toISOString();
  pendingTasks.splice(index, 1);
  completedTasks.push(task);
  saveTasks();
  refreshTaskList();
  updateTaskCount();
  showToast('Task completed!', 'success');

  // Confetti if all done
  if (pendingTasks.length === 0 && completedTasks.length > 0) {
    launchConfetti();
  }
}

function markPending(index) {
  const task = completedTasks[index];
  task.completed = null;
  completedTasks.splice(index, 1);
  pendingTasks.push(task);
  saveTasks();
  refreshTaskList();
  updateTaskCount();
  showToast('Task moved to pending', 'info');
}

function deleteTask(index, isCompleted = false) {
  const item = getTaskItemByIndex(index, isCompleted);
  const doDelete = () => {
    if (isCompleted) completedTasks.splice(index, 1);
    else pendingTasks.splice(index, 1);
    saveTasks();
    refreshTaskList();
    updateTaskCount();
    showToast('Task deleted', 'error');
  };

  if (item) {
    item.classList.add('removing');
    setTimeout(doDelete, 280);
  } else {
    doDelete();
  }
}

function getTaskItemByIndex(index, isCompleted) {
  const items = taskList.querySelectorAll('.task-item');
  for (const item of items) {
    if (parseInt(item.dataset.index) === index &&
        (item.dataset.completed === String(isCompleted))) {
      return item;
    }
  }
  return null;
}

// ==================== DRAG & DROP ====================
let draggedItem = null;

function handleDragStart(e) {
  draggedItem = this;
  this.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  if (this !== draggedItem && !this.classList.contains('completed')) {
    this.classList.add('drag-over');
  }
}

function handleDragLeave() {
  this.classList.remove('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  this.classList.remove('drag-over');
  if (this === draggedItem || this.classList.contains('completed')) return;

  const fromIdx = parseInt(draggedItem.dataset.index);
  const toIdx = parseInt(this.dataset.index);
  if (isNaN(fromIdx) || isNaN(toIdx)) return;

  const [moved] = pendingTasks.splice(fromIdx, 1);
  pendingTasks.splice(toIdx, 0, moved);
  saveTasks();
  refreshTaskList();
}

function handleDragEnd() {
  this.classList.remove('dragging');
  taskList.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
  draggedItem = null;
}

// ==================== PROGRESS BAR ====================
function updateProgress() {
  const total = pendingTasks.length + completedTasks.length;
  const pct = total === 0 ? 0 : Math.round((completedTasks.length / total) * 100);
  progressFill.style.width = pct + '%';
  progressText.textContent = pct + '%';
}

// ==================== COUNTERS ====================
function updateTaskCount() {
  animateCount(pendingCountEl, pendingTasks.length);
  animateCount(completedCountEl, completedTasks.length);
  updateProgress();
}

function animateCount(el, target) {
  const current = parseInt(el.textContent) || 0;
  if (current === target) return;
  el.style.transform = 'scale(1.3)';
  el.style.transition = 'transform 0.2s ease';
  el.textContent = target;
  setTimeout(() => { el.style.transform = 'scale(1)'; }, 200);
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info') {
  const iconMap = {
    success: 'check_circle',
    error: 'delete',
    info: 'info'
  };

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="material-symbols-rounded toast-icon ${type}">${iconMap[type]}</span>
    <span class="toast-msg">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==================== CONFETTI ====================
function launchConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#7c3aed', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#a78bfa'];

  for (let i = 0; i < 120; i++) {
    particles.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 4 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.rotation += p.rotSpeed;

      if (frame > 60) p.opacity -= 0.008;
      if (p.opacity <= 0) return;
      alive = true;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation * Math.PI / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    if (alive) requestAnimationFrame(animate);
    else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }

  animate();
}

// ==================== UTILITIES ====================
function formatTime(date) {
  const now = new Date();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ==================== PERSISTENCE ====================
function saveTasks() {
  localStorage.setItem('taskflow_pending', JSON.stringify(pendingTasks));
  localStorage.setItem('taskflow_completed', JSON.stringify(completedTasks));
}

function loadTasks() {
  try {
    const p = localStorage.getItem('taskflow_pending');
    const c = localStorage.getItem('taskflow_completed');
    if (p) pendingTasks = JSON.parse(p);
    if (c) completedTasks = JSON.parse(c);
  } catch {
    pendingTasks = [];
    completedTasks = [];
  }
}

// ==================== INIT ====================
window.onload = function () {
  loadTasks();
  refreshTaskList();
  updateTaskCount();
};

// Refresh relative times every minute
setInterval(() => {
  if (document.querySelectorAll('.task-item').length > 0) {
    refreshTaskList();
  }
}, 60000);
