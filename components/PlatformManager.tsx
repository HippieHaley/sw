'use client';

import { useState, useEffect } from 'react';

interface Platform {
  id: string;
  platformName: string;
  customHashtags: string | null;
  isActive: boolean;
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

  useEffect(() => {
    loadPlatforms();
  }, []);

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

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Loading platforms...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Platform Integrations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          {showForm ? 'Cancel' : '+ Add Platform'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-700 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Platform Name
            </label>
            <select
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
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
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Secret
            </label>
            <input
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Hashtags (comma-separated)
            </label>
            <input
              type="text"
              value={customHashtags}
              onChange={(e) => setCustomHashtags(e.target.value)}
              placeholder="#example, #hashtags, #here"
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white"
            />
            <p className="text-xs text-gray-400 mt-1">
              These hashtags will be automatically added to posts on this platform
            </p>
          </div>

          {message && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                message.startsWith('✓')
                  ? 'bg-green-900/50 border border-green-700 text-green-300'
                  : 'bg-red-900/50 border border-red-700 text-red-300'
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Add Platform
          </button>
        </form>
      )}

      <div className="space-y-4">
        {platforms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No platforms connected</p>
            <p className="text-sm text-gray-500 mt-2">
              Add a platform to enable cross-posting
            </p>
          </div>
        ) : (
          platforms.map(platform => (
            <div
              key={platform.id}
              className="bg-gray-700 rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="text-white font-medium capitalize">
                  {platform.platformName}
                </h3>
                {platform.customHashtags && (
                  <p className="text-sm text-gray-400 mt-1">
                    Hashtags: {platform.customHashtags}
                  </p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded text-sm ${
                  platform.isActive
                    ? 'bg-green-900 text-green-300'
                    : 'bg-red-900 text-red-300'
                }`}
              >
                {platform.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
        <p className="text-sm text-blue-300">
          ℹ️ <strong>Note:</strong> API credentials are encrypted and stored securely. 
          Cross-posting functionality requires valid API access from each platform.
        </p>
      </div>
    </div>
  );
}
