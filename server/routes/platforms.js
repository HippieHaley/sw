const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');

/**
 * Get all connected platforms
 * GET /api/platforms
 */
router.get('/', authenticateToken, (req, res) => {
  db.all(
    'SELECT id, platform_name, is_active, created_at FROM platform_connections WHERE user_id = ?',
    [req.user.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch platforms' });
      }
      res.json({ platforms: rows });
    }
  );
});

/**
 * Add or update platform connection
 * POST /api/platforms/connect
 */
router.post('/connect', authenticateToken, async (req, res) => {
  const { platformName, credentials } = req.body;

  if (!platformName || !credentials) {
    return res.status(400).json({ error: 'Platform name and credentials required' });
  }

  // Supported platforms
  const supportedPlatforms = ['twitter', 'instagram', 'onlyfans', 'fansly', 'manyvids', 'reddit'];
  
  if (!supportedPlatforms.includes(platformName.toLowerCase())) {
    return res.status(400).json({ 
      error: 'Unsupported platform',
      supported: supportedPlatforms
    });
  }

  try {
    // Encrypt credentials before storing
    const encryptedCredentials = encrypt(JSON.stringify(credentials));

    // Check if connection exists
    db.get(
      'SELECT id FROM platform_connections WHERE user_id = ? AND platform_name = ?',
      [req.user.userId, platformName],
      (err, row) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (row) {
          // Update existing connection
          db.run(
            'UPDATE platform_connections SET encrypted_credentials = ?, is_active = 1 WHERE id = ?',
            [encryptedCredentials, row.id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to update platform' });
              }
              res.json({ message: 'Platform connection updated' });
            }
          );
        } else {
          // Create new connection
          db.run(
            'INSERT INTO platform_connections (user_id, platform_name, encrypted_credentials) VALUES (?, ?, ?)',
            [req.user.userId, platformName, encryptedCredentials],
            function(err) {
              if (err) {
                return res.status(500).json({ error: 'Failed to connect platform' });
              }
              res.status(201).json({
                message: 'Platform connected successfully',
                platformId: this.lastID
              });
            }
          );
        }
      }
    );
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ error: 'Failed to connect platform' });
  }
});

/**
 * Disconnect platform
 * DELETE /api/platforms/:id
 */
router.delete('/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM platform_connections WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to disconnect platform' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Platform not found' });
      }
      res.json({ message: 'Platform disconnected successfully' });
    }
  );
});

/**
 * Get hashtags for a platform
 * GET /api/platforms/:platformName/hashtags
 */
router.get('/:platformName/hashtags', authenticateToken, (req, res) => {
  db.get(
    'SELECT hashtags, updated_at FROM platform_hashtags WHERE user_id = ? AND platform_name = ?',
    [req.user.userId, req.params.platformName],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch hashtags' });
      }
      
      if (!row) {
        return res.json({ hashtags: [] });
      }

      try {
        const hashtags = JSON.parse(row.hashtags || '[]');
        res.json({ hashtags, updatedAt: row.updated_at });
      } catch (error) {
        res.json({ hashtags: [] });
      }
    }
  );
});

/**
 * Set hashtags for a platform
 * POST /api/platforms/:platformName/hashtags
 */
router.post('/:platformName/hashtags', authenticateToken, (req, res) => {
  const { hashtags } = req.body;

  if (!Array.isArray(hashtags)) {
    return res.status(400).json({ error: 'Hashtags must be an array' });
  }

  const hashtagsJson = JSON.stringify(hashtags);

  // Check if hashtags exist for this platform
  db.get(
    'SELECT id FROM platform_hashtags WHERE user_id = ? AND platform_name = ?',
    [req.user.userId, req.params.platformName],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        // Update existing hashtags
        db.run(
          'UPDATE platform_hashtags SET hashtags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [hashtagsJson, row.id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to update hashtags' });
            }
            res.json({ message: 'Hashtags updated successfully' });
          }
        );
      } else {
        // Create new hashtags entry
        db.run(
          'INSERT INTO platform_hashtags (user_id, platform_name, hashtags) VALUES (?, ?, ?)',
          [req.user.userId, req.params.platformName, hashtagsJson],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to save hashtags' });
            }
            res.status(201).json({ message: 'Hashtags saved successfully' });
          }
        );
      }
    }
  );
});

/**
 * Cross-post content to connected platforms
 * POST /api/platforms/cross-post
 */
router.post('/cross-post', authenticateToken, (req, res) => {
  const { contentId, platforms, customCaptions } = req.body;

  if (!contentId || !platforms || !Array.isArray(platforms)) {
    return res.status(400).json({ error: 'Content ID and platforms array required' });
  }

  // Get content details
  db.get(
    'SELECT * FROM content WHERE id = ? AND user_id = ?',
    [contentId, req.user.userId],
    (err, content) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }

      // Get platform connections
      db.all(
        'SELECT platform_name, encrypted_credentials FROM platform_connections WHERE user_id = ? AND is_active = 1',
        [req.user.userId],
        (err, connections) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch connections' });
          }

          // This is a placeholder for actual cross-posting logic
          // In a real implementation, you would:
          // 1. Decrypt credentials for each platform
          // 2. Use platform APIs to post content
          // 3. Apply platform-specific hashtags
          // 4. Handle rate limiting and errors

          const results = platforms.map(platform => ({
            platform,
            status: 'simulated',
            message: `Would post to ${platform} (API integration required)`
          }));

          res.json({
            message: 'Cross-posting initiated (simulation mode)',
            results,
            note: 'Full API integration requires platform-specific API keys and implementations'
          });
        }
      );
    }
  );
});

module.exports = router;
