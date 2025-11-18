const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const db = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { scrubMetadata } = require('../utils/metadataScrubber');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate random filename to avoid exposing original names
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

/**
 * Upload content with metadata scrubbing
 * POST /api/content/upload
 */
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Scrub metadata from uploaded file
    await scrubMetadata(req.file.path);

    const { title, description, scheduledDate } = req.body;

    db.run(
      `INSERT INTO content (user_id, title, description, file_path, file_type, scheduled_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.userId,
        title || '',
        description || '',
        req.file.path,
        req.file.mimetype,
        scheduledDate || null,
        scheduledDate ? 'scheduled' : 'draft'
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to save content' });
        }

        res.status(201).json({
          message: 'Content uploaded successfully (metadata scrubbed)',
          contentId: this.lastID,
          file: {
            filename: req.file.filename,
            size: req.file.size,
            type: req.file.mimetype
          }
        });
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    // Clean up file on error
    try {
      await fs.unlink(req.file.path);
    } catch (unlinkError) {
      console.error('Failed to delete file:', unlinkError);
    }
    res.status(500).json({ error: 'Failed to process upload' });
  }
});

/**
 * Get all content for user
 * GET /api/content
 */
router.get('/', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, title, description, file_type, scheduled_date, status, created_at FROM content WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch content' });
      }
      res.json({ content: rows });
    }
  );
});

/**
 * Get single content item
 * GET /api/content/:id
 */
router.get('/:id', authenticateToken, (req, res) => {
  db.get(
    'SELECT * FROM content WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json({ content: row });
    }
  );
});

/**
 * Update content
 * PUT /api/content/:id
 */
router.put('/:id', authenticateToken, (req, res) => {
  const { title, description, scheduledDate, status } = req.body;

  db.run(
    `UPDATE content 
     SET title = ?, description = ?, scheduled_date = ?, status = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [title, description, scheduledDate, status, req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to update content' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json({ message: 'Content updated successfully' });
    }
  );
});

/**
 * Delete single content item
 * DELETE /api/content/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get file path first
    db.get(
      'SELECT file_path FROM content WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId],
      async (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Content not found' });
        }

        // Delete file
        if (row.file_path) {
          try {
            await fs.unlink(row.file_path);
          } catch (unlinkError) {
            console.error('Failed to delete file:', unlinkError);
          }
        }

        // Delete from database
        db.run(
          'DELETE FROM content WHERE id = ? AND user_id = ?',
          [req.params.id, req.user.userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to delete content' });
            }
            res.json({ message: 'Content deleted successfully' });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

/**
 * EMERGENCY DELETE - Delete all content immediately
 * POST /api/content/emergency-delete
 */
router.post('/emergency-delete', authenticateToken, async (req, res) => {
  try {
    // Get all files for this user
    db.all(
      'SELECT file_path FROM content WHERE user_id = ?',
      [req.user.userId],
      async (err, rows) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Delete all files
        const deletePromises = rows.map(row => {
          if (row.file_path) {
            return fs.unlink(row.file_path).catch(err => {
              console.error('Failed to delete file:', err);
            });
          }
        });

        await Promise.all(deletePromises);

        // Delete all content from database
        db.run(
          'DELETE FROM content WHERE user_id = ?',
          [req.user.userId],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to delete content' });
            }
            res.json({
              message: 'All content deleted successfully',
              deletedCount: this.changes
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Emergency delete error:', error);
    res.status(500).json({ error: 'Emergency delete failed' });
  }
});

module.exports = router;
