'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EmergencyDelete() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleEmergencyDelete = async () => {
    if (confirmText !== 'DELETE EVERYTHING') {
      alert('Please type "DELETE EVERYTHING" to confirm');
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch('/api/emergency-delete', {
        method: 'POST',
      });

      if (response.ok) {
        alert('All your data has been permanently deleted. You will now be logged out.');
        router.push('/');
      } else {
        alert('Emergency delete completed with some errors. You will be logged out.');
        router.push('/');
      }
    } catch (error) {
      alert('An error occurred during emergency delete. Please try again or contact support.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-danger text-text rounded-lg hover:bg-ink-depth transition emergency-delete-btn font-medium border border-danger"
      >
        🚨 Emergency Delete
      </button>

      {showConfirm && (
        <div className="fixed inset-0 bg-ink-depth/90 flex items-center justify-center z-50 p-4">
          <div className="bg-background-elevated rounded-lg p-6 max-w-md w-full border-2 border-danger">
            <h2 className="text-2xl font-bold text-danger mb-4">
              ⚠️ Emergency Delete
            </h2>

            <div className="space-y-4 text-text">
              <p className="font-medium">
                This will IMMEDIATELY and PERMANENTLY delete:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>All your posts and content</li>
                <li>All uploaded media files</li>
                <li>All platform connections</li>
                <li>Your account and profile</li>
                <li>All scheduled posts</li>
              </ul>

              <div className="bg-danger/30 border border-danger rounded p-3 text-sm">
                <p className="text-danger font-bold">
                  THIS CANNOT BE UNDONE
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Type <span className="font-bold text-danger">DELETE EVERYTHING</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-4 py-2 bg-background-card border border-border rounded-lg text-text"
                  placeholder="DELETE EVERYTHING"
                  disabled={deleting}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  setConfirmText('');
                }}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-background-card text-text rounded-lg hover:bg-gunmetal-fade transition disabled:opacity-50 border border-border"
              >
                Cancel
              </button>
              <button
                onClick={handleEmergencyDelete}
                disabled={deleting || confirmText !== 'DELETE EVERYTHING'}
                className="flex-1 px-4 py-2 bg-danger text-text rounded-lg hover:bg-ink-depth transition disabled:opacity-50 font-medium border border-danger"
              >
                {deleting ? 'Deleting...' : 'Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
