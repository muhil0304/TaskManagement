import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ListTodo,
  CheckCircle2,
  Clock,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    due_date: '',
    status: 'To Do'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch tasks. Please make sure the backend server is running.');
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    
    // Validate
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let response;
      if (modalMode === 'create') {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        response = await fetch(`${API_URL}/${currentTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save task');
      }

      const savedTask = await response.json();

      if (modalMode === 'create') {
        setTasks([savedTask, ...tasks]);
      } else {
        setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
      }

      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update task status');
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${taskToDelete.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setIsDeleteConfirmOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setModalMode('edit');
    setCurrentTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'Medium',
      due_date: task.due_date || '',
      status: task.status || 'To Do'
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      due_date: '',
      status: 'To Do'
    });
    setFormErrors({});
    setCurrentTask(null);
  };

  // Filter and Search Logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    
    return matchesSearch && matchesPriority;
  });

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const todoTasks = tasks.filter(t => t.status === 'To Do').length;
  
  const overdueTasksCount = tasks.filter(t => {
    if (!t.due_date || t.status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(t.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateString, status) => {
    if (!dateString || status === 'Done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const COLUMNS = [
    { id: 'To Do', title: 'To Do', color: 'bg-blue-500', bg: 'bg-blue-50/40', border: 'border-blue-100', text: 'text-blue-700', icon: ListTodo },
    { id: 'In Progress', title: 'In Progress', color: 'bg-amber-500', bg: 'bg-amber-50/40', border: 'border-amber-100', text: 'text-amber-700', icon: Clock },
    { id: 'Done', title: 'Done', color: 'bg-emerald-500', bg: 'bg-emerald-50/40', border: 'border-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 }
  ];

  const PRIORITY_COLORS = {
    High: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
    Medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
    Low: { bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Top Navigation / Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">TaskFlow</h1>
              <p className="text-xs text-slate-500 font-medium">Task Management Board</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={fetchTasks}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh tasks"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between shadow-sm">
            <div className="flex space-x-3">
              <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-rose-800">An error occurred</h3>
                <p className="text-sm text-rose-700 mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ListTodo className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-900">{totalTasks}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">In Progress</p>
              <p className="text-2xl font-bold text-slate-900">{inProgressTasks}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{completedTasks}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${overdueTasksCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Overdue</p>
              <p className={`text-2xl font-bold ${overdueTasksCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{overdueTasksCount}</p>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <div className="flex items-center space-x-2 text-sm text-slate-500 font-medium">
              <Filter className="h-4 w-4" />
              <span>Priority:</span>
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Kanban Board Columns */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
            <p className="text-slate-500 font-medium">Loading your tasks...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {COLUMNS.map(column => {
              const columnTasks = filteredTasks.filter(t => t.status === column.id);
              const IconComponent = column.icon;

              return (
                <div 
                  key={column.id} 
                  className={`rounded-2xl border ${column.border} ${column.bg} p-4 flex flex-col min-h-[500px]`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-lg text-white ${column.color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h3 className="font-bold text-slate-800">{column.title}</h3>
                    </div>
                    <span className="bg-white border border-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards List */}
                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {columnTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-white/50">
                        <p className="text-slate-400 text-sm font-medium text-center">No tasks here</p>
                      </div>
                    ) : (
                      columnTasks.map(task => {
                        const isTaskOverdue = isOverdue(task.due_date, task.status);
                        const priorityStyle = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.Medium;

                        return (
                          <div 
                            key={task.id}
                            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 group relative"
                          >
                            {/* Priority Badge & Actions */}
                            <div className="flex items-center justify-between mb-2.5">
                              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyle.bg}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${priorityStyle.dot}`} />
                                <span>{task.priority}</span>
                              </span>
                              
                              <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEditModal(task)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title="Edit Task"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(task)}
                                  className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Delete Task"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Title & Description */}
                            <h4 className="font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-slate-600 text-sm mb-4 line-clamp-3 whitespace-pre-line">
                                {task.description}
                              </p>
                            )}

                            {/* Due Date & Status Transitions */}
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                              <div className={`flex items-center space-x-1.5 font-medium ${isTaskOverdue ? 'text-rose-600' : 'text-slate-500'}`}>
                                <Calendar className="h-3.5 w-3.5" />
                                <span className={isTaskOverdue ? 'font-semibold' : ''}>
                                  {formatDate(task.due_date)}
                                  {isTaskOverdue && ' (Overdue)'}
                                </span>
                              </div>

                              {/* Quick Status Move Buttons */}
                              <div className="flex items-center space-x-1">
                                {column.id !== 'To Do' && (
                                  <button
                                    onClick={() => handleStatusChange(task, column.id === 'Done' ? 'In Progress' : 'To Do')}
                                    className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-700 transition-colors"
                                    title={`Move to ${column.id === 'Done' ? 'In Progress' : 'To Do'}`}
                                  >
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                  </button>
                                )}
                                {column.id !== 'Done' && (
                                  <button
                                    onClick={() => handleStatusChange(task, column.id === 'To Do' ? 'In Progress' : 'Done')}
                                    className="p-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-slate-500 hover:text-slate-700 transition-colors"
                                    title={`Move to ${column.id === 'To Do' ? 'In Progress' : 'Done'}`}
                                  >
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Create / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-900">
                {modalMode === 'create' ? 'Create New Task' : 'Edit Task Details'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Task Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Design landing page"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ ...formData, title: e.target.value });
                    if (formErrors.title) setFormErrors({ ...formErrors, title: '' });
                  }}
                  className={`w-full px-3.5 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                    formErrors.title ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {formErrors.title && (
                  <p className="text-rose-600 text-xs mt-1 font-medium">{formErrors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Describe the task details, requirements, or notes..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              {modalMode === 'edit' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl font-semibold text-sm shadow-lg shadow-indigo-100 transition-all"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Create Task' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 text-rose-600 mb-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Task</h3>
              <p className="text-sm text-slate-500 mb-6">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{taskToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteConfirmOpen(false);
                    setTaskToDelete(null);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-rose-100 transition-all"
                >
                  Delete Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}