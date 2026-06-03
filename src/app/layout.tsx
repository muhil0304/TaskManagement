import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'TaskManagement - Personal Task Manager',
  description: 'A production-ready, highly responsive Personal Task Management Application.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 antialiased">
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
                    T
                  </div>
                  <div>
                    <h1 className="font-bold text-slate-900 dark:text-white leading-none">TaskFlow</h1>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Personal Task Manager</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                    Enterprise Grade v1.0
                  </span>
                </div>
              </div>
            </header>
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
                <p>Built with Next.js, Tailwind CSS, TypeScript, Prisma & SQLite.</p>
              </div>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}