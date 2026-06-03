import React from 'react';
import { Calendar, Edit2, Trash2, CheckSquare, Square, Tag } from 'lucide-react';
import { Task } from '@/types';
import Badge from './ui/Badge';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  const isCompleted = task.status === 'Completed';

  // Format due date
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Check if task is overdue
  const isOverdue = () => {
    if (!task.dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="warning">In Progress</Badge>;
      default:
        return <Badge variant="info">To Do</Badge>;
    }
  };

  // Get priority badge variant
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'High':
        return <Badge variant="danger">High</Badge>;
      case 'Medium':
        return <Badge variant="warning">Medium</Badge>;
      default:
        return <Badge variant="neutral">Low</Badge>;
    }
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-900 ${
        isCompleted
          ? 'border-slate-100 bg-slate-50/50 dark:border-slate-800/50 dark:bg-slate-950/20'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
      }`}
    >
      <div className="space-y-3">
        {/* Header: Checkbox + Title + Actions */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => onToggleComplete(task)}
              className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {isCompleted ? (
                <CheckSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
              ) : (
                <Square className="h-5 w-5" />
              )}
            </button>
            <div className="space-y-1">
              <h4
                className={`font-semibold text-slate-900 dark:text-white transition-all ${
                  isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}
              >
                {task.title}
              </h4>
              {task.description && (
                <p
                  className={`text-sm text-slate-500 dark:text-slate-400 line-clamp-2 ${
                    isCompleted ? 'text-slate-400/80 dark:text-slate-500/80' : ''
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
              aria-label="Edit task"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Badges & Metadata */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {getStatusBadge(task.status)}
          {getPriorityBadge(task.priority)}
          {task.category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200">
              <Tag className="h-3 w-3" />
              {task.category}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Due Date */}
      {task.dueDate && (
        <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs font-medium dark:border-slate-800/50">
          <Calendar
            className={`h-3.5 w-3.5 ${
              isOverdue()
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <span
            className={
              isOverdue()
                ? 'text-rose-600 dark:text-rose-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400'
            }
          >
            {isOverdue() ? 'Overdue: ' : 'Due: '}
            {formatDate(task.dueDate)}
          </span>
        </div>
      )}
    </div>
  );
}