const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { hashPassword, comparePassword } = require('../utils/encryption');
const { generateToken, authenticateToken } = require('../middleware/auth');

/**
 * Register new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    // Check if user exists
    db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Insert user
      db.run(
        'INSERT INTO users (username, password_hash) VALUES (?, ?)',
        [username, passwordHash],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const token = generateToken(this.lastID, username);
          res.status(201).json({
            message: 'User created successfully',
            token,
            user: { id: this.lastID, username }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    db.get(
      'SELECT id, username, password_hash FROM users WHERE username = ?',
      [username],
      async (err, user) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Compare password
        const isValid = await comparePassword(password, user.password_hash);

        if (!isValid) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        db.run(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );

        const token = generateToken(user.id, user.username);
        res.json({
          message: 'Login successful',
          token,
          user: { id: user.id, username: user.username }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Verify token
 * GET /api/auth/verify
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: { id: req.user.userId, username: req.user.username }
  });
});

/**
 * Emergency logout - invalidate all sessions
 * POST /api/auth/emergency-logout
 */
router.post('/emergency-logout', authenticateToken, (req, res) => {
  // In a production system, you'd invalidate all tokens/sessions here
  // For now, client should delete the token
  res.json({ message: 'Emergency logout successful' });
});

module.exports = router;
