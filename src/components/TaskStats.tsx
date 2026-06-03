import React from 'react';
import { CheckCircle2, Clock, Calendar, ListTodo } from 'lucide-react';
import { TaskStats as TaskStatsType } from '@/types';

interface TaskStatsProps {
  stats: TaskStatsType;
}

export default function TaskStats({ stats }: TaskStatsProps) {
  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-100 dark:border-emerald-900/30',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
      borderColor: 'border-rose-100 dark:border-rose-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`flex flex-col justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${card.borderColor}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                {card.title}
              </span>
              <div className={`rounded-lg p-2 ${card.bgColor}`}>
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2 sm:mt-4">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {card.value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}