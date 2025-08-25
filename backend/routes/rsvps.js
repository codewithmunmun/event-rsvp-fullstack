const express = require('express');
const db = require('../config/database');
const auth = require('../middleware/auth');

const router = express.Router();

// RSVP to event
router.post('/', auth, async (req, res) => {
  try {
    const { event_id, status, guests_count } = req.body;
    
    // Check if event exists
    const event = await db.query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (event.rows.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // Check if user has already RSVP'd
    const existingRsvp = await db.query(
      'SELECT * FROM rsvps WHERE user_id = $1 AND event_id = $2',
      [req.userId, event_id]
    );
    
    if (existingRsvp.rows.length > 0) {
      // Update existing RSVP
      const updatedRsvp = await db.query(
        'UPDATE rsvps SET status = $1, guests_count = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [status, guests_count, existingRsvp.rows[0].id]
      );
      
      return res.json(updatedRsvp.rows[0]);
    }
    
    // Create new RSVP
    const newRsvp = await db.query(
      'INSERT INTO rsvps (user_id, event_id, status, guests_count) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, event_id, status, guests_count]
    );
    
    res.status(201).json(newRsvp.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's RSVPs
router.get('/user', auth, async (req, res) => {
  try {
    const rsvps = await db.query(`
      SELECT r.*, e.title, e.date, e.location, e.image_url 
      FROM rsvps r 
      LEFT JOIN events e ON r.event_id = e.id 
      WHERE r.user_id = $1 
      ORDER BY r.created_at DESC
    `, [req.userId]);
    
    res.json(rsvps.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update RSVP status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, guests_count } = req.body;
    
    // Check if RSVP exists and belongs to user
    const rsvp = await db.query('SELECT * FROM rsvps WHERE id = $1', [req.params.id]);
    if (rsvp.rows.length === 0) {
      return res.status(404).json({ message: 'RSVP not found' });
    }
    
    if (rsvp.rows[0].user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const updatedRsvp = await db.query(
      'UPDATE rsvps SET status = $1, guests_count = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [status, guests_count, req.params.id]
    );
    
    res.json(updatedRsvp.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;