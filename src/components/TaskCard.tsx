'use client';

import React from 'react';
import { Calendar, Edit2, Trash2, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useToast } from './Toast';
import { toggleTaskStatus } from '@/app/actions/taskActions';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  category: string;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange?: () => void;
}

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }: TaskCardProps) {
  const { showToast } = useToast();
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggleStatus = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      const res = await toggleTaskStatus(task.id, task.status);
      if (res.success) {
        showToast(
          `Task marked as ${res.data?.status === 'COMPLETED' ? 'completed' : 'pending'}`,
          'success'
        );
        if (onStatusChange) onStatusChange();
      } else {
        showToast(res.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsToggling(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50';
      case 'LOW':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-900/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50';
      case 'IN_PROGRESS':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <button
              onClick={handleToggleStatus}
              disabled={isToggling}
              className="mt-1 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors focus:outline-none"
              aria-label={task.status === 'COMPLETED' ? 'Mark as pending' : 'Mark as completed'}
            >
              {task.status === 'COMPLETED' ? (
                <CheckCircle className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/30" />
              ) : (
                <Circle className="w-5 h-5" />
              )}
            </button>
            <div>
              <h3
                className={`font-semibold text-gray-900 dark:text-white leading-snug ${
                  task.status === 'COMPLETED' ? 'line-through text-gray-400 dark:text-gray-500' : ''
                }`}
              >
                {task.title}
              </h3>
              <span className="inline-block text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 mt-0.5">
                {task.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Edit task"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 pl-7">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 pl-7">
        <div className="flex flex-wrap gap-1.5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getStatusColor(task.status)}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isOverdue
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}