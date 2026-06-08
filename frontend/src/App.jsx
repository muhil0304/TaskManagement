import React, { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Search,
  X,
  Check,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function App() {
  // State
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting State
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [searchQuery, setSearchQuery] = useState('');

  // View Mode State
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  });
  const [formError, setFormError] = useState('');

  // Fetch tasks from API
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPriority !== 'all') params.append('priority', filterPriority);
      params.append('sortBy', sortBy);
      params.append('order', sortOrder);

      const response = await fetch(`/api/tasks?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while fetching tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch tasks on filter/sort change
  useEffect(() => {
    fetchTasks();
  }, [filterStatus, filterPriority, sortBy, sortOrder]);

  // Handle open modal for create
  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      priority: 'medium',
      due_date: ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Handle open modal for edit
  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      due_date: task.due_date || ''
    });
    setFormError('');
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setFormError('');
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Title is required');
      return;
    }

    try {
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save task');
      }

      fetchTasks();
      closeModal();
    } catch (err) {
      setFormError(err.message);
    }
  };

  // Handle quick status update
  const handleQuickStatusUpdate = async (task, newStatus) => {
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      fetchTasks();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Handle delete task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      fetchTasks();
    } catch (err) {
      alert('Error deleting task: ' + err.message);
    }
  };

  // Filter tasks by search query (client-side search)
  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      (task.description && task.description.toLowerCase().includes(query))
    );
  });

  // Stats calculations
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length
  };

  // Helper to check if task is overdue
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Helper to format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-violet-700 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-indigo-600 p-2.5 rounded-xl shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">TaskFlow</h1>
              <p className="text-indigo-100 text-sm">Streamline your daily productivity</p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-5 py-2.5 rounded-xl shadow transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Create New Task
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-indigo-50 text-indigo-600 p-3 rounded-xl">
              <List className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pending}</p>
            </div>
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.inProgress}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completed}</p>
            </div>
            <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Filters & Controls */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8 flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tasks by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl self-start lg:self-auto">
              <button
                onClick={() => setViewMode('board')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'board'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Board View
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
                List View
              </button>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Advanced Filters & Sorting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Priority Filter */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</label>
              <div className="relative">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <Filter className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Sort By */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sort By</label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="created_at">Creation Date</option>
                  <option value="due_date">Due Date</option>
                </select>
                <ArrowUpDown className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Order</label>
              <button
                onClick={() => setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')}
                className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 flex items-center justify-between transition-all"
              >
                <span>{sortOrder === 'ASC' ? 'Ascending' : 'Descending'}</span>
                <ArrowUpDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </section>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl mb-8 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold">Error Loading Tasks</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchTasks}
                className="mt-3 text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1.5 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center max-w-md mx-auto shadow-sm">
            <div className="bg-indigo-50 text-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No tasks found</h3>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery
                ? "We couldn't find any tasks matching your search query."
                : "Get started by creating your first task to stay on top of your goals!"}
            </p>
            {!searchQuery && (
              <button
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-all"
              >
                <Plus className="w-5 h-5" />
                Create Task
              </button>
            )}
          </div>
        ) : viewMode === 'board' ? (
          /* Board View (Kanban) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Pending Column */}
            <BoardColumn
              title="Pending"
              count={filteredTasks.filter((t) => t.status === 'pending').length}
              colorClass="border-t-4 border-t-gray-400 bg-gray-100/50"
              badgeColor="bg-gray-200 text-gray-800"
              tasks={filteredTasks.filter((t) => t.status === 'pending')}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleQuickStatusUpdate}
              isOverdue={isOverdue}
              formatDate={formatDate}
            />

            {/* In Progress Column */}
            <BoardColumn
              title="In Progress"
              count={filteredTasks.filter((t) => t.status === 'in_progress').length}
              colorClass="border-t-4 border-t-blue-500 bg-blue-50/30"
              badgeColor="bg-blue-100 text-blue-800"
              tasks={filteredTasks.filter((t) => t.status === 'in_progress')}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleQuickStatusUpdate}
              isOverdue={isOverdue}
              formatDate={formatDate}
            />

            {/* Completed Column */}
            <BoardColumn
              title="Completed"
              count={filteredTasks.filter((t) => t.status === 'completed').length}
              colorClass="border-t-4 border-t-emerald-500 bg-emerald-50/20"
              badgeColor="bg-emerald-100 text-emerald-800"
              tasks={filteredTasks.filter((t) => t.status === 'completed')}
              onEdit={openEditModal}
              onDelete={handleDeleteTask}
              onStatusChange={handleQuickStatusUpdate}
              isOverdue={isOverdue}
              formatDate={formatDate}
            />
          </div>
        ) : (
          /* List View */
          <div className="flex flex-col gap-4">
            {filteredTasks.map((task) => (
              <TaskListCard
                key={task.id}
                task={task}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onStatusChange={handleQuickStatusUpdate}
                isOverdue={isOverdue}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal (Create / Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              {formError && (
                <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Design landing page"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Provide some details about this task..."
                  rows="3"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                {/* Priority */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Due Date</label>
                <div className="relative">
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                    className="w-full border border-gray-200 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer"
                  />
                  <Calendar className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow transition-all"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Board Column Component
function BoardColumn({
  title,
  count,
  colorClass,
  badgeColor,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  isOverdue,
  formatDate
}) {
  return (
    <div className={`flex flex-col rounded-2xl p-4 border border-gray-200/60 shadow-sm min-h-[500px] ${colorClass}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
          {title}
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}>
            {count}
          </span>
        </h3>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-1">
        {tasks.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
            No tasks here
          </div>
        ) : (
          tasks.map((task) => (
            <TaskBoardCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              isOverdue={isOverdue}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Task Card for Board View
function TaskBoardCard({ task, onEdit, onDelete, onStatusChange, isOverdue, formatDate }) {
  const overdue = isOverdue(task.due_date, task.status);

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-red-50 text-red-700 border-red-100'
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            className="p-1 text-gray-400 hover:text-indigo-600 rounded hover:bg-gray-50 transition-all"
            title="Edit Task"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-gray-50 transition-all"
            title="Delete Task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <h4 className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">{task.title}</h4>
      {task.description && (
        <p className="text-gray-500 text-xs line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex flex-col gap-2.5 pt-2.5 border-t border-gray-50">
        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-xs ${overdue ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
          {overdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
          <span>{formatDate(task.due_date)}</span>
          {overdue && <span className="text-[10px] uppercase tracking-wider bg-red-100 px-1.5 py-0.5 rounded">Overdue</span>}
        </div>

        {/* Quick Status Actions */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Move to:</span>
          <div className="flex gap-1">
            {task.status !== 'pending' && (
              <button
                onClick={() => onStatusChange(task, 'pending')}
                className="text-[10px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-all"
              >
                Pending
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={() => onStatusChange(task, 'in_progress')}
                className="text-[10px] font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-all"
              >
                In Progress
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={() => onStatusChange(task, 'completed')}
                className="text-[10px] font-medium bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded transition-all flex items-center gap-0.5"
              >
                <Check className="w-2.5 h-2.5" />
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Task Card for List View
function TaskListCard({ task, onEdit, onDelete, onStatusChange, isOverdue, formatDate }) {
  const overdue = isOverdue(task.due_date, task.status);

  const priorityColors = {
    low: 'bg-blue-50 text-blue-700 border-blue-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-red-50 text-red-700 border-red-100'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };

  const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed'
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${priorityColors[task.priority]}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-md border ${statusColors[task.status]}`}>
            {statusLabels[task.status]}
          </span>
          {overdue && (
            <span className="text-xs font-semibold bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Overdue
            </span>
          )}
        </div>

        <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{task.title}</h3>
        {task.description && (
          <p className="text-gray-500 text-sm line-clamp-2 mb-3 sm:mb-0">{task.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0">
        {/* Due Date */}
        <div className={`flex items-center gap-1.5 text-sm ${overdue ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
          <Calendar className="w-4 h-4" />
          <span>{formatDate(task.due_date)}</span>
        </div>

        {/* Quick Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400">Status:</span>
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task, e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 ml-auto sm:ml-0">
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-gray-50 transition-all"
            title="Edit Task"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-gray-50 transition-all"
            title="Delete Task"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}