'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Task, TaskFilters as TaskFiltersType, TaskStats as TaskStatsType } from '@/types';
import TaskStats from '@/components/TaskStats';
import TaskFilters from '@/components/TaskFilters';
import TaskList from '@/components/TaskList';
import TaskFormModal from '@/components/TaskFormModal';

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<TaskFiltersType>({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (filters.status !== 'all') queryParams.append('status', filters.status);
      if (filters.priority !== 'all') queryParams.append('priority', filters.priority);
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.search.trim() !== '') queryParams.append('search', filters.search.trim());

      const res = await fetch(`/api/tasks?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const json = await res.json();
      setTasks(json.data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Get unique categories for filter dropdown
  const categories = React.useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((task) => {
      if (task.category) cats.add(task.category);
    });
    return Array.from(cats);
  }, [tasks]);

  // Calculate stats based on all tasks
  const stats = React.useMemo<TaskStatsType>(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
      pending: tasks.filter((t) => t.status !== 'Completed').length,
      dueToday: tasks.filter((t) => {
        if (!t.dueDate || t.status === 'Completed') return false;
        return t.dueDate.split('T')[0] === todayStr;
      }).length,
    };
  }, [tasks]);

  // Toggle task completion status
  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed';
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update task status');

      const updated = await res.json();
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? updated.data : t))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  // Create or Update task
  const handleFormSubmit = async (data: Partial<Task>) => {
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || 'Failed to save task');
    }

    const saved = await res.json();

    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) => (t.id === editingTask.id ? saved.data : t))
      );
    } else {
      setTasks((prev) => [saved.data, ...prev]);
    }
  };

  // Delete task
  const handleDeleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const errJson = await res.json();
      throw new Error(errJson.error || 'Failed to delete task');
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleAddTaskClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your tasks, track progress, and stay organized.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchTasks}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-950/50 disabled:opacity-50"
            aria-label="Refresh tasks"
          >
            <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddTaskClick}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <TaskStats stats={stats} />

      {/* Filters Section */}
      <TaskFilters
        filters={filters}
        onFilterChange={setFilters}
        categories={categories}
      />

      {/* Error Alert */}
      {error && (
        <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* Task List */}
      <TaskList
        tasks={tasks}
        isLoading={isLoading}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditClick}
        onDelete={handleDeleteTask}
        onAddTaskClick={handleAddTaskClick}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        task={editingTask}
      />
    </div>
  );
}