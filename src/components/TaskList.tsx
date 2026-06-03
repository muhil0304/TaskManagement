import React from 'react';
import { ClipboardList, Plus } from 'lucide-react';
import { Task } from '@/types';
import TaskCard from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onAddTaskClick: () => void;
}

export default function TaskList({
  tasks,
  isLoading,
  onToggleComplete,
  onEdit,
  onDelete,
  onAddTaskClick,
}: TaskListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="flex h-48 animate-pulse flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900/50"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded bg-slate-200 dark:bg-slate-800" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16 px-4 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="rounded-full bg-slate-50 p-4 dark:bg-slate-950">
          <ClipboardList className="h-10 w-10 text-slate-400 dark:text-slate-600" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          No tasks found
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Get started by creating your first task or try adjusting your search filters.
        </p>
        <button
          onClick={onAddTaskClick}
          className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create a Task
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}