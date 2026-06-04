// Task Management App
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const clearCompleted = document.getElementById('clearCompleted');
const filterBtns = document.querySelectorAll('.filter-btn');

// Add task
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  const task = {
    id: Date.now(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  saveTasks();
  taskInput.value = '';
  renderTasks();
}

// Delete task
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

// Toggle task completion
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

// Clear completed tasks
function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  renderTasks();
}

// Filter tasks
function filterTasks(filter) {
  currentFilter = filter;
  renderTasks();
  
  // Update active filter button
  filterBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.filter === filter) {
      btn.classList.add('active');
    }
  });
}

// Render tasks
function renderTasks() {
  let filteredTasks = tasks;
  
  if (currentFilter === 'active') {
    filteredTasks = tasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = tasks.filter(task => task.completed);
  }

  taskList.innerHTML = filteredTasks.map(task => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <input 
        type="checkbox" 
        class="task-checkbox" 
        ${task.completed ? 'checked' : ''}
        onchange="toggleTask(${task.id})"
      />
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="task-delete" onclick="deleteTask(${task.id})">Delete</button>
    </li>
  `).join('');

  // Update count
  const activeCount = tasks.filter(t => !t.completed).length;
  taskCount.textContent = `${activeCount} task${activeCount !== 1 ? 's' : ''}`;
}

// Save to localStorage
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Event listeners
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});
clearCompleted.addEventListener('click', clearCompletedTasks);
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => filterTasks(btn.dataset.filter));
});

// Initial render
renderTasks();
