import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Trash2, 
  Edit2, 
  Plus, 
  Calendar, 
  AlertCircle, 
  Filter, 
  ArrowUpDown, 
  Check, 
  X,
  Clock,
  ListTodo
} from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Filter and Sort state
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed'
  const [sortBy, setSortBy] = useState('created_at'); // 'created_at', 'due_date', 'priority'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Could not connect to the server. Please make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Create or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const taskData = {
      title: title.trim(),
      description,
      priority,
      due_date: dueDate || null
    };

    try {
      if (editingTaskId) {
        // Update
        const response = await fetch(`/api/tasks/${editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to update task');
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === editingTaskId ? updatedTask : t));
        setEditingTaskId(null);
      } else {
        // Create
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (!response.ok) throw new Error('Failed to create task');
        const newTask = await response.json();
        setTasks([newTask, ...tasks]);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle Edit click
  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.due_date || '');
  };

  // Cancel Edit
  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  // Toggle Status (Single Click)
  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedTask = await response.json();
      setTasks(tasks.map(t => t.id === task.id ? updatedTask : t));
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter(t => t.id !== id));
      if (editingTaskId === id) {
        handleCancelEdit();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Check if task is overdue
  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  // Priority weight for sorting
  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1
  };

  // Filter and Sort tasks
  const filteredTasks = tasks.filter(task => {
    if (statusFilter === 'all') return true;
    return task.status === statusFilter;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'due_date') {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      comparison = new Date(a.due_date) - new Date(b.due_date);
    } else if (sortBy === 'priority') {
      comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
    } else {
      // Default: created_at
      comparison = new Date(a.created_at) - new Date(b.created_at);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Task counts
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white p-2 rounded-lg shadow-md shadow-indigo-100">
              <ListTodo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">TaskFlow</h1>
              <p className="text-xs text-slate-500">Manage your daily tasks efficiently</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-3 text-sm">
            <div className="bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-medium">
              Total: <span className="text-slate-900 font-bold">{totalTasks}</span>
            </div>
            <div className="bg-amber-50 px-3 py-1.5 rounded-full text-amber-700 font-medium border border-amber-100">
              Pending: <span className="text-amber-900 font-bold">{pendingTasks}</span>
            </div>
            <div className="bg-emerald-50 px-3 py-1.5 rounded-full text-emerald-700 font-medium border border-emerald-100">
              Completed: <span className="text-emerald-900 font-bold">{completedTasks}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                {editingTaskId ? (
                  <>
                    <Edit2 className="w-5 h-5 text-indigo-600" />
                    Edit Task
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-indigo-600" />
                    Create New Task
                  </>
                )}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Finish project proposal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Add some details about this task..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all bg-white"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  {editingTaskId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-sm shadow-indigo-100 transition-all flex items-center justify-center gap-1.5"
                  >
                    {editingTaskId ? (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Task
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Task List */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filters & Sorting Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Filter:</span>
                <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1 rounded-md transition-all ${statusFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1 rounded-md transition-all ${statusFilter === 'pending' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-3 py-1 rounded-md transition-all ${statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="created_at">Date Created</option>
                  <option value="due_date">Due Date</option>
                  <option value="priority">Priority</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <span className="text-xs font-bold uppercase px-1">{sortOrder}</span>
                </button>
              </div>
            </div>

            {/* Tasks List */}
            {loading ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-500 text-sm">Loading tasks...</p>
              </div>
            ) : sortedTasks.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">No tasks found</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">
                  {statusFilter === 'all' 
                    ? "Get started by creating your first task using the form on the left."
                    : `No tasks match the "${statusFilter}" filter.`}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedTasks.map((task) => {
                  const overdue = isOverdue(task.due_date, task.status);
                  const isHighPriority = task.priority === 'high';
                  const isCompleted = task.status === 'completed';

                  return (
                    <div
                      key={task.id}
                      className={`bg-white rounded-xl border transition-all duration-200 shadow-sm hover:shadow-md flex items-start gap-4 p-4 ${
                        isCompleted ? 'opacity-65 border-slate-200 bg-slate-50/50' : 
                        overdue ? 'border-red-200 bg-red-50/10' : 
                        isHighPriority ? 'border-amber-200' : 'border-slate-200'
                      }`}
                    >
                      {/* Status Toggle Checkbox (Single Click) */}
                      <button
                        onClick={() => handleToggleStatus(task)}
                        className="mt-0.5 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
                        title={isCompleted ? "Mark as pending" : "Mark as completed"}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-300 hover:border-indigo-500" />
                        )}
                      </button>

                      {/* Task Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className={`font-semibold text-slate-900 text-sm sm:text-base break-words ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {task.title}
                          </h3>
                          
                          {/* Badges */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Priority Badge */}
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        {task.description && (
                          <p className={`text-xs sm:text-sm text-slate-500 mb-3 break-words whitespace-pre-line ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                            {task.description}
                          </p>
                        )}

                        {/* Footer info */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                          {task.due_date && (
                            <div className={`flex items-center gap-1 font-medium ${overdue ? 'text-red-600 font-semibold' : 'text-slate-500'}`}>
                              {overdue ? (
                                <AlertCircle className="w-3.5 h-3.5" />
                              ) : (
                                <Calendar className="w-3.5 h-3.5" />
                              )}
                              <span>Due: {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {overdue && <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ml-1">Overdue</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0 self-center">
                        <button
                          onClick={() => handleEditClick(task)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                          title="Edit Task"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;