'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { deleteTask } from '@/app/actions/taskActions';
import { useToast } from './Toast';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskId: string | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  taskId,
}: DeleteConfirmModalProps) {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !taskId) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteTask(taskId);
      if (res.success) {
        showToast('Task deleted successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(res.error || 'Failed to delete task', 'error');
      }
    } catch (err) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
          <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold">Delete Task</h3>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to delete this task? This action cannot be undone and the task will be permanently removed.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 rounded-lg transition-colors flex items-center gap-2"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
}