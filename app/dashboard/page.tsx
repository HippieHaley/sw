'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Calendar from '@/components/Calendar';
import PostForm from '@/components/PostForm';
import PostList from '@/components/PostList';
import PlatformManager from '@/components/PlatformManager';
import EmergencyDelete from '@/components/EmergencyDelete';

interface User {
  id: string;
  username: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('calendar');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/');
        return;
      }

      setUser(data.user);
      setLoading(false);
    } catch (error) {
      router.push('/');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-text-header">
                🔒 Secure Platform
              </h1>
              <p className="text-sm text-text-muted">Welcome, {user?.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <EmergencyDelete />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-background-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['calendar', 'posts', 'create', 'platforms'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-primary text-text'
                    : 'border-transparent text-text-muted hover:text-text hover:border-border'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calendar' && <Calendar />}
        {activeTab === 'posts' && <PostList />}
        {activeTab === 'create' && <PostForm />}
        {activeTab === 'platforms' && <PlatformManager />}
      </main>

      {/* Footer */}
      <footer className="bg-background-elevated border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-text-muted">
            All data is encrypted • Metadata automatically removed • No tracking
          </p>
        </div>
      </footer>
    </div>
  );
}
