'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ink-depth via-nocturne-black to-midnight-blue p-4">
      <div className="bg-background-elevated rounded-lg shadow-2xl p-8 w-full max-w-md border border-border">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-header mb-2">
            🔒 Secure Platform
          </h1>
          <p className="text-text-muted text-sm">
            Privacy-first content management
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              isLogin
                ? 'bg-primary text-text'
                : 'bg-background-card text-text-muted hover:bg-onyx'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
              !isLogin
                ? 'bg-primary text-text'
                : 'bg-background-card text-text-muted hover:bg-onyx'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 bg-soft-bone-grey border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal placeholder-onyx"
              required
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-soft-bone-grey border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-charcoal placeholder-onyx"
              required
              minLength={isLogin ? 1 : 12}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {!isLogin && (
              <p className="text-xs text-text-muted mt-1">
                Minimum 12 characters
              </p>
            )}
          </div>

          {error && (
            <div className="bg-danger/20 border border-danger text-text px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-text py-3 rounded-lg font-medium hover:bg-ink-depth transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-xs text-text-muted space-y-1">
            <p>✓ End-to-end encryption</p>
            <p>✓ No personal information collected</p>
            <p>✓ Automatic metadata removal</p>
            <p>✓ Emergency delete available</p>
          </div>
        </div>
      </div>
    </main>
  );
}
