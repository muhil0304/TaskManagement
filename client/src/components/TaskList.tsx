import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Task, TaskForm } from './TaskForm';

const apiService = api as any;

export const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting State
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [filterPriority, setFilterPriority] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTasks();
      setTasks(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateOrUpdate = async (taskData: any) => {
    try {
      if (editingTask) {
        const updated = await apiService.updateTask(editingTask.id, taskData);
        setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)));
      } else {
        const created = await apiService.createTask(taskData);
        setTasks([created, ...tasks]);
      }
      setIsFormOpen(false);
      setEditingTask(undefined);
    } catch (err: any) {
      throw err;
    }
  };

  const handleToggleStatus = async (task: Task) => {
    try {
      const updatedStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      const updated = await apiService.updateTask(task.id, { status: updatedStatus });
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));
    } catch (err: any) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiService.deleteTask(id);
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error('Failed to delete task', err);
    }
  };

  const openCreateForm = () => {
    setEditingTask(undefined);
    setIsFormOpen(true);
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  // Priority weight helper for sorting
  const getPriorityWeight = (p: 'Low' | 'Medium' | 'High') => {
    if (p === 'High') return 3;
    if (p === 'Medium') return 2;
    return 1;
  };

  // Filter and Sort Logic
  const filteredTasks = tasks
    .filter((task) => {
      const matchesStatus = filterStatus === 'All' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesPriority && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        comparison = getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
      } else {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Tasks</h1>
          <p className="text-sm text-slate-500">Manage, filter, and track your personal tasks.</p>
        </div>
        <button
          onClick={openCreateForm}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 min-h-[44px]"
        >
          <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Task
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="statusFilter" className="text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Status:</label>
            <select
              id="statusFilter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center space-x-2">
            <label htmlFor="priorityFilter" className="text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">Priority:</label>
            <select
              id="priorityFilter"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
          {/* Sorting Controls */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label htmlFor="sortBy" className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sort By:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-slate-300 rounded-md text-xs bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="createdAt">Date Created</option>
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="inline-flex items-center text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none"
              aria-label="Toggle sort order"
            >
              {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
            </button>
          </div>

          <div className="text-xs text-slate-500">
            Showing {filteredTasks.length} of {tasks.length} tasks
          </div>
        </div>
      </div>

      {/* Task Form Modal Overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl overflow-hidden">
            <TaskForm
              task={editingTask}
              onSubmit={handleCreateOrUpdate}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTask(undefined);
              }}
            />
          </div>
        </div>
      )}

      {/* Task List Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-slate-500">Loading your tasks...</p>
        </div>
      ) : error ? (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 text-center">
          {error}
          <button onClick={fetchTasks} className="block mx-auto mt-2 text-xs font-semibold text-indigo-600 hover:underline">
            Try Again
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900">No tasks found</h3>
          <p className="mt-1 text-xs text-slate-500">Get started by creating a new task or adjusting your filters.</p>
          <button
            onClick={openCreateForm}
            className="mt-4 inline-flex items-center px-3.5 py-2 border border-transparent text-xs font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Create Task
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-xl border transition-all duration-150 bg-white shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                task.status === 'Completed' ? 'border-emerald-100 bg-emerald-50/10' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3 min-w-0 flex-1">
                {/* Status Checkbox */}
                <button
                  onClick={() => handleToggleStatus(task)}
                  className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    task.status === 'Completed'
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'border-slate-300 hover:border-indigo-500 bg-white'
                  }`}
                  aria-label={task.status === 'Completed' ? 'Mark task as pending' : 'Mark task as completed'}
                >
                  {task.status === 'Completed' && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Task Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3
                      className={`text-sm font-semibold text-slate-900 truncate ${
                        task.status === 'Completed' ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    
                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.priority === 'High'
                          ? 'bg-red-50 text-red-700 border border-red-100'
                          : task.priority === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : 'bg-slate-50 text-slate-700 border border-slate-100'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status Badge */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`mt-1 text-xs text-slate-500 line-clamp-2 ${task.status === 'Completed' ? 'text-slate-400' : ''}`}>
                      {task.description}
                    </p>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div className="mt-2 flex items-center text-xs text-slate-400">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Due: {new Date(task.dueDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 self-end sm:self-center">
                <button
                  onClick={() => openEditForm(task)}
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Edit task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Delete task"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};