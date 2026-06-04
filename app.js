// State Management
let tasks = JSON.parse(localStorage.getItem('kanban-tasks')) || [];
let currentTaskId = null;

// DOM Elements
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const taskIdInput = document.getElementById('task-id');
const taskTitleInput = document.getElementById('task-title');
const taskDescInput = document.getElementById('task-desc');
const taskPriorityInput = document.getElementById('task-priority');
const taskDueDateInput = document.getElementById('task-due-date');
const taskStatusInput = document.getElementById('task-status');

const addTaskBtn = document.getElementById('add-task-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');

const searchInput = document.getElementById('search-input');
const priorityFilter = document.getElementById('priority-filter');

const columns = {
    todo: document.getElementById('todo-list'),
    inprogress: document.getElementById('inprogress-list'),
    done: document.getElementById('done-list')
};

const counts = {
    todo: document.getElementById('todo-count'),
    inprogress: document.getElementById('inprogress-count'),
    done: document.getElementById('done-count')
};

// Event Listeners
addTaskBtn.addEventListener('click', () => openModal());
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);
taskForm.addEventListener('submit', handleFormSubmit);

searchInput.addEventListener('input', renderTasks);
priorityFilter.addEventListener('change', renderTasks);

// Close modal when clicking outside content
taskModal.addEventListener('click', (e) => {
    if (e.target === taskModal) {
        closeModal();
    }
});

// Drag and Drop Setup for Columns
document.querySelectorAll('.kanban-column').forEach(column => {
    column.addEventListener('dragover', handleDragOver);
    column.addEventListener('dragenter', handleDragEnter);
    column.addEventListener('dragleave', handleDragLeave);
    column.addEventListener('drop', handleDrop);
});

// Initialize App
renderTasks();

// Functions

// Save tasks to LocalStorage
function saveTasks() {
    localStorage.setItem('kanban-tasks', JSON.stringify(tasks));
}

// Render all tasks based on filters
function renderTasks() {
    // Clear lists
    Object.values(columns).forEach(list => list.innerHTML = '');

    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedPriority = priorityFilter.value;

    // Filter tasks
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm) || 
                              task.description.toLowerCase().includes(searchTerm);
        const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
        return matchesSearch && matchesPriority;
    });

    // Count trackers
    const columnCounts = { todo: 0, inprogress: 0, done: 0 };

    // Populate columns
    filteredTasks.forEach(task => {
        if (columns[task.status]) {
            const card = createTaskCard(task);
            columns[task.status].appendChild(card);
            columnCounts[task.status]++;
        }
    });

    // Update counts in UI
    Object.keys(counts).forEach(status => {
        counts[status].textContent = columnCounts[status];
    });
}

// Create Task Card Element
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.draggable = true;
    card.dataset.id = task.id;

    // Format date and check if overdue
    let dateHtml = '';
    if (task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const isOverdue = dueDate < today && task.status !== 'done';
        const formattedDate = new Date(task.dueDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        dateHtml = 
            '<div class="due-date ' + (isOverdue ? 'overdue' : '') + '">' +
                '<i class="fa-regular fa-calendar"></i>' +
                '<span>' + formattedDate + (isOverdue ? ' (Overdue)' : '') + '</span>' +
            '</div>';
    } else {
        dateHtml = '<div></div>'; // Empty placeholder to keep flex layout
    }

    card.innerHTML = 
        '<div class="task-card-header">' +
            '<span class="priority-badge priority-' + task.priority + '">' + task.priority + '</span>' +
            '<div class="card-actions">' +
                '<button class="action-btn edit-btn" title="Edit Task">' +
                    '<i class="fa-solid fa-pen"></i>' +
                '</button>' +
                '<button class="action-btn delete-btn" title="Delete Task">' +
                    '<i class="fa-solid fa-trash"></i>' +
                '</button>' +
            '</div>' +
        '</div>' +
        '<h3>' + escapeHTML(task.title) + '</h3>' +
        '<p>' + escapeHTML(task.description || 'No description provided.') + '</p>' +
        '<div class="task-card-footer">' +
            dateHtml +
            '<!-- Quick Move Dropdown for Mobile/Touch Accessibility -->' +
            '<select class="quick-move-select" title="Move Task">' +
                '<option value="todo"' + (task.status === 'todo' ? ' selected' : '') + '>To Do</option>' +
                '<option value="inprogress"' + (task.status === 'inprogress' ? ' selected' : '') + '>In Progress</option>' +
                '<option value="done"' + (task.status === 'done' ? ' selected' : '') + '>Done</option>' +
            '</select>' +
        '</div>';

    // Drag and Drop Events for Card
    card.addEventListener('dragstart', handleDragStart);
    card.addEventListener('dragend', handleDragEnd);

    // Card Action Events
    card.querySelector('.edit-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openModal(task.id);
    });

    card.querySelector('.delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteTask(task.id);
    });

    // Quick Move Dropdown Event
    const select = card.querySelector('.quick-move-select');
    select.addEventListener('change', (e) => {
        const newStatus = e.target.value;
        updateTaskStatus(task.id, newStatus);
    });

    // Prevent drag start when interacting with buttons or select dropdown
    card.querySelectorAll('.action-btn, .quick-move-select').forEach(elem => {
        elem.addEventListener('mousedown', (e) => e.stopPropagation());
        elem.addEventListener('touchstart', (e) => e.stopPropagation());
    });

    return card;
}

// Open Modal (Add or Edit)
function openModal(taskId = null) {
    currentTaskId = taskId;
    if (taskId) {
        modalTitle.textContent = 'Edit Task';
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskDescInput.value = task.description;
            taskPriorityInput.value = task.priority;
            taskDueDateInput.value = task.dueDate || '';
            taskStatusInput.value = task.status;
        }
    } else {
        modalTitle.textContent = 'Add New Task';
        taskForm.reset();
        taskIdInput.value = '';
        taskStatusInput.value = 'todo'; // Default status for new tasks
    }
    taskModal.classList.add('active');
    taskTitleInput.focus();
}

// Close Modal
function closeModal() {
    taskModal.classList.remove('active');
    taskForm.reset();
    currentTaskId = null;
}

// Handle Form Submission
function handleFormSubmit(e) {
    e.preventDefault();

    const id = taskIdInput.value || Date.now().toString();
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();
    const priority = taskPriorityInput.value;
    const dueDate = taskDueDateInput.value;
    const status = taskStatusInput.value;

    if (!title) return;

    const taskData = { id, title, description, priority, dueDate, status };

    if (taskIdInput.value) {
        // Edit existing task
        tasks = tasks.map(t => t.id === id ? taskData : t);
    } else {
        // Add new task
        tasks.push(taskData);
    }

    saveTasks();
    renderTasks();
    closeModal();
}

// Delete Task
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
    }
}

// Update Task Status
function updateTaskStatus(taskId, newStatus) {
    tasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    saveTasks();
    renderTasks();
}

// Drag and Drop Handlers
let draggedCard = null;

function handleDragStart(e) {
    draggedCard = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
}

function handleDragEnd() {
    if (draggedCard) {
        draggedCard.classList.remove('dragging');
        draggedCard = null;
    }
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

// Visual feedback when dragging over columns
function handleDragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function handleDragLeave() {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');
    
    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = this.dataset.status;

    if (taskId && newStatus) {
        updateTaskStatus(taskId, newStatus);
    }
}

// Helper to escape HTML and prevent XSS
function escapeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}