'use client';

import { useState, useEffect } from 'react';

interface Platform {
  id: string;
  platformName: string;
  customHashtags: string | null;
  isActive: boolean;
  externalUsername?: string | null;
}

export default function PlatformManager() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [platformName, setPlatformName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [customHashtags, setCustomHashtags] = useState('');
  const [message, setMessage] = useState('');
  const [connectingOAuth, setConnectingOAuth] = useState(false);

  useEffect(() => {
    loadPlatforms();
    checkOAuthCallback();
  }, []);

  const checkOAuthCallback = async () => {
    const params = new URLSearchParams(window.location.search);
    const oauthSuccess = params.get('oauth_success');
    const code = params.get('code');
    
    if (oauthSuccess && code) {
      setMessage(`✓ ${oauthSuccess} connected successfully!`);
      // Clear URL parameters
      window.history.replaceState({}, '', '/dashboard');
      loadPlatforms();
    }
  };

  const loadPlatforms = async () => {
    try {
      const response = await fetch('/api/platforms');
      const data = await response.json();

      if (data.platforms) {
        setPlatforms(data.platforms);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load platforms:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('/api/platforms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformName,
          config: {
            apiKey,
            apiSecret,
          },
          customHashtags: customHashtags || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }

      setMessage('✓ Platform added successfully!');
      setPlatformName('');
      setApiKey('');
      setApiSecret('');
      setCustomHashtags('');
      setShowForm(false);
      loadPlatforms();
    } catch (error) {
      setMessage('Failed to add platform. Please try again.');
    }
  };

  const handleOAuthConnect = async (platform: string) => {
    if (platform === 'twitter') {
      setConnectingOAuth(true);
      setMessage('Redirecting to Twitter...');
      
      const clientId = process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/oauth/callback`;
      const state = Math.random().toString(36).substring(7);
      
      // Twitter OAuth 2.0 URL
      const authUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=tweet.read%20tweet.write%20users.read&` +
        `state=${state}&` +
        `code_challenge=challenge&` +
        `code_challenge_method=plain`;
      
      window.location.href = authUrl;
    } else {
      setMessage('This platform requires manual API key setup.');
      setShowForm(true);
      setPlatformName(platform);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Loading platforms...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-elevated rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-header">Platform Integrations</h2>
          <p className="text-sm text-text-muted mt-1">Connect platforms to cross-post your content</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-primary text-text rounded-lg hover:bg-ink-depth transition"
        >
          {showForm ? 'Cancel' : '+ Add Platform'}
        </button>
      </div>

      {/* Quick Connect Section */}
      {showForm && (
        <div className="mb-8 p-6 bg-background-card rounded-lg border border-border">
          <h3 className="text-lg font-medium text-text mb-4">Quick Connect (OAuth)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handleOAuthConnect('twitter')}
              disabled={connectingOAuth}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition disabled:opacity-50"
            >
              <span>🐦</span>
              <span>Connect Twitter/X</span>
            </button>
            <button
              disabled
              className="flex items-center justify-center gap-2 px-4 py-3 bg-charcoal text-text-muted rounded-lg cursor-not-allowed border border-border"
            >
              <span>📸</span>
              <span>Instagram (Coming Soon)</span>
            </button>
          </div>
          <p className="text-xs text-text-muted mt-4">
            ⚠️ Free Twitter tier: 100 API calls/month (~3 posts/day)
          </p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-background-card rounded-lg space-y-4 border border-border">
          <h3 className="text-lg font-medium text-text mb-4">Manual API Setup</h3>
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Platform Name
            </label>
            <select
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-soft-ivory"
              required
            >
              <option value="">Select platform...</option>
              <option value="twitter">Twitter / X</option>
              <option value="onlyfans">OnlyFans</option>
              <option value="instagram">Instagram</option>
              <option value="fansly">Fansly</option>
              <option value="reddit">Reddit</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Custom Hashtags (comma-separated)
            </label>
            <input
              type="text"
              value={customHashtags}
              onChange={(e) => setCustomHashtags(e.target.value)}
              placeholder="#example, #hashtags, #here"
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text"
            />
            <p className="text-xs text-text-muted mt-1">
              These hashtags will be automatically added to posts on this platform
            </p>
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                message.startsWith('✓')
                  ? 'bg-primary/20 border border-accent text-accent'
                  : 'bg-danger/20 border border-danger text-text'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-text py-2 rounded-lg hover:bg-ink-depth transition"
          >
            Add Platform
          </button>
        </form>
      )}

      <div className="space-y-4">
        {platforms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-muted">No platforms connected</p>
            <p className="text-sm text-text-secondary mt-2">
              Add a platform to enable cross-posting
            </p>
          </div>
        ) : (
          platforms.map(platform => (
            <div
              key={platform.id}
              className="bg-background-card rounded-lg p-4 flex justify-between items-center border border-border"
            >
              <div>
                <h3 className="text-text font-medium capitalize">
                  {platform.platformName}
                  {platform.externalUsername && (
                    <span className="text-sm text-text-muted ml-2">
                      @{platform.externalUsername}
                    </span>
                  )}
                </h3>
                {platform.customHashtags && (
                  <p className="text-sm text-text-muted mt-1">
                    Hashtags: {platform.customHashtags}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  platform.isActive
                    ? 'bg-primary text-accent'
                    : 'bg-charcoal text-text-muted'
                }`}
              >
                {platform.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-midnight-blue/30 border border-midnight-blue rounded-lg">
        <p className="text-sm text-text">
          ℹ️ <strong>Note:</strong> API credentials are encrypted and stored securely. 
          Cross-posting functionality requires valid API access from each platform.
        </p>
      </div>
    </div>
  );
}
