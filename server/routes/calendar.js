const express = require('express');
const router = express.Router();
const db = require('../utils/database');
const { authenticateToken } = require('../middleware/auth');

/**
 * Get calendar events for a specific month
 * GET /api/calendar/events?year=2024&month=11
 */
router.get('/events', authenticateToken, (req, res) => {
  const { year, month } = req.query;

  if (!year || !month) {
    return res.status(400).json({ error: 'Year and month required' });
  }

  // Get all events for the specified month
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(year, month, 0); // Last day of month
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${endDate.getDate()}`;

  db.all(
    `SELECT e.*, c.title as content_title, c.status as content_status
     FROM calendar_events e
     LEFT JOIN content c ON e.content_id = c.id
     WHERE e.user_id = ? AND e.event_date >= ? AND e.event_date <= ?
     ORDER BY e.event_date ASC`,
    [req.user.userId, startDate, endDateStr],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch events' });
      }
      res.json({ events: rows });
    }
  );
});

/**
 * Create new calendar event
 * POST /api/calendar/events
 */
router.post('/events', authenticateToken, (req, res) => {
  const { title, description, eventDate, contentId } = req.body;

  if (!title || !eventDate) {
    return res.status(400).json({ error: 'Title and event date required' });
  }

  db.run(
    `INSERT INTO calendar_events (user_id, title, description, event_date, content_id)
     VALUES (?, ?, ?, ?, ?)`,
    [req.user.userId, title, description, eventDate, contentId || null],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to create event' });
      }

      res.status(201).json({
        message: 'Event created successfully',
        eventId: this.lastID
      });
    }
  );
});

/**
 * Update calendar event
 * PUT /api/calendar/events/:id
 */
router.put('/events/:id', authenticateToken, (req, res) => {
  const { title, description, eventDate, contentId } = req.body;

  db.run(
    `UPDATE calendar_events
     SET title = ?, description = ?, event_date = ?, content_id = ?
     WHERE id = ? AND user_id = ?`,
    [title, description, eventDate, contentId || null, req.params.id, req.user.userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update event' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event updated successfully' });
    }
  );
});

/**
 * Delete calendar event
 * DELETE /api/calendar/events/:id
 */
router.delete('/events/:id', authenticateToken, (req, res) => {
  db.run(
    'DELETE FROM calendar_events WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.userId],
    function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to delete event' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }
      res.json({ message: 'Event deleted successfully' });
    }
  );
});

/**
 * Get content scheduled for a specific date
 * GET /api/calendar/scheduled-content?date=2024-11-18
 */
router.get('/scheduled-content', authenticateToken, (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({ error: 'Date required' });
  }

  db.all(
    `SELECT id, title, description, file_type, scheduled_date, status
     FROM content
     WHERE user_id = ? AND DATE(scheduled_date) = DATE(?)
     ORDER BY scheduled_date ASC`,
    [req.user.userId, date],
    (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to fetch scheduled content' });
      }
      res.json({ content: rows });
    }
  );
});

module.exports = router;
