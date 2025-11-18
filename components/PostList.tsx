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
  const [posting, setPosting] = useState<string | null>(null);

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

  const handlePostToTwitter = async (postId: string) => {
    if (!confirm('Post this to Twitter? This will count towards your 100 monthly API calls.')) {
      return;
    }

    setPosting(postId);
    try {
      const response = await fetch('/api/platforms/twitter/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✓ Posted to Twitter! View: ${data.tweetUrl}`);
        loadPosts(); // Refresh to show updated status
      } else {
        alert(`Failed: ${data.error}`);
      }
    } catch (error) {
      alert('Failed to post to Twitter');
    } finally {
      setPosting(null);
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
    <div className="bg-background-elevated rounded-lg p-6 border border-border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-header">Your Posts</h2>
        
        <div className="flex gap-2">
          {(['all', 'draft', 'scheduled', 'published'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                filter === f
                  ? 'bg-primary text-text'
                  : 'bg-background-card text-text-muted hover:bg-gunmetal-fade'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No posts found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="bg-background-card rounded-lg p-4 hover:bg-gunmetal-fade transition border border-border"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-text mb-2">
                    {post.title}
                  </h3>
                  
                  {post.description && (
                    <p className="text-text text-sm mb-3">
                      {post.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                    <span className={`px-2 py-1 rounded ${
                      post.status === 'published' ? 'bg-primary text-accent' :
                      post.status === 'scheduled' ? 'bg-midnight-blue text-text' :
                      'bg-charcoal text-text-muted'
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
                          className="text-xs px-2 py-1 bg-charcoal text-text-muted rounded border border-border"
                        >
                          {pp.platformName}: {pp.status}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ml-4 flex flex-col gap-2">
                  {post.status !== 'published' && (
                    <button
                      onClick={() => handlePostToTwitter(post.id)}
                      disabled={posting === post.id}
                      className="px-3 py-1 text-sm bg-[#1DA1F2] text-white rounded hover:bg-[#1a8cd8] transition disabled:opacity-50 whitespace-nowrap"
                    >
                      {posting === post.id ? 'Posting...' : '🐦 Post to Twitter'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="px-3 py-1 text-sm text-danger hover:text-text hover:bg-danger/20 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
