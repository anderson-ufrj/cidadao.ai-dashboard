'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [apiStatus, setApiStatus] = useState<'online' | 'degraded' | 'offline'>('online');

  // Check API status
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('/api/metrics');
        const data = await response.json();
        if (data.summary?.backendStatus === 'healthy') {
          setApiStatus('online');
        } else if (data.summary?.backendStatus === 'degraded') {
          setApiStatus('degraded');
        } else {
          setApiStatus('offline');
        }
      } catch {
        setApiStatus('offline');
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const initialTheme = (savedTheme as 'light' | 'dark') || systemTheme;
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const getStatusColor = () => {
    switch (apiStatus) {
      case 'online':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
        return 'bg-red-500';
    }
  };

  const getStatusText = () => {
    switch (apiStatus) {
      case 'online':
        return 'Online';
      case 'degraded':
        return 'Parcial';
      case 'offline':
        return 'Offline';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Cidadão.AI Monitor"
          >
            <Image
              src="/forum-icon.png"
              alt="Fórum Grego"
              width={40}
              height={40}
              className="rounded-lg shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 via-yellow-500 to-blue-600 bg-clip-text text-transparent">
                Cidadão.AI
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Monitor de Sistema
              </span>
            </div>
          </Link>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* API Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse`} />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                API Railway: {getStatusText()}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              aria-label={theme === 'light' ? 'Mudar para modo escuro' : 'Mudar para modo claro'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}