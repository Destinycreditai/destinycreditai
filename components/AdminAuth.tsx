'use client';

import { useState } from 'react';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple authentication (in production, use proper auth)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pure-white">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-primary-black tracking-tight">
              Admin Login
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 leading-relaxed">
              Access the admin panel
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 bg-pure-white text-primary-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary-black mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:border-primary-green focus:ring-2 focus:ring-primary-green focus:ring-opacity-20 bg-pure-white text-primary-black"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary-green hover:bg-green-700 text-pure-white py-3 px-4 rounded-lg font-medium transition-colors tracking-tight"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-pure-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-primary-black tracking-tight">Admin Panel</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-pure-white px-4 py-2 rounded-lg font-medium transition-colors tracking-tight"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}