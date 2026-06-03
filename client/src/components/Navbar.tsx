import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onNavigate?: (view: 'tasks' | 'profile') => void;
  currentView?: 'tasks' | 'profile';
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView = 'tasks' }) => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate?.('tasks')}>
              <svg
                className="h-8 w-8 text-indigo-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <span className="ml-2 text-xl font-bold text-gray-900 tracking-tight">TaskFlow</span>
            </div>
            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
                <button
                  onClick={() => onNavigate?.('tasks')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                    currentView === 'tasks'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  My Tasks
                </button>
              </div>
            )}
          </div>

          {user ? (
            <div className="hidden sm:flex sm:items-center sm:space-x-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-150"
              >
                Sign Out
              </button>
            </div>
          ) : null}

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            {user && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset-2 focus:ring-indigo-500"
                aria-controls="mobile-menu"
                aria-expanded={isOpen}
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && user && (
        <div className="sm:hidden border-b border-gray-200 bg-white" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1 px-4">
            <button
              onClick={() => {
                onNavigate?.('tasks');
                setIsOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                currentView === 'tasks'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              My Tasks
            </button>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200 px-4">
            <div className="flex items-center">
              <div>
                <div className="text-base font-medium text-gray-800">{user.username}</div>
                <div className="text-sm font-medium text-gray-500">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};