'use client';

import React from 'react';
import { CheckCircle2, Clock, ListTodo, Calendar } from 'lucide-react';

interface Stats {
  total: number;
  completed: number;
  pending: number;
  dueToday: number;
}

interface DashboardStatsProps {
  stats: Stats;
  loading?: boolean;
}

export default function DashboardStats({ stats, loading = false }: DashboardStatsProps) {
  const cards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-100 dark:border-blue-900/50',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-100 dark:border-emerald-900/50',
    },
    {
      title: 'Pending / In Progress',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-100 dark:border-amber-900/50',
    },
    {
      title: 'Due Today',
      value: stats.dueToday,
      icon: Calendar,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/30',
      border: 'border-rose-100 dark:border-rose-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`p-4 rounded-xl border ${card.bg} ${card.border} flex items-center justify-between transition-all duration-200 hover:shadow-sm`}
          >
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {card.title}
              </p>
              {loading ? (
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mt-1" />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {card.value}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm ${card.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}