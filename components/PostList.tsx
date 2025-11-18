'use client';

import { useState, useEffect } from 'react';

interface Post {
  id: string;
  title: string;
  description: string | null;
  filePath: string | null;
  scheduledFor: string | null;
  publishedAt: string | null;
  status: string;
  createdAt: string;
  platformPosts: Array<{
    id: string;
    platformName: string;
    status: string;
    postedAt: string | null;
  }>;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'scheduled' | 'published'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();

      if (data.posts) {
        setPosts(data.posts);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This will also delete the associated media file.')) {
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        alert('Failed to delete post');
      }
    } catch (error) {
      alert('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.status === filter;
  });

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-8 text-center">
        <p className="text-gray-400">Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Your Posts</h2>
        
        <div className="flex gap-2">
          {(['all', 'draft', 'scheduled', 'published'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {post.title}
                  </h3>
                  
                  {post.description && (
                    <p className="text-gray-300 text-sm mb-3">
                      {post.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                    <span className={`px-2 py-1 rounded ${
                      post.status === 'published' ? 'bg-green-900 text-green-300' :
                      post.status === 'scheduled' ? 'bg-blue-900 text-blue-300' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {post.status}
                    </span>
                    
                    {post.scheduledFor && (
                      <span>
                        📅 {new Date(post.scheduledFor).toLocaleString()}
                      </span>
                    )}
                    
                    {post.filePath && (
                      <span>📎 Media attached</span>
                    )}
                    
                    {post.platformPosts.length > 0 && (
                      <span>
                        🔗 {post.platformPosts.length} platform{post.platformPosts.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {post.platformPosts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.platformPosts.map(pp => (
                        <span
                          key={pp.id}
                          className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded"
                        >
                          {pp.platformName}: {pp.status}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(post.id)}
                  className="ml-4 px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
