'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function PostForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [status, setStatus] = useState<'draft' | 'scheduled'>('draft');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedPath, setUploadedPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'video/*': ['.mp4', '.mov'],
    },
    maxFiles: 1,
  });

  const handleUpload = async (fileToUpload: File) => {
    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Upload failed: ${data.error}`);
        setUploading(false);
        return;
      }

      setUploadedPath(data.filePath);
      setMessage('✓ File uploaded and metadata removed');
      setUploading(false);
    } catch (error) {
      setMessage('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          filePath: uploadedPath || undefined,
          scheduledFor: scheduledFor || undefined,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(`Error: ${data.error}`);
        setLoading(false);
        return;
      }

      setMessage('✓ Post created successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setScheduledFor('');
      setStatus('draft');
      setFile(null);
      setUploadedPath('');
      setLoading(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to create post. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-elevated rounded-lg p-6 border border-border">
      <h2 className="text-2xl font-bold text-text-header mb-6">Create New Post</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-background-card border border-border rounded-lg text-soft-ivory focus:ring-2 focus:ring-primary focus:border-transparent"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-background-card border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Upload Media (Metadata will be removed automatically)
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-primary bg-primary/20'
                : 'border-border bg-background-card hover:border-primary'
            }`}
          >
            <input {...getInputProps()} />
            {uploading ? (
              <p className="text-text-muted">Uploading and removing metadata...</p>
            ) : file ? (
              <div className="text-text">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-text-muted mt-1">Click or drag to replace</p>
              </div>
            ) : (
              <div className="text-text-muted">
                <p>Drag & drop a file here, or click to select</p>
                <p className="text-sm mt-2">Images (JPEG, PNG, GIF, WebP) or Videos (MP4, MOV)</p>
              </div>
            )}
          </div>
          {uploadedPath && (
            <p className="text-sm text-accent mt-2">
              ✓ File secured: {uploadedPath}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Schedule For
            </label>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => {
                setScheduledFor(e.target.value);
                if (e.target.value) setStatus('scheduled');
              }}
              className="w-full px-4 py-2 bg-background-card border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'scheduled')}
              className="w-full px-4 py-2 bg-background-card border border-border rounded-lg text-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
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
          disabled={loading || uploading}
          className="w-full bg-primary text-text py-3 rounded-lg font-medium hover:bg-ink-depth transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}
